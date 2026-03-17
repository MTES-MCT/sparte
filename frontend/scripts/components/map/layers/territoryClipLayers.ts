/**
 * Couches WebGL personnalisées pour clipper les données cartographiques à l'emprise du territoire.
 *
 * Principe :
 *   1. OrthoSnapshotLayer capture le framebuffer (orthophoto seule) dans une texture.
 *   2. Les couches de données (OCS GE, zonages) sont rendues normalement par MapLibre.
 *   3. TerritoryClipLayer dessine le polygone du territoire dans un FBO de masque,
 *      puis compose : en dehors du territoire → affiche l'orthophoto capturée (couvre les données) ;
 *      à l'intérieur du territoire → discard (laisse les données visibles).
 *   4. L'emprise (contour) est dessinée par-dessus par MapLibre.
 *
 * Ordre des couches dans MapLibre :
 *   orthophoto → ortho-snapshot → données (OCS GE, zonages) → territory-clip → emprise
 */

import type maplibregl from "maplibre-gl";
import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { fetchLandFullGeom } from "@services/fetchers";
import type { LandDetailResultType } from "@services/types/land";
import type { Position } from "geojson";
import earcut from "earcut";

// ─── Utilitaires géométriques ───────────────────────────────────────

/**
 * Extrait tous les anneaux (extérieur + trous) de chaque polygone d'une géométrie GeoJSON.
 * Supporte : Polygon, MultiPolygon, Feature, FeatureCollection.
 * Retourne un tableau de polygones, chaque polygone étant un tableau d'anneaux (Position[][]).
 */
function extractPolygonRings(geom: any): Position[][][] {
    const polygons: Position[][][] = [];
    if (geom.type === "Polygon") {
        polygons.push(geom.coordinates);
    } else if (geom.type === "MultiPolygon") {
        for (const poly of geom.coordinates) {
            polygons.push(poly);
        }
    } else if (geom.type === "FeatureCollection") {
        for (const f of geom.features) extractPolygonRings(f.geometry).forEach(p => polygons.push(p));
    } else if (geom.type === "Feature") {
        extractPolygonRings(geom.geometry).forEach(p => polygons.push(p));
    }
    return polygons;
}

/**
 * Triangule la géométrie du territoire en un tableau de sommets (lng, lat)
 * prêts à être envoyés au GPU. Utilise earcut pour gérer les trous.
 */
function triangulateTerritoryPolygon(geom: any): Float32Array {
    const polygons = extractPolygonRings(geom);
    const allVertices: number[] = [];

    for (const rings of polygons) {
        // Aplatir les coordonnées et identifier les indices de début des trous
        const flat: number[] = [];
        const holeIndices: number[] = [];

        for (let i = 0; i < rings.length; i++) {
            if (i > 0) holeIndices.push(flat.length / 2);
            for (const coord of rings[i]) {
                flat.push(coord[0], coord[1]);
            }
        }

        const indices = earcut(flat, holeIndices.length > 0 ? holeIndices : undefined, 2);
        for (const idx of indices) {
            allVertices.push(flat[idx * 2], flat[idx * 2 + 1]);
        }
    }

    return new Float32Array(allVertices);
}

// ─── État partagé entre les deux couches ────────────────────────────

/** Emplacements uniformes/attributs mis en cache à l'initialisation pour éviter les lookups par frame. */
interface CachedLocations {
    polyMatrixLoc: WebGLUniformLocation | null;
    polyWorldSizeLoc: WebGLUniformLocation | null;
    polyPosLoc: number;
    compOrthoLoc: WebGLUniformLocation | null;
    compMaskLoc: WebGLUniformLocation | null;
    compPosLoc: number;
}

/** État GPU partagé entre OrthoSnapshotLayer et TerritoryClipLayer. */
interface SharedClipState {
    orthoTexture: WebGLTexture | null;       // Capture du framebuffer orthophoto
    maskTexture: WebGLTexture | null;        // Texture du masque territoire (blanc = intérieur)
    maskFBO: WebGLFramebuffer | null;        // FBO pour le rendu du masque
    quadBuffer: WebGLBuffer | null;          // Buffer du quad plein écran (2 triangles)
    compProgram: WebGLProgram | null;        // Programme shader de composition
    polyProgram: WebGLProgram | null;        // Programme shader du polygone territoire
    polyBuffer: WebGLBuffer | null;          // Buffer des sommets triangulés du territoire
    polyVertexCount: number;                 // Nombre de sommets du polygone
    pendingVertices: Float32Array | null;    // Sommets en attente d'upload GPU
    initialized: boolean;
    texWidth: number;
    texHeight: number;
    map: maplibregl.Map | null;
    locations: CachedLocations | null;
    matrixBuf: Float32Array;                 // Buffer réutilisé pour la matrice (évite les allocations par frame)
}

// ─── Utilitaires WebGL ──────────────────────────────────────────────

/** Compile un shader GLSL et lève une erreur en cas d'échec. */
function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Erreur compilation shader : ${info}`);
    }
    return shader;
}

/** Compile et lie un programme shader (vertex + fragment). */
function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw new Error(`Erreur liaison programme : ${info}`);
    }
    return program;
}

/** Crée une texture 2D avec filtrage linéaire et clamping aux bords. */
function createTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
}

// ─── Shaders GLSL ───────────────────────────────────────────────────

/**
 * Vertex shader du polygone territoire :
 * Convertit les coordonnées lng/lat en pixels monde Mercator (512 * 2^zoom),
 * puis applique la matrice de projection de MapLibre v5.
 */
const POLY_VS = `
uniform mat4 u_matrix;
uniform float u_worldSize;
attribute vec2 a_pos;
const float PI = 3.14159265;
void main() {
    float x = (a_pos.x + 180.0) / 360.0;
    float lat_rad = a_pos.y * PI / 180.0;
    float y = (1.0 - log(tan(PI / 4.0 + lat_rad / 2.0)) / PI) / 2.0;
    gl_Position = u_matrix * vec4(x * u_worldSize, y * u_worldSize, 0.0, 1.0);
}`;

/** Fragment shader du polygone : blanc opaque (sert de masque binaire). */
const POLY_FS = `
precision mediump float;
void main() {
    gl_FragColor = vec4(1.0);
}`;

/** Vertex shader du quad plein écran : convertit les positions [-1,1] en coordonnées UV [0,1]. */
const COMP_VS = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/**
 * Fragment shader de composition :
 * - En dehors du territoire (masque noir) → affiche l'orthophoto capturée, couvrant les données
 * - À l'intérieur du territoire (masque blanc) → discard, laisse le framebuffer intact (données visibles)
 *
 * MapLibre utilise l'alpha prémultiplié : gl.blendFunc(ONE, ONE_MINUS_SRC_ALPHA)
 * L'ortho est opaque (alpha=1), donc elle remplace complètement le framebuffer en dehors.
 */
const COMP_FS = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_ortho;
uniform sampler2D u_mask;
void main() {
    float inside = texture2D(u_mask, v_uv).r;
    if (inside > 0.5) {
        discard;
    }
    gl_FragColor = texture2D(u_ortho, v_uv);
}`;

// ─── OrthoSnapshotLayer ─────────────────────────────────────────────

/**
 * Couche personnalisée MapLibre placée juste après l'orthophoto.
 * À chaque frame, capture le framebuffer actuel (qui ne contient que l'ortho)
 * dans une texture via copyTexSubImage2D.
 * Initialise aussi toutes les ressources GPU partagées (textures, FBO, programmes, buffers).
 */
export class OrthoSnapshotLayer implements CustomLayerInterface {
    id = "ortho-snapshot-layer";
    type = "custom" as const;
    renderingMode = "2d" as const;

    private state: SharedClipState;

    constructor(state: SharedClipState) {
        this.state = state;
    }

    /** Initialisation des ressources GPU lors de l'ajout à la carte. */
    onAdd(map: maplibregl.Map, gl: WebGL2RenderingContext) {
        this.state.map = map;

        const canvas = gl.canvas as HTMLCanvasElement;
        const w = canvas.width;
        const h = canvas.height;

        // Texture de capture orthophoto
        this.state.orthoTexture = createTexture(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Buffer du quad plein écran (partagé avec TerritoryClipLayer)
        this.state.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.state.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1,
        ]), gl.STATIC_DRAW);

        // Compilation des programmes shader
        this.state.compProgram = createProgram(gl, COMP_VS, COMP_FS);
        this.state.polyProgram = createProgram(gl, POLY_VS, POLY_FS);

        // Mise en cache des emplacements uniformes/attributs (évite les lookups par frame)
        this.state.locations = {
            polyMatrixLoc: gl.getUniformLocation(this.state.polyProgram, "u_matrix"),
            polyWorldSizeLoc: gl.getUniformLocation(this.state.polyProgram, "u_worldSize"),
            polyPosLoc: gl.getAttribLocation(this.state.polyProgram, "a_pos"),
            compOrthoLoc: gl.getUniformLocation(this.state.compProgram, "u_ortho"),
            compMaskLoc: gl.getUniformLocation(this.state.compProgram, "u_mask"),
            compPosLoc: gl.getAttribLocation(this.state.compProgram, "a_pos"),
        };

        // Texture et FBO pour le masque du territoire
        this.state.maskTexture = createTexture(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        this.state.maskFBO = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.state.maskFBO);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.state.maskTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.state.texWidth = w;
        this.state.texHeight = h;
        this.state.initialized = true;
    }

    /** Libération des ressources GPU lors du retrait de la couche. */
    onRemove(_map: maplibregl.Map, gl: WebGL2RenderingContext) {
        if (this.state.orthoTexture) gl.deleteTexture(this.state.orthoTexture);
        if (this.state.maskTexture) gl.deleteTexture(this.state.maskTexture);
        if (this.state.maskFBO) gl.deleteFramebuffer(this.state.maskFBO);
        if (this.state.quadBuffer) gl.deleteBuffer(this.state.quadBuffer);
        if (this.state.polyBuffer) gl.deleteBuffer(this.state.polyBuffer);
        if (this.state.compProgram) gl.deleteProgram(this.state.compProgram);
        if (this.state.polyProgram) gl.deleteProgram(this.state.polyProgram);
        this.state.initialized = false;
    }

    /** Redimensionne les textures si le canvas a changé de taille (resize, DPI). */
    private ensureTextureSize(gl: WebGL2RenderingContext) {
        const canvas = gl.canvas as HTMLCanvasElement;
        const w = canvas.width;
        const h = canvas.height;
        if (w === this.state.texWidth && h === this.state.texHeight) return;

        gl.bindTexture(gl.TEXTURE_2D, this.state.orthoTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindTexture(gl.TEXTURE_2D, this.state.maskTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.state.maskFBO);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.state.maskTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.state.texWidth = w;
        this.state.texHeight = h;
    }

    /** Appelé à chaque frame par MapLibre. Copie le framebuffer (orthophoto) dans la texture. */
    render(gl: WebGL2RenderingContext, _options: CustomRenderMethodInput) {
        if (!this.state.initialized || !this.state.orthoTexture) return;

        this.ensureTextureSize(gl);

        const w = this.state.texWidth;
        const h = this.state.texHeight;

        gl.bindTexture(gl.TEXTURE_2D, this.state.orthoTexture);
        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, w, h);
    }
}

// ─── TerritoryClipLayer ─────────────────────────────────────────────

/**
 * Couche personnalisée MapLibre placée après les données et avant l'emprise.
 * À chaque frame :
 *   Étape 1 — Dessine le polygone du territoire dans le FBO de masque (blanc = intérieur).
 *   Étape 2 — Compose sur le framebuffer principal : en dehors → orthophoto, dedans → discard.
 * Résultat : les couches de données ne sont visibles qu'à l'intérieur de l'emprise.
 */
export class TerritoryClipLayer implements CustomLayerInterface {
    id = "territory-clip-layer";
    type = "custom" as const;
    renderingMode = "2d" as const;

    private state: SharedClipState;

    constructor(state: SharedClipState) {
        this.state = state;
    }

    onAdd(_map: maplibregl.Map, _gl: WebGL2RenderingContext) {}

    /** Upload les sommets triangulés vers le GPU dès que le contexte GL est disponible. */
    private uploadPendingVertices(gl: WebGL2RenderingContext) {
        if (!this.state.pendingVertices || !this.state.initialized) return;
        this.state.polyBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.state.polyBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.state.pendingVertices, gl.STATIC_DRAW);
        this.state.pendingVertices = null;
    }

    /** Appelé à chaque frame par MapLibre. */
    render(gl: WebGL2RenderingContext, options: CustomRenderMethodInput) {
        this.uploadPendingVertices(gl);

        if (!this.state.initialized || !this.state.orthoTexture || !this.state.polyBuffer) return;
        if (this.state.polyVertexCount === 0) return;
        if (this.state.texWidth === 0 || this.state.texHeight === 0) return;

        const loc = this.state.locations!;

        // ── Étape 1 : Dessiner le polygone territoire dans le FBO de masque ──
        const prevFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        const prevViewport = gl.getParameter(gl.VIEWPORT) as Int32Array;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.state.maskFBO);
        gl.viewport(0, 0, this.state.texWidth, this.state.texHeight);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);

        gl.useProgram(this.state.polyProgram);
        this.state.matrixBuf.set(options.modelViewProjectionMatrix);
        gl.uniformMatrix4fv(loc.polyMatrixLoc, false, this.state.matrixBuf);

        // worldSize = 512 * 2^zoom : convertit les coordonnées Mercator [0,1] en pixels monde
        const zoom = this.state.map?.getZoom() ?? 0;
        gl.uniform1f(loc.polyWorldSizeLoc, 512 * Math.pow(2, zoom));

        gl.bindBuffer(gl.ARRAY_BUFFER, this.state.polyBuffer);
        gl.enableVertexAttribArray(loc.polyPosLoc);
        gl.vertexAttribPointer(loc.polyPosLoc, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.state.polyVertexCount);
        gl.disableVertexAttribArray(loc.polyPosLoc);

        // ── Étape 2 : Restaurer le FBO principal et composer ──
        gl.bindFramebuffer(gl.FRAMEBUFFER, prevFBO);
        gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3]);

        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(this.state.compProgram);

        // Texture orthophoto sur l'unité 0
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.state.orthoTexture);
        gl.uniform1i(loc.compOrthoLoc, 0);

        // Texture masque sur l'unité 1
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.state.maskTexture);
        gl.uniform1i(loc.compMaskLoc, 1);

        // Dessiner le quad plein écran
        gl.bindBuffer(gl.ARRAY_BUFFER, this.state.quadBuffer);
        gl.enableVertexAttribArray(loc.compPosLoc);
        gl.vertexAttribPointer(loc.compPosLoc, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.disableVertexAttribArray(loc.compPosLoc);

        // Restaurer le blend mode attendu par MapLibre
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
}

// ─── Factory ─────────────────────────────────────────────────────────

export interface TerritoryClipPair {
    snapshotLayer: OrthoSnapshotLayer;
    clipLayer: TerritoryClipLayer;
    /** Charge la géométrie du territoire depuis l'API et la triangule. */
    loadGeometry: () => Promise<void>;
}

/**
 * Crée la paire de couches de clipping pour un territoire donné.
 * Utilisation :
 *   const clip = createTerritoryClipLayers(landData);
 *   await clip.loadGeometry();
 *   map.addLayer(clip.snapshotLayer, premièreCoucheDeDonnées);
 *   map.addLayer(clip.clipLayer, "emprise-layer");
 */
export function createTerritoryClipLayers(landData: LandDetailResultType): TerritoryClipPair {
    const state: SharedClipState = {
        orthoTexture: null,
        maskTexture: null,
        maskFBO: null,
        quadBuffer: null,
        compProgram: null,
        polyProgram: null,
        polyBuffer: null,
        polyVertexCount: 0,
        pendingVertices: null,
        initialized: false,
        texWidth: 0,
        texHeight: 0,
        map: null,
        locations: null,
        matrixBuf: new Float32Array(16),
    };

    const snapshotLayer = new OrthoSnapshotLayer(state);
    const clipLayer = new TerritoryClipLayer(state);

    const loadGeometry = async () => {
        const { geom } = await fetchLandFullGeom(landData.land_type, landData.land_id);
        const vertices = triangulateTerritoryPolygon(geom);
        state.polyVertexCount = vertices.length / 2;
        state.pendingVertices = vertices;
    };

    return { snapshotLayer, clipLayer, loadGeometry };
}

// Socle des cartes MapLibre de la carte nationale (mailles, communes du pays) : ce qu'elles
// partagent, pour qu'elles se créent, se cadrent et se redimensionnent de la même façon. Seul ce
// fichier charge MapLibre et le protocole pmtiles ; les moteurs ne reçoivent que la carte créée.
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import * as maplibregl from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import { FRENCH_LOCALE } from '@components/map/constants/config';
import type { Bounds } from '../../gridded';
import { TipSource, tipOf } from '../../domain/tip';
import { STACK_BREAKPOINT } from '../../layoutStyles';
import { TERRITORY_COLOR } from './territoryOptions';
import { TIP_OFFSET_PX, tipBubbleStyles, tipMarkup } from './tipView';

// Ce qu'un moteur MapLibre annonce de son dessin au composant qui le monte
export type StageMapStatus = {
    // Ce que la carte a reçu est dessiné, ou ne le sera pas (erreur, tuiles absentes) : elle peut
    // prendre la place de la carte affichée, elle n'est pas attendue indéfiniment
    ready: boolean;
    // Des tuiles sont en cours de chargement
    loading: boolean;
    // Message à afficher sur la carte quand ses données ne peuvent pas l'être
    notice: string | null;
};

// Classe des étiquettes posées sur la carte (noms des territoires d'outre-mer)
const LABEL_CLASS = 'national-map-label';
// Classe du repère posé sur le point touché
const TOUCH_MARK_CLASS = 'national-map-touch-mark';

// Conteneur d'une carte. L'atténuation de chargement se donne en style en ligne : une classe qui
// changerait avec elle ferait réécrire l'attribut class du conteneur, et perdre celles que
// MapLibre y a posées.
export const MapContainer = styled.div`
    position: absolute;
    inset: 0;
    transition: opacity 0.2s;

    /* Infobulle de ce que le pointeur survole : MapLibre la place, sans y dessiner son cadre ni
       sa pointe ; son apparence est celle de toutes les cartes (voir tipView) */
    .maplibregl-popup {
        pointer-events: none;
    }

    .maplibregl-popup-content {
        padding: 0;
        background: none;
        border-radius: 0;
        box-shadow: none;
        pointer-events: none;
    }

    .maplibregl-popup-tip {
        display: none;
    }

    ${tipBubbleStyles}

    /* Repère du point touché, dont la fiche donne la lecture */
    .${TOUCH_MARK_CLASS} {
        box-sizing: border-box;
        width: 22px;
        height: 22px;
        border: 3px solid #1a1a1a;
        border-radius: 50%;
        box-shadow:
            0 0 0 2px #ffffff,
            inset 0 0 0 2px #ffffff;
        pointer-events: none;
    }

    /* Écart au point d'ancrage : celui des étiquettes de la carte par territoire */
    .${LABEL_CLASS} {
        font-family: Marianne, arial, sans-serif;
        font-size: 0.8rem;
        font-weight: 600;
        line-height: 1.2;
        white-space: nowrap;
        color: ${TERRITORY_COLOR};
        pointer-events: none;

        &[data-anchor='bottom'] {
            padding-bottom: 7px;
        }

        &[data-anchor='right'] {
            padding-right: 8px;
        }
    }
`;

// Le protocole pmtiles:// est partagé avec les cartes des diagnostics : un enregistrement suffit
let protocol: Protocol | null = null;
const pmtilesProtocol = (): Protocol => {
    if (!protocol) {
        protocol = new Protocol();
        maplibregl.addProtocol('pmtiles', protocol.tile);
    }
    return protocol;
};

// Présence de chaque fichier de tuiles (son en-tête se lit), vérifiée une seule fois par adresse
const availability = new Map<string, Promise<boolean>>();
const isAvailable = (url: string): Promise<boolean> => {
    if (!availability.has(url)) {
        const archive = new PMTiles(url);
        pmtilesProtocol().add(archive);
        availability.set(url, archive.getHeader().then(() => true, () => false));
    }
    return availability.get(url) as Promise<boolean>;
};

// Prépare ce qu'une carte attendrait à sa création, pendant que les données de sa vue chargent :
// les fils d'exécution de MapLibre, que le navigateur met une à deux secondes à démarrer sur un
// poste chargé, et l'en-tête de son fichier de tuiles quand son adresse est connue
export const prepareStageMap = (tilesUrl: string | null): void => {
    maplibregl.prewarm();
    if (tilesUrl) void isAvailable(tilesUrl);
};

// Présence du fichier de tuiles d'une adresse ; null tant qu'elle n'est pas connue, ou sans adresse
export const useTilesAvailability = (url: string | null): boolean | null => {
    const [known, setKnown] = useState<{ url: string; value: boolean } | null>(null);
    useEffect(() => {
        if (!url) return undefined;
        let cancelled = false;
        // isAvailable ne rejette jamais : un fichier illisible vaut « absent »
        void isAvailable(url).then((value) => {
            if (!cancelled) setKnown({ url, value });
        });
        return () => {
            cancelled = true;
        };
    }, [url]);
    return known?.url === url ? known.value : null;
};

// Présence de plusieurs fichiers de tuiles, par adresse ; une adresse dont la présence n'est pas
// encore connue n'y figure pas. `urls` doit garder son identité d'un rendu à l'autre.
export const useTilesAvailabilities = (urls: string[]): Record<string, boolean> => {
    const [known, setKnown] = useState<Record<string, boolean>>({});
    useEffect(() => {
        let cancelled = false;
        urls.forEach((url) =>
            isAvailable(url).then((value) => {
                if (!cancelled) setKnown((current) => (current[url] === value ? current : { ...current, [url]: value }));
            }),
        );
        return () => {
            cancelled = true;
        };
    }, [urls]);
    return known;
};

// Largeurs de fenêtre où la colonne passe sous la carte : la page défile alors sous elle
const SCROLLING_PAGE = `(max-width: ${STACK_BREAKPOINT})`;

// Fond de la carte, là où rien n'est dessiné
export const STAGE_BACKGROUND_COLOR = '#ffffff';

type StageMapOptions = {
    // Coin des boutons de zoom
    controls: maplibregl.ControlPosition;
    maxZoom?: number;
};

// Carte vide sur fond blanc, sans rotation ni inclinaison, avec ses boutons de zoom. Quand la page
// défile sous la carte, les gestes sont coopératifs : la molette et un doigt font défiler la page,
// Ctrl + molette et deux doigts déplacent la carte. Quand la carte tient dans la fenêtre, rien ne
// défile : la molette zoome directement. null si le navigateur ne peut pas la créer (WebGL absent).
export const createStageMap = (container: HTMLElement, { controls, maxZoom }: StageMapOptions): maplibregl.Map | null => {
    pmtilesProtocol();
    const scrollingPage = window.matchMedia(SCROLLING_PAGE);
    let map: maplibregl.Map;
    try {
        map = new maplibregl.Map({
            container,
            style: { version: 8, sources: {}, layers: [{ id: 'background', type: 'background', paint: { 'background-color': STAGE_BACKGROUND_COLOR } }] },
            maplibreLogo: false,
            attributionControl: false,
            fadeDuration: 0,
            cooperativeGestures: scrollingPage.matches,
            // La taille est suivie par followContainerSize, qui signe ses changements : le suivi de
            // MapLibre déplacerait la carte sans le dire, comme le ferait l'utilisateur
            trackResize: false,
            dragRotate: false,
            pitchWithRotate: false,
            touchPitch: false,
            locale: FRENCH_LOCALE,
            maxZoom,
        });
    } catch {
        return null;
    }
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), controls);
    const followPageScrolling = ({ matches }: MediaQueryListEvent) => (matches ? map.cooperativeGestures.enable() : map.cooperativeGestures.disable());
    scrollingPage.addEventListener('change', followPageScrolling);
    map.once('remove', () => scrollingPage.removeEventListener('change', followPageScrolling));
    return map;
};

// Marge laissée autour de l'emprise cadrée, en pixels, quand le moteur n'en demande pas d'autre
const FIT_PADDING = 24;

type FitOptions = {
    padding?: number | maplibregl.PaddingOptions;
    // Durée du déplacement ; sans elle, la carte est cadrée d'un coup
    durationMs?: number;
};

// Signature des déplacements que la page fait elle-même (cadrage, nouvelle taille), jointe à leurs
// événements. Tout autre déplacement vient de l'utilisateur. Le geste ne se reconnaît pas à
// l'événement du navigateur qu'il porterait : un cran de molette isolé n'en porte pas.
const OWN_MOVE = { nationalMapOwnMove: true };
// Cartes dont le plancher de zoom est en train d'être posé : s'il déplace la carte, MapLibre
// l'annonce sans que l'on puisse y joindre la signature
const framing = new WeakSet<maplibregl.Map>();

// Cadre la carte sur une emprise. Le zoom arrière s'arrête à cette vue : en deçà, la carte
// chargerait les tuiles de petite échelle, plus lourdes, pour n'y montrer que du blanc.
export const fitStageMap = (map: maplibregl.Map, bounds: Bounds, { padding = FIT_PADDING, durationMs = 0 }: FitOptions = {}): void => {
    // Sans zoom calculable : la carte n'a pas de taille (masquée), elle sera cadrée à son retour
    const camera = map.cameraForBounds(bounds, { padding });
    const zoom = camera?.zoom;
    if (!camera || !Number.isFinite(zoom)) return;
    // Le plancher de zoom est posé avant le déplacement : les boutons de zoom, qui ne se mettent
    // à jour qu'aux changements de zoom, le trouvent en place à l'arrivée. Relever le plancher
    // amène aussitôt la carte à ce zoom : seul un cadrage qui s'éloigne peut être progressif.
    const gradual = durationMs > 0 && zoom <= map.getZoom();
    framing.add(map);
    map.setMinZoom(zoom);
    framing.delete(map);
    if (gradual) map.easeTo({ ...camera, duration: durationMs }, OWN_MOVE);
    else map.jumpTo(camera, OWN_MOVE);
};

// Appelle `onMoved` à la fin de chaque déplacement de la carte par l'utilisateur : glisser, molette,
// pincement, double clic, clavier, boutons de zoom. Rend de quoi arrêter le suivi.
export const followUserMoves = (map: maplibregl.Map, onMoved: () => void): (() => void) => {
    const listener = (event: object) => {
        if (framing.has(map) || 'nationalMapOwnMove' in event) return;
        onMoved();
    };
    map.on('moveend', listener);
    return () => {
        map.off('moveend', listener);
    };
};

// Suit la taille du conteneur de la carte (panneau latéral, onglets mobiles, rotation de l'écran) :
// la carte prend sa nouvelle taille, puis `onResized` est appelé. Rend de quoi arrêter le suivi.
export const followContainerSize = (container: HTMLElement, map: maplibregl.Map, onResized: () => void): (() => void) => {
    if (typeof ResizeObserver === 'undefined') return () => undefined;
    const observer = new ResizeObserver(([entry]) => {
        // Sans largeur ou sans hauteur : la carte est masquée (onglet Informations sur mobile)
        if (entry.contentRect.width === 0 || entry.contentRect.height === 0) return;
        map.resize(OWN_MOVE);
        onResized();
    });
    observer.observe(container);
    return () => observer.disconnect();
};

export type MapTooltip = {
    // `reading` : le nom de l'élément survolé, la phrase de la carte et la couleur de sa classe
    show: (lngLat: maplibregl.LngLatLike, reading: TipSource) => void;
    hide: () => void;
};

// Infobulle près du pointeur, celle de la carte par territoire : même contenu, même apparence.
// MapLibre la pose au-dessus du pointeur et la retourne près d'un bord : elle reste dans la carte.
// Son contenu n'est réécrit que s'il change : un pointeur qui parcourt un même élément ne fait
// que la déplacer.
export const createTooltip = (map: maplibregl.Map): MapTooltip => {
    const content = document.createElement('div');
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, focusAfterOpen: false, offset: TIP_OFFSET_PX, maxWidth: 'none' }).setDOMContent(content);
    let shown = '';
    return {
        show: (lngLat, reading) => {
            const markup = tipMarkup(tipOf(reading));
            if (markup !== shown) content.innerHTML = markup;
            shown = markup;
            popup.setLngLat(lngLat);
            if (!popup.isOpen()) popup.addTo(map);
        },
        hide: () => {
            popup.remove();
        },
    };
};

export type TouchMark = {
    show: (lngLat: maplibregl.LngLatLike) => void;
    hide: () => void;
};

// Repère du point touché : sur un écran tactile, il dit de quel endroit la fiche donne la lecture,
// à la place du pointeur. Un cercle plutôt qu'un contour : un carreau de 1 km ne fait que quelques
// pixels à l'échelle du pays, et un objet est découpé par les tuiles qui le portent.
export const createTouchMark = (map: maplibregl.Map): TouchMark => {
    const element = document.createElement('div');
    element.className = TOUCH_MARK_CLASS;
    const marker = new maplibregl.Marker({ element });
    return {
        show: (lngLat) => {
            marker.setLngLat(lngLat).addTo(map);
        },
        hide: () => {
            marker.remove();
        },
    };
};

export type MapLabel = {
    text: string;
    // Longitude et latitude du point d'ancrage
    position: [number, number];
    // Côté de l'étiquette posé sur ce point
    anchor: 'bottom' | 'right';
};

// Pose des étiquettes de texte sur la carte, en HTML : la carte n'a pas de police de glyphes à
// charger. Rend de quoi les retirer.
export const addLabels = (map: maplibregl.Map, labels: MapLabel[]): (() => void) => {
    const markers = labels.map(({ text, position, anchor }) => {
        const element = document.createElement('div');
        element.className = LABEL_CLASS;
        element.dataset.anchor = anchor;
        element.textContent = text;
        return new maplibregl.Marker({ element, anchor }).setLngLat(position).addTo(map);
    });
    return () => markers.forEach((marker) => marker.remove());
};

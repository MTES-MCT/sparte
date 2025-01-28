  
  export class OcsgeLeftPanelControl {
    constructor(id) {
        this.container_id = id;
    }
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.id = this.container_id;
        this._container.className = 'maplibregl-ctrl';
        return this._container;

    }
  
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
  }
/*eslint-env commonjs, browser */
(function (factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('leaflet'));
    } else {
        window.L.control.iconLayers = factory(window.L);
        window.L.Control.IconLayers = window.L.control.iconLayers.Constructor;
    }
})(function (L) {
    function each(o, cb) {
        for (var p in o) {
            if (o.hasOwnProperty(p)) {
                cb(o[p], p, o);
            }
        }
    }

    function find(ar, cb) {
        if (ar.length) {
            for (var i = 0; i < ar.length; i++) {
                if (cb(ar[i])) {
                    return ar[i];
                }
            }
        } else {
            for (var p in ar) {
                if (ar.hasOwnProperty(p) && cb(ar[p])) {
                    return ar[p];
                }
            }
        }
    }

    function first(o) {
        for (var p in o) {
            if (o.hasOwnProperty(p)) {
                return o[p];
            }
        }
    }

    function length(o) {
        var length = 0;
        for (var p in o) {
            if (o.hasOwnProperty(p)) {
                length++;
            }
        }
        return length;
    }

    function prepend(parent, el) {
        if (parent.children.length) {
            parent.insertBefore(el, parent.children[0]);
        } else {
            parent.appendChild(el);
        }
    }

    var IconLayers = L.Control.extend({
        includes: L.Mixin.Events,
        _getActiveLayer: function () {

            if (this._activeLayerId) {
                return this._layers[this._activeLayerId];
            } else if (length(this._layers)) {
                return first(this._layers);
            } else {
                return null;
            }
        },
        _getPreviousLayer: function () {
            var activeLayer = this._getActiveLayer();
            if (!activeLayer) {
                return null;
            } else if (this._previousLayerId) {
                return this._layers[this._previousLayerId];
            } else {
                return find(this._layers, function (l) {
                    return l.id !== activeLayer.id;
                }.bind(this)) || null;
            }
        },
        _getInactiveLayers: function () {
            var ar = [];
            var activeLayerId = this._getActiveLayer() ? this._getActiveLayer().id : null;
            var previousLayerId = this._getPreviousLayer() ? this._getPreviousLayer().id : null;
            each(this._layers, function (l) {
                if ((l.id !== activeLayerId) && (l.id !== previousLayerId)) {
                    ar.push(l);
                }
            });
            return ar;
        },
        _arrangeLayers: function () {
            var behaviors = {};

            behaviors.previous = function () {
                var layers = this._getInactiveLayers();
                if (this._getActiveLayer()) {
                    layers.unshift(this._getActiveLayer());
                }
                if (this._getPreviousLayer()) {
                    layers.unshift(this._getPreviousLayer());
                }
                return layers;
            };
            return behaviors[this.options.behavior].apply(this, arguments);
        },
        _getLayerCellByLayerId: function (id) {
            var els = this._container.getElementsByClassName('leaflet-iconLayers-layerCell');
            for (var i = 0; i < els.length; i++) {
                if (els[i].getAttribute('data-layerid') == id) {
                    return els[i];
                }
            }
        },
        _createLayerElement: function (layerObj) {

            var el = L.DomUtil.create('div', 'leaflet-iconLayers-layer');
            el.id = layerObj.id + '_map';

            if (layerObj.title == "empty") {
                el = null;
                return null;
            }


            var titleContainerEl = L.DomUtil.create('div', 'leaflet-iconLayers-layerTitleContainer');

            var oMiniMapContainer = L.DomUtil.create('div', 'leaflet-control-minimap');
            oMiniMapContainer.style.width = '80px';
            oMiniMapContainer.style.height = '80px';
            L.DomEvent.disableClickPropagation(oMiniMapContainer);
            L.DomEvent.on(oMiniMapContainer, 'mousewheel', L.DomEvent.stopPropagation);


            var mapOptions =
			{
			    attributionControl: false,
			    zoomControl: false,
			    zoomAnimation: false,
			    autoToggleDisplay: false,
			    touchZoom: false,
			    scrollWheelZoom: false,
			    doubleClickZoom: false,
			    boxZoom: false,
			    crs: this._map.options.crs,
			    center: this._map.getCenter(),
			    zoom: this._map.getZoom() + this.zoomLevelOffset,
			    zoomControl: false
			};

            var oBaseMap = new L.Map(oMiniMapContainer, mapOptions);


            var oNewLayer = cloneLayer(layerObj.layer);
            if (oNewLayer == null || oNewLayer == undefined) {
                return nReturnCode;
            }
            oBaseMap.addLayer(oNewLayer);

            var oShadowRect = L.rectangle(this._map.getBounds()
											, { color: '#ff7800', weight: 1, clickable: false, opacity: .5, fillOpacity: .5 }).addTo(oBaseMap);



            var center = this._map.getCenter();
            var nZoom = this._map.getZoom() + this.zoomLevelOffset;
            oBaseMap.setView(center, nZoom);


            this._BaseMaps.push(oBaseMap);


            var nLength = Object.keys(this._BaseMaps).length;
            if (nLength == 1) {
                this._map.on('moveend', this._onMainMapMoved, this);
            }


            var checkIconEl = L.DomUtil.create('div', 'leaflet-iconLayers-layerCheckIcon');

            var titleContainerEl = L.DomUtil.create('div', 'leaflet-iconLayers-layerTitleContainer');
            var titleEl = L.DomUtil.create('div', 'leaflet-iconLayers-layerTitle');
            titleEl.innerHTML = layerObj.title;
            titleEl.title = layerObj.tooltip;

            titleContainerEl.appendChild(titleEl);

            el.appendChild(oMiniMapContainer);
            el.appendChild(titleContainerEl);
            el.appendChild(checkIconEl);


            return el;
        },
        _onMainMapMoved: function (e) {
            var oBounds = this._map.getBounds();
            var center = this._map.getCenter();
            var nZoom = this._map.getZoom() + this.zoomLevelOffset;

            var oCurrentItem = null;
            var nCount = 0;
            var oShadowRect = null;

            for (var oObjectKey in this._BaseMaps) {
                if (oObjectKey == null || oObjectKey == undefined) {
                    return 1;
                }

                oCurrentItem = this._BaseMaps[oObjectKey];
                if (oCurrentItem == null || oCurrentItem == undefined) {
                    return 1;
                }
                nCount = 0;
                oCurrentItem.eachLayer(function (layer) {
                    if (nCount > 0) {
                        oCurrentItem.removeLayer(layer);
                    }
                    nCount += 1;
                });
                oShadowRect = L.rectangle(oBounds
											, { color: '#ff7800', weight: 1, clickable: false, opacity: .5, fillOpacity: .5 });

                oShadowRect.addTo(oCurrentItem);

                oCurrentItem.setView(center, nZoom);
            }

            this._RefreshMaps();

        },
        _RefreshMaps: function () {
            var oCurrentItem = null;
            for (var oObjectKey in this._BaseMaps) {
                if (oObjectKey == null || oObjectKey == undefined) {
                    return 1;
                }

                oCurrentItem = this._BaseMaps[oObjectKey];
                if (oCurrentItem == null || oCurrentItem == undefined) {
                    return 1;
                }

                oCurrentItem._onResize();
            }
        },
        _createLayerElements: function () {
            var currentRow, layerCell;
            var layers = this._arrangeLayers();
            var activeLayerId = this._getActiveLayer() && this._getActiveLayer().id;

            layers = this._layers;
            var nLength = layers.length;
            if (nLength == undefined) {
                nLength = Object.keys(layers).length;
            }

            var oCurrentItem = null;
            var i = -1;
            for (var oObjectKey in layers) {
                i += 1;
                if (oObjectKey == null || oObjectKey == undefined) {
                    return 1;
                }

                oCurrentItem = layers[oObjectKey];
                if (oCurrentItem == null || oCurrentItem == undefined) {
                    return 1;
                }

                if (i % this.options.maxLayersInRow === 0) {
                    currentRow = L.DomUtil.create('div', 'leaflet-iconLayers-layersRow');
                    if (this.options.position.indexOf('bottom') === -1) {
                        this._container.appendChild(currentRow);
                    }
                    else {
                        prepend(this._container, currentRow);
                    }
                }
                layerCell = L.DomUtil.create('div', 'leaflet-iconLayers-layerCell');
                layerCell.setAttribute('data-layerid', oCurrentItem.id);
                if (i !== 0) {
                    L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_hidden');
                }
                if (oCurrentItem.id === activeLayerId) {
                    L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_active');
                }
                if (this._expandDirection === 'left') {
                    L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_expandLeft');
                }
                else {
                    L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_expandRight');
                }

                var oChild = this._createLayerElement(oCurrentItem);
                if (oChild != null) {
                    layerCell.appendChild(oChild);
                }

                //if (activeLayerId == oCurrentItem.id)
                //{
                //	prepend(currentRow, layerCell);
                //}
                //else
                {
                    if (this.options.position.indexOf('right') === -1) {
                        currentRow.appendChild(layerCell);
                    }
                    else {
                        prepend(currentRow, layerCell);
                    }
                }

            }
            /*
                        for (var i = 0; i < nLength; i++) 
                        {
                            if (i % this.options.maxLayersInRow === 0) 
                            {
                                currentRow = L.DomUtil.create('div', 'leaflet-iconLayers-layersRow');
                                if (this.options.position.indexOf('bottom') === -1) 
                                {
                                    this._container.appendChild(currentRow);
                                } 
                                else 
                                {
                                    prepend(this._container, currentRow);
                                }
                            }
                            layerCell = L.DomUtil.create('div', 'leaflet-iconLayers-layerCell');
                            layerCell.setAttribute('data-layerid', layers[i].id);
                            if (i !== 0) 
                            {
                                L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_hidden');
                            }
                            if (layers[i].id === activeLayerId) 
                            {
                                L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_active');
                            }
                            if (this._expandDirection === 'left') 
                            {
                                L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_expandLeft');
                            } 
                            else 
                            {
                                L.DomUtil.addClass(layerCell, 'leaflet-iconLayers-layerCell_expandRight');
                            }
                            
                            var oChild = this._createLayerElement(layers[i]);
                            if (oChild != null)
                            {
                                layerCell.appendChild(oChild);
                            }
            
                            if (this.options.position.indexOf('right') === -1) 
                            {
                                currentRow.appendChild(layerCell);
                            } 
                            else 
                            {
                                prepend(currentRow, layerCell);
                            }
                        }
                        */
        },
        _onLayerClick: function (e) {
            e.stopPropagation();
            var layerId = e.currentTarget.getAttribute('data-layerid');
            var layer = this._layers[layerId];
            this.setActiveLayer(layer.layer);
            this.expand();
        },
        _attachEvents: function () {
            each(this._layers, function (l) {
                var e = this._getLayerCellByLayerId(l.id);
                if (e) {
                    e.addEventListener('click', this._onLayerClick.bind(this));
                }
            }.bind(this));
            var layersRowCollection = this._container.getElementsByClassName('leaflet-iconLayers-layersRow');

            var onMouseEnter = function (e) {
                e.stopPropagation();
                this.expand();
            }.bind(this);

            var onMouseLeave = function (e) {
                e.stopPropagation();
                this.collapse();
            }.bind(this);

            var stopPropagation = function (e) {
                e.stopPropagation();
            };

            //TODO Don't make functions within a loop.
            for (var i = 0; i < layersRowCollection.length; i++) {
                var el = layersRowCollection[i];
                el.addEventListener('mouseenter', onMouseEnter);
                el.addEventListener('mouseleave', onMouseLeave);
                el.addEventListener('mousemove', stopPropagation);
            }
        },
        _render: function () {
            this._container.innerHTML = '';
            this._createLayerElements();
            this._attachEvents();
        },
        _switchMapLayers: function () {

            if (!this._map) {
                return;
            }
            var activeLayer = this._getActiveLayer();
            var previousLayer = this._getPreviousLayer();
            if (previousLayer) {
                this._map.removeLayer(previousLayer.layer);
            } else {
                each(this._layers, function (layerObject) {
                    var layer = layerObject.layer;
                    this._map.removeLayer(layer);
                }.bind(this));
            }
            if (activeLayer) {
                this._map.addLayer(activeLayer.layer);
            }
        },
        options: {
            position: 'bottomleft', // one of expanding directions depends on this
            behavior: 'previous', // may be 'previous', 'expanded' or 'first'
            expand: 'horizontal', // or 'vertical'
            autoZIndex: true, // from L.Control.Layers
            maxLayersInRow: 10,
            manageLayers: true
        },
        initialize: function (layers, options) {
            if (!L.Util.isArray(arguments[0])) {
                // first argument is options
                options = layers;
                layers = [];
            }
            L.setOptions(this, options);
            this._expandDirection = (this.options.position.indexOf('left') != -1) ? 'right' : 'left';
            if (this.options.manageLayers) {
                this.on('activelayerchange', this._switchMapLayers, this);
            }
            this.setLayers(layers);
        },
        onAdd: function (map) {
            this._container = L.DomUtil.create('div', 'leaflet-iconLayers');
            L.DomUtil.addClass(this._container, 'leaflet-iconLayers_' + this.options.position);
            this._render();
            map.on('click', this.collapse, this);
            if (this.options.manageLayers) {
                this._switchMapLayers();
            }
            return this._container;
        },
        onRemove: function (map) {
            map.off('click', this.collapse, this);
        },//added by SR
        _addItem: function(obj){
            var item = L.Control.Layers.prototype._addItem.call(this, obj);

          
            if (this._map.getZoom() < 12) {
                $(item).find('input').prop('disabled', true);
            }

            return item;
        },//added by SR
        setLayers: function (layers) {
            this.zoomLevelOffset = -5;
            this._BaseMaps = [];
            this._layers = {};
            layers.map(function (layer) {
                var id = L.stamp(layer.layer);
                this._layers[id] = L.extend(layer, {
                    id: id
                });
            }.bind(this));
            if (this._container) {
                this._render();
            }
        },
        setActiveLayer: function (layer) {
          
            var l = layer && this._layers[L.stamp(layer)];


            if (!l || l.id === this._activeLayerId) {
                return;
            }

            this._previousLayerId = this._activeLayerId;
            //this._previousLayerId = l.id;
            this._activeLayerId = l.id;


            if (this._container) {
                this._render();
            }
            this.fire('activelayerchange', {
                layer: layer
            });

        },
        expand: function () {
            this._arrangeLayers().slice(0).map(function (l) {
                var el = this._getLayerCellByLayerId(l.id);
                L.DomUtil.removeClass(el, 'leaflet-iconLayers-layerCell_hidden');
                this._RefreshMaps();
            }.bind(this));

        },
        collapse: function () {
            try {
                var activeLayerId = this._getActiveLayer() && this._getActiveLayer().id;

                layers = this._layers;
                var nLength = Object.keys(layers).length;

                var oCurrentItem = null;
                for (var oObjectKey in layers) {
                    if (oObjectKey == null || oObjectKey == undefined) {
                        return 1;
                    }

                    oCurrentItem = layers[oObjectKey];
                    if (oCurrentItem == null || oCurrentItem == undefined) {
                        return 1;
                    }

                    if (activeLayerId != oCurrentItem.id) {
                        var el = this._getLayerCellByLayerId(oCurrentItem.id);
                        L.DomUtil.addClass(el, 'leaflet-iconLayers-layerCell_hidden');
                    }
                }
                this._RefreshMaps();
            }
            catch (e) {
                alet(e.message);
            }
            finally {

            }
        }
    });

    var iconLayers = function (layers, options) {
        return new IconLayers(layers, options);
    };

    iconLayers.Constructor = IconLayers;

    return iconLayers;
});
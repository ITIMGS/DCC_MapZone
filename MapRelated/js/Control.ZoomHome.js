/*
 * Leaflet zoom control with a home button for resetting the view.
 *
 * Distributed under the CC-BY-SA-3.0 license. See the file "LICENSE"
 * for details.
 *
 * Based on code by toms (https://gis.stackexchange.com/a/127383/48264).
 */
(function () {
    L.Control.ZoomHome = L.Control.Zoom.extend({
        options: {
            position: 'bottomright',
            zoomInText: '+',
            zoomInTitle: 'Zoom in',
            zoomOutText: '-',
            zoomOutTitle: 'Zoom out',
            zoomHomeIcon: 'home',
            zoomHomeTitle: 'Home',
            homeCoordinates: null,
            homeZoom: null,
            zoomCurrentLocationIcon: 'home',
            zoomCurrentLocationTitle: 'Your current location',
            CurrentLocationCoordinates: null,
            CurrentLocationZoom: null,
            PanelIcon: 'info',
            PanelTitle: 'Help using this site',
            FMEIcon: 'F',
            FMETitle: 'Select another download service',
            ZoomBOX: 'A',
            ZoomBOXTitle: 'Zoom to specific area'
        },

        onAdd: function (map) {
            var controlName = 'leaflet-control-zoomhome',
                container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
                options = this.options;

            if (options.homeCoordinates === null) {
                options.homeCoordinates = map.getCenter();
               
            }
            if (options.homeZoom === null) {
                options.homeZoom = map.getZoom();
            }

            if (options.CurrentLocationCoordinates === null) {
                options.CurrentLocationCoordinates = map.getCenter();
            }
            if (options.CurrentLocationZoom === null) {
                options.CurrentLocationZoom = map.getZoom();
            }

            this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle, controlName + '-in', container, this._zoomIn.bind(this));

            var zoomHomeText = '<i class="command' + options.zoomHomeIcon + '" style="line-height:1.65;"></i>';
            this._zoomHomeButton = this._createButton(zoomHomeText, options.zoomHomeTitle, controlName + '-home', container, this._zoomHome.bind(this));

            if (location.protocol === 'https:') {
                // page is secure
                var zoomCurrentLocationText = '<i class="command' + options.zoomCurrentLocationIcon + '" style="line-height:1.65;"></i>';
                this._zoomCurrentLocationButton = this._createButton(zoomCurrentLocationText, options.zoomCurrentLocationTitle, controlName + '-location', container, this._zoomcurrentLocation.bind(this));

            }


            this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle, controlName + '-out', container, this._zoomOut.bind(this));

            /* ZoomBOX */
            var ZoomBOXText = '<i class="command' + options.ZoomBOX + '" style="line-height:1.65;"></i>';
            this._ZoomBOXButton = this._createButton(ZoomBOXText, options.ZoomBOXTitle, controlName + '-ZoomBOX', container, this._ZoomToBOX.bind(this));

            // Bind to the map's boxZoom handler
            var _origMouseDown = map.boxZoom._onMouseDown;
            map.boxZoom._onMouseDown = function (e) {
            
                if (e.button === 2) return;  // prevent right-click from triggering zoom box
                _origMouseDown.call(map.boxZoom, {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    which: 1,
                    shiftKey: true
                });
            };

            map.on('zoomend', function () {
                try {
                    if (map.getZoom() != map.getMaxZoom()) {
                        L.DomUtil.removeClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOXACTIVE');
                        L.DomUtil.removeClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOXDEACTIVE');
                        L.DomUtil.addClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOX');
                    }
                    else {
                        L.DomUtil.removeClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOXACTIVE');
                        L.DomUtil.removeClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOX');
                        L.DomUtil.addClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOXDEACTIVE');
                    }
                }
                catch (e) {

                }
                finally {

                }
            }, this);

            map.on('boxzoomend', this.deactivate, this);


            L.DomEvent
				.on(this._ZoomBOXButton, 'dblclick', L.DomEvent.stop)
				.on(this._ZoomBOXButton, 'click', L.DomEvent.stop)
				.on(this._ZoomBOXButton, 'mousedown', L.DomEvent.stopPropagation)
				.on(this._ZoomBOXButton, 'click', function () {
				    this._active = !this._active;
				    if (this._active && map.getZoom() != map.getMaxZoom()) {
				        this.activate();
				    }
				    else {
				        this.deactivate();
				    }

				}, this);
            /* ZoomBOX */

            /*
			var FMEBText = '<i class="command' + options.FMEIcon + '" style="line-height:1.65;"></i>';
			this._FMEButton = this._createButton(FMEBText, options.FMETitle, controlName + '-FME', container, this._FMEWorkspaces.bind(this));
            			
            */

            var PanelText = '<i class="command' + options.PanelIcon + '" style="line-height:1.65;"></i>';
            this._PanelButton = this._createButton(PanelText, options.PanelTitle, controlName + '-PANEL', container, this._PanelToggle.bind(this));
            this._PanelHidden = true;
            //this._PanelButton = this._createButton(options.PanelIcon, options.PanelTitle,  controlName + '-PANEL', container, this._PanelToggle.bind(this));

            this._updateDisabled();
            map.on('zoomend zoomlevelschange', this._updateDisabled, this);


            return container;
        },
        _updateDisabled: function () {
        },
        activate: function () {
            L.DomUtil.removeClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOX');
            L.DomUtil.removeClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOXDEACTIVE');
            L.DomUtil.addClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOXACTIVE');

            this._map.dragging.disable();
            this._map.boxZoom.addHooks();
            L.DomUtil.addClass(this._map.getContainer(), 'leaflet-zoom-box-crosshair');
        },
        deactivate: function () {
            L.DomUtil.removeClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOXACTIVE');
            L.DomUtil.removeClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOX');
            L.DomUtil.addClass(this._ZoomBOXButton, 'leaflet-control-zoomhome-ZoomBOXDEACTIVE');
            this._map.dragging.enable();
            this._map.boxZoom.removeHooks();
            L.DomUtil.removeClass(this._map.getContainer(), 'leaflet-zoom-box-crosshair');
            this._active = false;
        },

        _PanelToggle: function (e)
        {
            var sDescr = FMEServerWorkspaceDESCR;
            if ((FMEServerWorkspaceDESCR == undefined || FMEServerWorkspaceDESCR == null || FMEServerWorkspaceDESCR == ""))
            {
                sDescr = "Dublin City Council<br/>";
               // sDescr += "<br/>";
              //  sDescr += "</b>. ";
            }

            ShowWarningMessage("How to use this site", sDescr, "#0097BA", "#FFFFFF");


        },
        _ZoomToBOX: function (e) {

        },
        _FMEWorkspaces: function (e) {
            //jshint unused:false
            //this._map.setView(this.options.homeCoordinates, this.options.homeZoom);

            SelectNewWorkspace();
        },
        _zoomHome: function (e) {
            //jshint unused:false
            this._map.setView(this.options.homeCoordinates, this.options.homeZoom);
        },
        _zoomcurrentLocation: function (e) {
            var nReturnCode = 0;
            try {
                if (this._map == null || this._map == undefined) {
                    return nReturnCode;
                }

                this._map.on('locationfound', this.onLocationFound);
                this._map.on('locationerror', this.onLocationError);
                this._map.locate({ setView: true, maxZoom: this.options.CurrentLocationZoom });
            }
            catch (e) {
                alert(e.message);
            }
            finally {
                return nReturnCode;
            }
        },
        onLocationFound: function (oPosition) {
            var nReturnCode = 0;
            try {
                if (oPosition == null || oPosition == undefined) {
                    return nReturnCode;
                }
                if (oPosition.target == null || oPosition.target == undefined) {
                    return nReturnCode;
                }

                var location = oPosition.latlng;

                var popup = L.popup({ 'autoClose': true })
										.setLatLng(location)
										.setContent('<p>Your current location. <br><b>Click the map to close.</b></p>')
										.openOn(oPosition.target);

            }
            catch (e) {
                alert(e.message);
            }
            finally {
                return nReturnCode;
            }
        },
        onLocationError: function (oEvent) {
            var nReturnCode = 0;
            try {
                if (oEvent == null || oEvent == undefined) {
                    return nReturnCode;
                }
                oEvent.target.fire('location:error', { message: 'This site must operate under the HTTPS protocol for the locate too function to work. Cannot locate to your current position.' });
            }
            catch (e) {
                alert(e.message);
            }
            finally {
                return nReturnCode;
            }
        }
    });

    L.Control.zoomHome = function (options) {
        return new L.Control.ZoomHome(options);
    };
}());
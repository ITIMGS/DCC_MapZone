(function (factory, window) {

	// define an AMD module that relies on 'leaflet'
	if (typeof define === 'function' && define.amd) {
		define(['leaflet'], factory);

	// define a Common JS module that relies on 'leaflet'
	} else if (typeof exports === 'object') {
		module.exports = factory(require('leaflet'));
	}

	// attach your plugin to the global 'L' variable
	if (typeof window !== 'undefined' && window.L) {
		window.L.Control.HomeButton = factory(L);
		window.L.control.HomeButton = function (layer, options) {
			return new window.L.Control.HomeButton(layer, options);
		};
	}
}
(
	function (L) 
	{
		var HomeButton = L.Control.extend(
											{
												options: 
												{
													position: 'topleft'
												},
												// layer is the map layer to be shown in the minimap
												initialize: function (options) 
												{
													L.Util.setOptions(this, options);
												},
												onAdd: function (map) 
												{
													var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-homebutton');

													container.style.backgroundColor = 'white';
													container.style.width = '30px';
													container.style.height = '30px';

													container.onclick = function()
												{
													alert("onclick");
												}
													return container;
												}
											}
										);

		return HomeButton;
	}, window
));
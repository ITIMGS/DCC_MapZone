function cloneOptions (options) 
{
	var ret = {};

	try
	{
		for (var i in options) 
		{
			var item = options[i];
			if (item && item.clone) 
			{
				ret[i] = item.clone();
			} 
			/*
			else if (item instanceof L.Layer) 
			{
				ret[i] = cloneLayer(item);
			} */
			else 
			{
				ret[i] = item;
			}
		}
	}
	catch(e)
	{
		
	}
	finally
	{
		return ret;
	}
   
   
    
}

function cloneInnerLayers (layer) {
    var layers = [];
    layer.eachLayer(function (inner) {
        layers.push(cloneLayer(inner));
    });
    return layers;
}

function cloneLayer (layer) 
{
	var options = null;
	var oReturnLayer = null;

	try
	{
		options = cloneOptions(layer.options);
		if (options == null || options == undefined)
		{
			return null;
		}
	    try
	    {
		    // Google layers
		    if (layer instanceof L.Google) 
		    {		
			    oReturnLayer = new L.Google(layer._type.toUpperCase());
		    }
	    }
	    catch (e) {

	    }
	    finally
	    {
	    }
		if (layer instanceof L.ImageOverlay) {
			oReturnLayer = L.imageOverlay(layer._url, layer._bounds, options);
		}
		
		// Tile layers
		if (layer instanceof L.TileLayer) {
			oReturnLayer = L.tileLayer(layer._url, options);
		}
		if (layer instanceof L.ImageOverlay) {
			oReturnLayer = L.imageOverlay(layer._url, layer._bounds, options);
		}

		// Marker layers
		if (layer instanceof L.Marker) {
			oReturnLayer = L.marker(layer.getLatLng(), options);
		}

		if (layer instanceof L.Circle) {
			oReturnLayer = L.circle(layer.getLatLng(), layer.getRadius(), options);
		}
		if (layer instanceof L.CircleMarker) {
			oReturnLayer = L.circleMarker(layer.getLatLng(), options);
		}

		if (layer instanceof L.Rectangle) {
			oReturnLayer = L.rectangle(layer.getBounds(), options);
		}
		if (layer instanceof L.Polygon) {
			oReturnLayer = L.polygon(layer.getLatLngs(), options);
		}
		if (layer instanceof L.Polyline) {
			oReturnLayer = L.polyline(layer.getLatLngs(), options);
		}

		if (layer instanceof L.GeoJSON) {
			oReturnLayer = L.geoJson(layer.toGeoJSON(), options);
		}

		if (layer instanceof L.LayerGroup) {
			oReturnLayer = L.layerGroup(cloneInnerLayers(layer));
		}
		if (layer instanceof L.FeatureGroup) {
			oReturnLayer = L.FeatureGroup(cloneInnerLayers(layer));
		}

			
	}
	catch(e)
	{
		
	}
	finally
	{
		return oReturnLayer;
	}
	
	 

	 
}

if (typeof exports === 'object') {
    module.exports = cloneLayer;
}
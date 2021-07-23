﻿var gResults = null;
var gMiniResults = null;

var gMainMap = null;
var gMiniMap = null;
var layersControl = null;

var sSearchFeatureLayer = "";
var sSearchFeatureField = "";
var sSearchFeatureValue = "";
var sLayerProjection = "";
var sSearchFeatureLayerMainURL = null;
var oSearchLayer = null;
var oLayerTooltips = [];
var layerTooltips = [];
var gNavigationPanel = null;
var WFSSURL = "";
var relatedtooltip = "";
var initialLoad = false;
var overlayOn = false;
var currentScale = "";
var largestScale =0;
var index=0;
var count=0;

var nZIndex = 1500;
var nzInc = 10;

var authUrl = "";
var userName = "";
var password = "";
var targetPage = "";
var tenant = "";
var sHeaderParams = "";
var output = $('#h3_out');
var queryDict = {};
var sWFSUrlCollection = [];
var sWFSUrlCollectionBBOX = [];
var g_bLoadEvent = false;
var arrayLen = null;
var layers = [];
var search = "";
var layersChecked = [];
var layerScale=[];
var tooltip= "";
var bUrl="";
var bTenant ="";
var srid="";


window.addEventListener("load", function () {
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#0097BA"
            },
            "button": {
                "background": "#f1d600"
            }
        },
        "theme": "classic",
        "content": {
            "message": "111111111111"
        },
        "content": {
            "href": "http://ec.europa.eu/ipg/basics/legal/cookies/index_en.htm"
        }
    })
});



// Login to Mapp Enterprise
function MAppEnterpriseLogin() {

    sHeaderParams = location.search.substr(1);
 

    location.search.substr(1).split("&").forEach(function (item) {
        queryDict[item.split("=")[0]] = item.split("=")[1]
    });

    queryDict["tenant"] = tenant;

    return $.ajax({
        url: authUrl,
        headers: queryDict,
        data: { grant_type: 'password', username: userName, password: password, client_id: 'App' },
        type: 'POST'
    }).then(redirect).catch(showError);

}

function redirect(token) {
    output.text('Login successful, redirecting in 3 seconds..')
    token.expiration_date = Date.now() + (token.expires_in * 1000);
    window.localStorage.setItem('apps_storage', JSON.stringify(token));


    setTimeout(function () {
        window.location = targetPage + "?" + sHeaderParams;
    }, 3000);
}

function showError(error) {
    debugger;

}
// -------------------------------------------------------

function LayerTooltips(name, mytooltip) {
    this.name = name;
    this.mytooltip = mytooltip;
}
String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}

var urlParam = function (name, w) {
    w = w || window;
    var rx = new RegExp('[\&]' + name + '=([^\&\#]+)'), 
        val = w.location.search.match(rx);
    return !val ? '' : val[1];
}


function LoadMap() 
{
    try
    {
  
        g_bLoadEvent = true;
      search = urlParam('search');
	  tooltip = urlParam('tooltip');


        proj4.defs("EPSG:29903", "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs");
        proj4.defs("urn:ogc:def:crs:EPSG::29903", "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs");

        var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmAttribution = 'Map data <a target="_blank" href="http://www.openstreetmap.org">OpenStreetMap.org</a>' +
                                ' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        var osmLayer = new L.TileLayer(osmUrl, {
            maxZoom: 19,
		
            attribution: osmAttribution
        });


        var baseMaps = { "OpenStreetMap": osmLayer };
        gMainMap = L.map("map", {
            zoomControl:true,
            center: new L.LatLng(55.8, 37.7)
            , zoom: 7
        });
      //  gMainMap.zoomControl.setPosition('topright');
        gMainMap.addLayer(osmLayer);


        var sBaseURL = "";
        var sTenant = "";
        var sLayers = [];

        try {
            sBaseURL = GetApiURL();
            sTenant = GetTenantName();
            sLayers = GetLayerInfo();			
            layers = sLayers;		
			srid= sLayers[0].srid;
			bUrl =sBaseURL;
			bTenant=sTenant;

        }
        catch (e) {
            debugger;
        }
        finally {
        }
        var overlayMaps = {};
        var sLayer = "";
        var sWMSURL = "";
        var arrayLength = sLayers.length;
        arrayLen = arrayLength;

        var oWMSLayer = null;

      
        // wms
        layersControl = L.control.layers(baseMaps, null, { Position: 'topright'});
		gMainMap.zoomControl.setPosition('topleft');
       // layersControl = L.control.activeLayers(baseMaps, null, { Position: 'topright', collapsed: false });

        // var nZIndex = 1500;
        // var nzInc = 10;
        var sWMSUrlCollection = [];
      
        for (var i = (arrayLength - 1) ; i >= 0 ; i--) 
        {
          
            sWMSURL = sBaseURL + sTenant + '/' + sLayers[i].name;
           
                var options = {
                    layers: sLayers[i].name
                                    , format: 'image/png'
                                    , crs: L.CRS.EPSG3857
                                    , version: '1.3.0'
                                    , TILED: true
                                    , transparent: true
                                    , layerid: sLayers[i].layerid
                                    , zIndex: nZIndex - (nzInc * i)
                                    , apiKey: sLayers[i].token									
									, maxZoom: 20
									
								 
									
								
                    ,
                };
            
           
            oWMSLayer = L.WMS.overlay(sWMSURL, options);


            //oWMSLayer = L.tileLayer.wms(sWMSURL, options);
            //oWMSLayer.setZIndex(nZIndex - (nzInc * i));
           
       
            layersControl.addOverlay(oWMSLayer,'<img src="MapRelated/css/images/'+i+'.JPG"/>  ' + sLayers[i].name);
        
            if (sLayers[i].isvisible=="True")
            {
                layersChecked.push(sLayers[i].name);
                gMainMap.addLayer(oWMSLayer);
            }
        
           
              
                                     

        }
       // var num = layersControl.getActiveOverlayLayers();
        
        var sWFSSURL = sBaseURL;
        sWFSSURL = sWFSSURL.replace("/wms/", "/wfs/");
        sWFSSURL = sWFSSURL + sTenant + '/';
        WFSSURL = sWFSSURL;

        // ----------------------------------------------------------------------
        // WFS common params
        // ----------------------------------------------------------------------
        var sParams = "";
        var sDataURL = "";
        var sMyTooltip = "";
       

  
        gMainMap.addControl(layersControl);
        L.control.scalefactor().addTo(gMainMap);
     
        for (var i=(sLayers.length-1) ; i>0; i--) {
            if (Number(sLayers[i].maxSCALE) > Number(sLayers[i - 1].maxSCALE)) {
                largestScale = Number(sLayers[i].maxSCALE);
			
            }
            else {
                largestScale = Number(sLayers[i - 1].maxSCALE);
            }

        }
     

        for (var i = 0; i < arrayLength; i++)
        {
           
           
            sMyTooltip = sLayers[i].mytooltip;           
      
            var layerMAXScale = sLayers[i].maxSCALE;        

           
            oLayerTooltips.push(new LayerTooltips(sLayers[i].name, sMyTooltip));

            sLayerProjection = 'EPSG:' + sLayers[i].srid;
            sParams = '?service=wfs&typename=' + sLayers[i].name + '&outputformat=geojson&request=GetFeature&srsName=' + sLayerProjection + '&apiKey=' + sLayers[i].token;
            sDataURL = sWFSSURL + sLayers[i].name;

            sDataURL += sParams;
            sWFSUrlCollection[i] = { "sDataURL": sDataURL, "Name": sLayers[i].name,"layerMiniScale":sLayers[i].minSCALE ,"layerMaxScale":sLayers[i].maxSCALE};
            sSearchFeatureLayerMainURL = sDataURL;
            sDataURL += '&BBOX=' + sLayers[i].bbox;
            sWFSUrlCollectionBBOX[i] = { "sDataURL": sDataURL, "Name": sLayers[i].name, "layerMiniScale": sLayers[i].minSCALE, "layerMaxScale": sLayers[i].maxSCALE };
           
          
           for (var j = 0; j < layersChecked.length; j++)
           {
               if (sWFSUrlCollection[i].Name === layersChecked[j])
               {
                 
                   sDataURL = sWFSUrlCollectionBBOX[i].sDataURL;

                    // with this version of M.App Enterprise - you have to pass in the full geographic context to get resuls back
                    // it would have been nice to use an OGC Filter BUT that is not available until the 2019 release
                   currentScale = $('.leaflet-control-scalefactor-line').text();
                   var cScale = currentScale.split(":");
                   var minScale = cScale[0];
                   var vScale = removeCommas(cScale[1]);
                   var maxScale = Number(vScale);// parseInt(cScale[1],10);
                  if(sLayers[i].maxSCALE!=="")
				  {
                   var lmaxScale = Number(sLayers[i].maxSCALE);// parseInt(sLayers[i].maxSCALE,10);
				  }
				  
                   if (maxScale > lmaxScale)
                 {
                    
                        queryLayerInfo(sDataURL, false, false, false, false);
                    }
                 else if (sLayers[i].maxSCALE==="")
                 {
                        queryLayerInfo(sDataURL, false, true, false, false);
                    }
					else{
						  queryLayerInfo(sDataURL, false, true, false, false);
					}

            
              }
            }
                        
        }
 

       
        gMainMap.fitWorld();
     

        var oBBOX = [];
        if (arrayLength >= 1) {
            for (var i = 0; i < 1; i++) {
                oBBOX = sLayers[i].bbox.split(",");
                var oNewCoords1 = proj4('EPSG:' + sLayers[i].srid, 'EPSG:4326', [parseFloat(oBBOX[0]), parseFloat(oBBOX[1])]);
                var oNewCoords2 = proj4('EPSG:' + sLayers[i].srid, 'EPSG:4326', [parseFloat(oBBOX[2]), parseFloat(oBBOX[3])]);

                gMainMap.fitBounds([
                                      [oNewCoords1[1], oNewCoords1[0]],
                                      [oNewCoords2[1], oNewCoords2[0]]
                ]);
            }
        }

        $("#map").trigger("resize");
        var options = {
            position: 'topleft',
            className: 'leaflet-zoom-box-icon',
            modal: true,
            title: "Zoom to specific area"
        };
        var zoomBoxControl = L.control.zoomBox(options);
        gMainMap.addControl(zoomBoxControl);       
      
        gMainMap.on('click', mapClickedEvent);//function mapClickedEvent fires on click on map
        gMainMap.on('mousemove', mapMouseMoveEvent); //function mapMouseMoveEvent fires on mouse move  on map 
        gMainMap.on("moveend", mapPanEvent); //function mapPanEvent fires on Pan on map 
        gMainMap.on('overlayadd', onOverlayAdd);//function onOverlayAdd fires on adding a layer on the layer control i.e Checking the checkbox in the control
       // gMainMap.on("zoomstart", mZoomStart);//function mZoomStart fires on zooming
        gMainMap.on("zoomend", mZoomEnd);
        gMainMap.on('overlayremove', onOverlayRemove);//function onOverlayRemove fires on removing a layer on the layer control i.e Unchecking the checkbox in the control
              
        
        
              
        RegisterSearchControl();
        //  var control = layersControl.getOverlays(); // { Truck 1: true, Truck 2: false, Truck 3: false }
        currentScale = $('.leaflet-control-scalefactor-line').text();    
       
       
}

    catch (e)
{
        ShowMessageForm(e.message);
    }
    finally {
    }
}

function mZoomStart()
{
debugger;
    currentScale = $('.leaflet-control-scalefactor-line').text();
		
    if (layersChecked.length !== 0) 
	{
        for (var i = 0; i < layersChecked.length; i++) {
            if (sWFSUrlCollection.length !== 0) {
                for (var j = 0; j < sWFSUrlCollection.length; j++) {
                    if (sWFSUrlCollection[j].Name === layersChecked[i]) 
					{
											    
                        var cScale = currentScale.split(":");
                        var minScale = cScale[0];
                        var vScale = Number(removeCommas(cScale[1]));
                          if(layerScale.length !==0)
						  {
							  for(var g=0;g<count;g++)
							  {
								  if(layerScale[g].Name==sWFSUrlCollection[j].Name)
								  {
									  layerScale.splice(g,1);
									  count=count-1;
								  }
							  }
						  }
						
                        if ((vScale < Number(sWFSUrlCollection[j].layerMaxScale)) ||(sWFSUrlCollection[j].layerMaxScale === "")) {
							debugger;
                             if(sWFSUrlCollection[j].layerMaxScale !== "")
							 {
								 if(vScale <'8000' && vScale >='2840')
								 {
									  var leng = $(".leaflet-popup-close-button").length;
	                      if(leng>0)
	                          {
		                       for(var i=0;i<leng;i++)
		                         {
	                            $(".leaflet-popup-close-button")[i].click();
		                         }
	                            } 
								 }
								 
							 }
                            var bounds = gMainMap.getBounds();

                            var oNewCoords1 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._northEast.lng, bounds._northEast.lat]);
                            var oNewCoords2 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._southWest.lng, bounds._southWest.lat]);

                            var dUrl = sWFSUrlCollection[j].sDataURL;
                            dUrl += '&BBOX=' + (oNewCoords1[0]) + "," + (oNewCoords1[1]) + "," + (oNewCoords2[0]) + "," + (oNewCoords2[1]);
                            queryLayerInfo(dUrl, false, true, false, false);
							 
								 $("#map").trigger("resize");
                        }
                         else 
						 {				 					 
						    
                            var leng = $(".leaflet-popup-close-button").length;
	                      if(leng>0)
	                          {
		                       for(var i=0;i<leng;i++)
		                         {
	                            $(".leaflet-popup-close-button")[i].click();
		                         }
	                            }

							debugger;
							//while(index<=(sWFSUrlCollection[j].length))
						while(index<(1))
							{
								
						     var bounds = gMainMap.getBounds();

                            var oNewCoords1 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._northEast.lng, bounds._northEast.lat]);
                            var oNewCoords2 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._southWest.lng, bounds._southWest.lat]);

                            var dUrl = sWFSUrlCollection[j].sDataURL;
							dUrl += '&BBOX=' + (oNewCoords1[0]) + "," + (oNewCoords1[1]) + "," + (oNewCoords2[0]) + "," + (oNewCoords2[1]);
							
                            queryLayerInfo(dUrl, false, false, false, true);						   
							layerScale[count]={"Name":sWFSUrlCollection[j].Name,"count":count};
							count=count+1;
							index= index+1;
							 }
							 
							 
							 
							 
							 
							 
							 
						 }							 
							
							
                    }
                }

            }
        }
    }
else{
	  var leng = $(".leaflet-popup-close-button").length;
	                      if(leng>0)
	                          {
		                       for(var i=0;i<leng;i++)
		                         {
	                            $(".leaflet-popup-close-button")[i].click();
		                         }
	                            }
}

 
}
function mapPanEvent() 
{   
	 currentScale = $('.leaflet-control-scalefactor-line').text();
		
    if (layersChecked.length !== 0) {
        for (var i = 0; i < layersChecked.length; i++) {
            if (sWFSUrlCollection.length !== 0) {
                for (var j = 0; j < sWFSUrlCollection.length; j++) {
                    if (sWFSUrlCollection[j].Name === layersChecked[i]) 
					{
											    
                        var cScale = currentScale.split(":");
                        var minScale = cScale[0];
                        var vScale = Number(removeCommas(cScale[1]));
                          if(layerScale.length !==0)
						  {
							  for(var g=0;g<count;g++)
							  {
								  if(layerScale[g].Name==sWFSUrlCollection[j].Name)
								  {
									  layerScale.splice(g,1);
									  count=count-1;
								  }
							  }
						  }
                        if ((vScale < Number(sWFSUrlCollection[j].layerMaxScale)) ||(sWFSUrlCollection[j].layerMaxScale === "")) {
                            var bounds = gMainMap.getBounds();

                            var oNewCoords1 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._northEast.lng, bounds._northEast.lat]);
                            var oNewCoords2 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._southWest.lng, bounds._southWest.lat]);

                            var dUrl = sWFSUrlCollection[j].sDataURL;
                            dUrl += '&BBOX=' + (oNewCoords1[0]) + "," + (oNewCoords1[1]) + "," + (oNewCoords2[0]) + "," + (oNewCoords2[1]);
                            queryLayerInfo(dUrl, false, true, false, false);
							 
								 $("#map").trigger("resize");
                        }
                         else 
						 {				 					 
						    							
							while(index<=(sWFSUrlCollection[j].length))
							{
						     var bounds = gMainMap.getBounds();

                            var oNewCoords1 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._northEast.lng, bounds._northEast.lat]);
                            var oNewCoords2 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._southWest.lng, bounds._southWest.lat]);

                            var dUrl = sWFSUrlCollection[j].sDataURL;
							dUrl += '&BBOX=' + (oNewCoords1[0]) + "," + (oNewCoords1[1]) + "," + (oNewCoords2[0]) + "," + (oNewCoords2[1]);
                            queryLayerInfo(dUrl, false, false, false, true);						   
							layerScale[count]={"Name":sWFSUrlCollection[j].Name,"count":count};
							count=count+1;
							index= index+1;
							 }
							 
							 
						 }							 
							
							
                    }
                }

            }
        }
    }

}
function mZoomEnd() 
{


   $("#map").trigger("resize");

}



//To remove comma from scale value
function removeCommas(str) {
    while (str.search(",") >= 0) {
        str = (str + "").replace(',', '');
    }
    return str;
};

function onOverlayRemove(e) {
	
debugger;
var removeString = (e.name).slice(0,41);
 var layerName = ((e.name).replace(removeString,"")).trim();
    for (var i = 0; i < layersChecked.length; i++) {
        if (layersChecked[i] == layerName) {
            layersChecked.splice(i, 1);
        }
    }
    var layerUnchecked = layerName;

    var cScale = currentScale.split(":");
    var minScale = cScale[0];
    var vScale = Number(removeCommas(cScale[1]));
	
	  
    for (var j = 0; j < sWFSUrlCollection.length; j++) 
	{
         if (sWFSUrlCollection[j].Name === layerUnchecked) {
            if (vScale < Number(sWFSUrlCollection[j].layerMaxScale)) {
                  var bounds = gMainMap.getBounds();

                 var oNewCoords1 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._northEast.lng, bounds._northEast.lat]);
                 var oNewCoords2 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._southWest.lng, bounds._southWest.lat]);

                var dUrl = sWFSUrlCollection[j].sDataURL;
                  dUrl += '&BBOX=' + (oNewCoords1[0]) + "," + (oNewCoords1[1]) + "," + (oNewCoords2[0]) + "," + (oNewCoords2[1]);
                 queryLayerInfo(dUrl, false, false, false, true);
             }
          
        }
     }
	 var leng = $(".leaflet-popup-close-button").length;
	 if(leng>0)
	 {
		 for(var i=0;i<leng;i++)
		 {
	 $(".leaflet-popup-close-button")[i].click();
		 }
	 }
}

function onOverlayAdd(e)
{

 debugger;
 var removeString = (e.name).slice(0,41);
 var layerName = ((e.name).replace(removeString,"")).trim();
 
  layersChecked.push(layerName);
	
    var layerAdded = "";
    var layerWFSUrl = "";
    
    currentScale = $('.leaflet-control-scalefactor-line').text();
    if (layersChecked.length !== 0) {
        for (var i = 0; i < layersChecked.length; i++) {
            if (sWFSUrlCollection.length !== 0) {
                for (var j = 0; j < sWFSUrlCollection.length; j++) {
                    if (sWFSUrlCollection[j].Name === layersChecked[i]) {
                        var cScale = currentScale.split(":");
                        var minScale = cScale[0];
                        var vScale = Number(removeCommas(cScale[1]));

                        if (vScale < Number(sWFSUrlCollection[j].layerMaxScale)||(sWFSUrlCollection[j].layerMaxScale==="")) {
                            var bounds = gMainMap.getBounds();

                            var oNewCoords1 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._northEast.lng, bounds._northEast.lat]);
                            var oNewCoords2 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._southWest.lng, bounds._southWest.lat]);

                            var dUrl = sWFSUrlCollection[j].sDataURL;
                            dUrl += '&BBOX=' + (oNewCoords1[0]) + "," + (oNewCoords1[1]) + "," + (oNewCoords2[0]) + "," + (oNewCoords2[1]);
                            queryLayerInfo(dUrl, false, true, false, false);
                        }

                    }
                }
            }
        }
    }
   
}
function CallQueryLayerInfo(searchField,searchValue,searchLayer,dataUrl)
{
   
    sSearchFeatureLayer = searchLayer;
    sSearchFeatureField = searchField;
    sSearchFeatureValue = searchValue;
	var countlayer=0;

    queryLayerInfo(dataUrl, false,false,true,false);
	
	
 
}
//Get the Corresponding layer for a particular planning Reference
function GetSearchItemLayer()
{
    sSearchFeatureLayer = "";
    sSearchFeatureField = "";
    sSearchFeatureValue = "";
    var data = document.getElementById("freetext").value;
    var sMyTooltip = "";
    var layerProjection = "";
    var params = "";
    var dataUrl = "";
    g_bLoadEvent = false;
    $.ajax({
        type: "post",
        url: "MapZone.aspx/GetLayerInfoFreeTextSearch",        
        contentType: "application/json;charser=utf-8",
        data:'{value :"'+data+'"}',
        dataType:"json",
        success: function (response) {
         
            for (var i = 0; i < arrayLen; i++)
            {
                 var datalayer =  (response.d);
                 if (layers[i].name === datalayer)
                {
                    sMyTooltip = layers[i].mytooltip;
                 
                    // LayerTooltips.push(new LayerTooltips(layers[i].name, sMyTooltip));

                     layerProjection = 'EPSG:' + layers[i].srid;
                    
                     params = '?service=wfs&typename=' + layers[i].name + '&outputformat=geojson&request=GetFeature&srsName=' + layerProjection + '&apiKey=' + layers[i].token;
                 
                     dataUrl = WFSSURL + layers[i].name;
                     
                     dataUrl += params;
                    

                    // sWFSUrlCollection[i] = sDataURL;
                     sSearchFeatureLayerMainURL = dataUrl;
                    // sDataURL = sWFSUrlCollection[i];

                    // with this version of M.App Enterprise - you have to pass in the full geographic context to get resuls back
                    // it would have been nice to use an OGC Filter BUT that is not available until the 2019 release
                     dataUrl += '&BBOX=' + layers[i].bbox;

                    
                    searchFeatureLayer = response.d;
                    searchFeatureField = search;//"Plan_Ref"; //datalayer[0].attribute;
                    searchFeatureValue = data;
					console.log(dataUrl);
                    CallQueryLayerInfo(searchFeatureField, searchFeatureValue, searchFeatureLayer, dataUrl)
                    return;
                }
            }
         

        }

    })

}



function mapMouseMoveEvent(e)
{//If all layers are switched off, they close all the popup in the screen
	if(layersChecked.length==0)
	{
		  var leng = $(".leaflet-popup-close-button").length;
	                      if(leng>0)
	                          {
		                       for(var i=0;i<leng;i++)
		                         {
	                            $(".leaflet-popup-close-button")[i].click();
		                         }
	                            }
	}
	
    
}


        function mapClickedEvent(e) {
        debugger;
        
            var sDataURL = "";
            try {              

                //sDataURL = sSearchFeatureLayerMainURL;


                var oLayerPoint1 = { x: e.layerPoint.x, y: e.layerPoint.y };
                var oLayerPoint2 = { x: e.layerPoint.x, y: e.layerPoint.y };

                oLayerPoint1.x -= 16;
                oLayerPoint1.y -= 16;

                oLayerPoint2.x += 16;
                oLayerPoint2.y += 16;

                var oLatLont1 = gMainMap.layerPointToLatLng(oLayerPoint1);
                var oLatLont2 = gMainMap.layerPointToLatLng(oLayerPoint2);

                //var oLatLong = e.latlng;
                //var oNewCoords = proj4('EPSG:4326', 'EPSG:29903', [oLatLong.lng, oLatLong.lat]);
                //with this version of M.App Enterprise - you have to pass in the full geographic context to get resuls back
                //it would have been nice to use an OGC Filter BUT that is not available until the 2019 release
                //sDataURL += '&BBOX=' + (oNewCoords[0] - 10) + "," + (oNewCoords[1] - 10) + "," + (oNewCoords[0] + 10) + "," + (oNewCoords[1] + 10);


                for (var i = 0; i < sWFSUrlCollection.length; i++) {
                  
                    for (var j = 0; j < layersChecked.length; j++)
                    {
                        if (sWFSUrlCollection[i].Name === layersChecked[j])
                        {
							
							 var cScale = currentScale.split(":");
                            var minScale = cScale[0];
                            var vScale = removeCommas(cScale[1]);
                            var maxScale = Number(vScale);
                            if (maxScale < sWFSUrlCollection[i].layerMaxScale ||sWFSUrlCollection[i].layerMaxScale ==="")
								{
                            sDataURL = sWFSUrlCollection[i].sDataURL;
                            var oNewCoords1 = proj4('EPSG:4326','EPSG:'+srid, [oLatLont1.lng, oLatLont1.lat]);
                           var oNewCoords2 = proj4('EPSG:4326', 'EPSG:'+srid, [oLatLont2.lng, oLatLont2.lat]);
                            sDataURL += '&BBOX=' + (oNewCoords1[0]) + "," + (oNewCoords1[1]) + "," + (oNewCoords2[0]) + "," + (oNewCoords2[1]);

                   


                            queryLayerInfo(sDataURL, true, false, false,false);
                        }
						}
                    }
                   
                }
            }
            catch (e) {
                ShowMessageForm(e.message);
            }
            finally {
            }
        }
//Generic function that access WFS and return information about polygon  
        function queryLayerInfo(sDataURL, bFromClickEvent,bFromMouseMoveEvent,bfreeTextSearchEvent,removeMouseOver) {
            try {
        debugger;
                if (!(sDataURL)) {
                    return false;
                }
                // if (oSearchLayer)
                // {
                //try {
                //  layersControl.removeLayer(oSearchLayer);
                //   gMainMap.removeLayer(oSearchLayer);
                //}
                // catch (e) {
                //    ShowMessageForm(e.message);
                // }
                // finally {
                // }

                // }
     
              
      
                $.get(sDataURL)
                    .done(function (data, textStatus, jqXHR) 
                    {
           debugger;
                        var obj = data;
               
                        var oZoomToJSON = {
                            "type": "FeatureCollection"
                                                , "crs": {
                                                    "type": "name"
                                                            , "properties": {
                                                                "name": "urn:ogc:def:crs:" + sLayerProjection.replace(':', '::')
                                                            }
                                                }
                                                , "features": []
                        };

                        var oFullJSON = {
                            "type": "FeatureCollection"
                                                , "crs": {
                                                    "type": "name"
                                                            , "properties": {
                                                                "name": "urn:ogc:def:crs:" + sLayerProjection.replace(':', '::')
                                                            }
                                                }
                                                , "features": []
                        };
						

                        var oLocatedStyle = {
                            weight: 0.,
                            opacity: 5,
                            fillOpacity: 0,
                            color: 'white',
                            dashArray: '0.0001'
                        };
                         var oOtherStyle = {
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0,
                            color: 'black',
							dashArray: '0.0001'
                        };
						
						var sStyle=oLocatedStyle;
                        var featureLength=0;
                        var bSingleFeatureOnly = true;
                    
                        if (bFromMouseMoveEvent || removeMouseOver)
                        {
                            bSingleFeatureOnly = false;

                        }
                       
                        var oFeatureOfInterestBounds = null;
                        var sLayerName = "";
                        var featureCount = obj.features.length;
                    
                        for (i = 0; i < obj.features.length; i++)
                        {
							
							

                            if ((bFromClickEvent === true  ) && i > 0) {

                                return;
                            }
                            var oFeature = obj.features[i];
                            var oCurrentValue = oFeature.properties[sSearchFeatureField];
							
                          
                          
                           
                            if (bSingleFeatureOnly === true ) {
                                if (oCurrentValue === sSearchFeatureValue || bFromClickEvent || bFromMouseMoveEvent || removeMouseOver) {

                                    sLayerName = sSearchFeatureValue;
                                    if (bFromClickEvent) {
                                        sLayerName = oCurrentValue;
                                    }
                                
                                    oZoomToJSON.features.push(obj.features[i]);

                                    try {
										debugger;
									
	                                    oSearchLayer = L.Proj.geoJson(oZoomToJSON,
                                         {
                                             style:oLocatedStyle 
                                         });	
									
                                       									
																							
                                        
                                        if (!removeMouseOver)
											{

                                            gMainMap.addLayer(oSearchLayer);
											var cZoom = gMainMap.getZoom();
										
                                            if (oSearchLayer !== "" && (!bFromClickEvent)&&(!removeMouseOver)) 
											{
												gMainMap.fitBounds(oSearchLayer.getBounds(),{maxZoom:17});//Currnet maxZoom set to 17 to display  freetext search result at a scale of 1:2849,Change this value if this scale has to be changed
                                               
												
												
                                            }

                                        if(bFromClickEvent )
										{
                                            var sTooltip = oLayerTooltips[0].mytooltip;
                                         
                                            var attrs = Object.keys(obj.features[featureCount-1].properties)
                                            for (var nAttr = 0; nAttr < attrs.length; nAttr += 1) 
											{
                                                attribute = attrs[nAttr];
                                                value = obj.features[featureCount-1].properties[attribute];

                                                sTooltip = sTooltip.replaceAll("*[" + attribute + "]*", value);
											
                                                if (attribute === tooltip)
													{
                                                   
                                                    var Id = value;
                                                }
										

                                            }
										}
										else
										{
											var sTooltip = oLayerTooltips[0].mytooltip;
                                        
                                            var attrs = Object.keys(obj.features[i].properties)
                                            for (var nAttr = 0; nAttr < attrs.length; nAttr += 1) 
											{
                                                attribute = attrs[nAttr];
                                                value = obj.features[i].properties[attribute];

                                                sTooltip = sTooltip.replaceAll("*[" + attribute + "]*", value);
											
                                                if (attribute === tooltip)
													{
                                                   
                                                   var  Id = value;
                                                }
												
										

										     }
										}
											

                                            sTooltip = sTooltip.replaceAll("|", "'");
                                            sTooltip = sTooltip.replaceAll("nbsp;", " ");
                                            sTooltip = sTooltip.replaceAll("<br/>", " ");
                                            sTooltip = sTooltip.replaceAll("<br>", " ");
                                            sTooltip = sTooltip.replaceAll("<br />", " ");


                                            relatedTooltip = sTooltip;
                                          
	                                          if ((bFromClickEvent && ! bfreeTextSearchEvent) ||(!bFromClickEvent && bfreeTextSearchEvent))
											{


                                               
												// if(Id===null|| Id===undefined)
											// {
										 // var oCenter = oSearchLayer.getBounds().getCenter();
                                              // var popup = L.responsivePopup({CloseOnClick:false,autoClose:false})
                                                               // .setLatLng([oCenter.lat, oCenter.lng])
                                                                // .setContent( sTooltip )
                                                               // .openOn(gMainMap);
											//}
											//else{
													 GetRelatedRecords(i, Id, relatedTooltip, oSearchLayer);
											//}
											
                                            }
                                           // if ((!bFromMouseMoveEvent) && !(bFromClickEvent)&&(!bfreeTextSearchEvent)) 
										// {
												
                                              // var oCenter = oSearchLayer.getBounds().getCenter();
                                               // var popup = L.responsivePopup({CloseOnClick:false,autoClose:false})
                                                               // .setLatLng([oCenter.lat, oCenter.lng])
                                                                // .setContent( sTooltip )
                                                               // .openOn(gMainMap);
                                           // }
                                        }
                                        
                                        
                                    }
                                    catch (e) {
                                        ShowMessageForm(e.message);
                                    }
                                }
							
                            }
                            else {
								
								var attrs = Object.keys(obj.features[i].properties)
								 for (var nAttr = 0; nAttr < attrs.length; nAttr += 1) {
                                                attribute = attrs[nAttr];
                                                                                              
                                                if (attribute !== tooltip) 
												{delete obj.features[i].properties[attribute]; //Deleting other properties of features to retain only Plan_Ref so as to improve performance
                                                   
												}

                                            }
                                 
                                oFullJSON.features.push(obj.features[i]);
                            }
                        }
					//Collect all the polygon features in the current window bounds and add it to Geojson
                        if (oFullJSON.features.length > 0 && bFromMouseMoveEvent && !removeMouseOver)
                        {
                           
                           
                          try{
                            var sLayer = L.Proj.geoJson(oFullJSON, {
                                style: oLocatedStyle,
                                onEachFeature: onEachFeature.bind(this)
                            });
                           
                            gMainMap.addLayer(sLayer);
                            initialLoad = true;
                           }
						   catch(e)
						   {
							   
						   }
                           
                        }
                        if (oFullJSON.features.length > 0 && removeMouseOver)
                        {
                        
                            var sLayer = L.Proj.geoJson(oFullJSON, {
                               style: oLocatedStyle,
                               onEachFeature: mouseOverOff.bind(this)
                            });
                            gMainMap.addLayer(sLayer);
                        }


                
                    })
             .fail(function (jqXHR, textStatus, errorThrown) {
                 ShowMessageForm("Cant load map data. Please check you are authorised to connect to M.App Enterprise.");
                 console.log(jqXHR);
                 console.log(textStatus);
                 console.log(errorThrown);
             });
            }
            catch (e) {
                ShowMessageForm(e.message);
            }
            finally {
            }
        }
	
  
	
	 
	// Get the related records from database by passing the corresponding of  Planning Reference a polygon
        function GetRelatedRecords(i,Id, relatedToolTip, oSearchLayer)
        {
            var responseResult =[];
 

            $.ajax({
                type: "post",
                url: "MapZone.aspx/GetRelatedTooltipInfo",
                async:false,
                data: '{referenceId :"' + Id + '"}',
                contentType: "application/json;charser=utf-8",
                dataType: "json",
                ajaxI:i,
                success:function(response)
                {
                    
                    if (response.d !=="" && response.d!== "[]")
                    {
                
                        var data = JSON.parse(response.d);
                        var countResult = data.length;
                        var column = "";
                        var value = "";
                        var urlGeneric = data[0].Url;
                        var urlSpecific = "";
                        var relatedTooltipInfo = "";
                        var urlSpecificGeneric = "";
                        var columnCount = 0;
                       
                        urlSpecificGeneric = "href=" + urlGeneric.replace("{Parameter}", Id);
                       
               
                        relatedToolTip = relatedToolTip.replace('href=', urlSpecificGeneric);
                        relatedTooltipInfo = '<table><tbody class="AppTable" id="stab" style="display:none">';                    
                        relatedTooltipInfo += '<tr>';
                        relatedTooltipInfo += '<td class="Apptd">' + data[0].column + '</td>';
                        relatedTooltipInfo += '<td class="Apptd">' + data[1].column  + '</td>';
                        relatedTooltipInfo += '</tr>';
                        for (var i = 0; i < (countResult) ; i = i + 2) {
                            if (data[i].value == "" || data[i].value == null)
                            {
                                column = "Not Available";
                            }
                            else {
                                column = data[i].value;
                            }
                            if (data[i+1].value == "" || data[i+1].value == null)
                            {
                                value = "Not Available";

                            }
                            else {
                                value = data[i + 1].value;
                            }
                    
                            urlSpecific = urlGeneric.replace("{Parameter}", column);
                    // Dynamically genearating the html for related records tab
                            relatedTooltipInfo += '<tr>';
                            relatedTooltipInfo += '<td class="Apptd">' + '<a target ="_blank" href=' + urlSpecific+ '>'+ column + '</a>' +  '</td>';
                            relatedTooltipInfo += '<td class="Apptd">' + value + '</td>';
                            relatedTooltipInfo += '</tr>';
                           // Combine the html for Genaral tab and related records tab
                            var fullToolTipInfo = relatedToolTip + relatedTooltipInfo;
                        }

                        fullToolTipInfo += '</tbody><table>';
                     

                     
                        var oCenter = oSearchLayer.getBounds().getCenter();
                      
                        var popup = L.responsivePopup({CloseOnClick:false,autoClose:false})
                                        .setLatLng([oCenter.lat, oCenter.lng])
                                         .setContent( fullToolTipInfo)
                                        .openOn(gMainMap);
										
								  
		 document.getElementsByClassName("AppTabReg")[0].style.backgroundColor="white";
		 document.getElementsByClassName("AppTabReg")[0].style.borderBottomColor  ="white";
		 $(".AppTabReg").hover(function(){$(this).css("background-color","grey");},function(){$(this).css("background-color","white");})
	    $(".AppTabRelated").hover(function(){$(this).css("background-color","grey");},function (){$(this).css("background-color","white");})
						

                    }
                     // else {

                         // var data = JSON.parse(response.d);
                        // var countResult = data.length;
                        // var column = "";
                        // var value = "";
                        // var urlGeneric = data[0].Url;
                         // var urlSpecific = "";
                         // var relatedTooltipInfo = "";
                         // var urlSpecificGeneric = "";
                        // var columnCount = 0;
                       
                        // urlSpecificGeneric = "href=" + urlGeneric.replace("{Parameter}", Id);
                   
                       // relatedToolTip = relatedToolTip.replace('href=', urlSpecificGeneric);
                        // var oCenter = oSearchLayer.getBounds().getCenter();
                        
                       // var popup = L.responsivePopup({CloseOnClick:false,autoClose:false})
                                        // .setLatLng([oCenter.lat, oCenter.lng])
                                         // .setContent( relatedToolTip )
                                        // .openOn(gMainMap);
                       
                     // }
           
         
                },
                error:function()
                {
                    return "";
                }
            })

            
    
        }


        function mouseOverOff(feature,layer)
        {
             debugger; 
        }
		// This function apply the mouseover event to each polygon in the Geojson data
        function onEachFeature(feature, layer) {

            try {
				
                   var ocenter = layer.getBounds().getCenter();                   
                    var polygon = JSON.stringify(feature.properties.Plan_Ref);
                    var vtooltip = polygon.replace(/^"(.*)"$/, '$1');
                  
                  layer.on('mouseover', function () {
                
              if(layer.feature.geometry.type!=="Point")
                  {               

                    try {

                    var popup   = L.responsivePopup({autoClose:true})
                                      .setLatLng([ocenter.lat, ocenter.lng])
                                       .setContent(vtooltip)
                                       .openOn(gMainMap) //Adding pop up for each polygon on hover
						

                    }
                    catch (e) {
                        showmessageform(e.message);
                    }
                    finally {
                    }
                  }
				 
				});				
				
				layer.on('mouseout', function() { 
			
			});
				}

            

            catch (e) {
                ShowMessageForm(e.message);
            }
            finally {
            }
        }
        

        function ShowMessageForm(sMessage) {
            try {
                document.getElementById('messageFormTextDIV').innerText = sMessage;
                $('#messageForm').modal();
            }
            catch (e) {
                debugger;
            }
            finally {
            }

        }

        function showSearch()
        {
            if (g_bLoadEvent) {
                document.getElementById('pac-input').style.visibility = 'visible';
                gMainMap._onResize();
            }
            g_bLoadEvent = false;
        }

        function showFTSearch()
        {
            if( document.getElementById('freetext').style.display =='hidden')
            {
                document.getElementById('freetext').style.display == 'block';
            }
            if( document.getElementById('freetext').style.display =='block')
            {
                document.getElementById('freetext').style.visibility == 'visible';
            }

        }
    
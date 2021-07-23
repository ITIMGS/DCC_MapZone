var gResults = null;
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
var freeTextQuery = "";
var click =1;

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
   var now = new Date();
   token.expiration_date = new  Date(now.getTime()+token.expires_in*1000);// token.expiration_date = Date.now() + (token.expires_in * 1000);
   
    window.localStorage.setItem('apps_storage', JSON.stringify(token));


    //setTimeout(function () {
   //     window.location = targetPage + "?" + sHeaderParams;
   // }, 3000);
}

function showError(error) {
    

}
// -------------------------------------------------------

function LayerTooltips(name, mytooltip) {
    this.name = name;
    this.mytooltip = mytooltip;
}
String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}


//------------------------------------------------------------

//Pragruthi changes
//---------------------------------------------------------
/*
var urlParam = function (name, w) {
    w = w || window;
    var rx = new RegExp('[&]' + name + '=([&\#]+)'), 
        val = w.location.search.match(rx);
    return !val ? '' : val[1];
}*/


var urlParam = function (name, w) {
    w = w || window;
    var rx = new RegExp('[\&]' + name + '=([^/\&\#]+)'), 
        val = w.location.search.match(rx);
    return !val ? '' : val[1];
}


//------------------------------------------------------------
//Pragruthi changes end 
//-----------------------------------------------------------
function Authenticate(username,password,tenant,auth)
{ sHeaderParams = location.search.substr(1);
 

    location.search.substr(1).split("&").forEach(function (item) {
        queryDict[item.split("=")[0]] = item.split("=")[1]
    });

	queryDict["tenant"] = tenant;

	 $.ajax({
        url: auth,
        headers: queryDict,
        data: { grant_type: 'password', username: username, password: password, client_id: 'App' },
        type: 'POST',
		async:false,
		success:function(token){
  output.text('Login successful, redirecting in 3 seconds..')
   var now = new Date();
   token.expiration_date = new  Date(now.getTime()+token.expires_in*1000);// token.expiration_date = Date.now() + (token.expires_in * 1000);
  
    window.localStorage.setItem('apps_storage', JSON.stringify(token));

		}
    })
}

function LoadMap() 
{
    try
    {
	   g_bLoadEvent = true;
       search = urlParam('search');
	  tooltip = urlParam('tooltip');
		var username = GetUserName();
		var password = GetPassword ();
		var Tenant = GetTenant();
		var authUrl =GetAuthUrl();
		freeTextQuery = GetFreeTextTable();
  
var headerParams = window.localStorage.getItem('apps_storage');

    Authenticate(username,password,Tenant,authUrl);       



        var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmAttribution = 'Map data <a target="_blank" href="http://www.openstreetmap.org">OpenStreetMap.org</a>' +
                                ' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        var osmLayer = new L.TileLayer(osmUrl, {
            maxZoom: 19,
		
            attribution: osmAttribution
        });


       // var baseMaps = { "OpenStreetMap": osmLayer };
       // gMainMap = L.map("map", {
       //     zoomControl:true,
      //      center: new L.LatLng(55.8, 37.7)
      //      , zoom: 7
      // });
      //  gMainMap.zoomControl.setPosition('topright');
      //  gMainMap.addLayer(osmLayer);

// For google map
var osmLayerG = new L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
maxZoom: 19,
subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}); 

/* End of modification by Kazi 09-10-2020   */
        //var baseMaps = { "OpenStreetMap": osmLayer};
        
		var baseMaps = { "OpenStreetMap": osmLayer, "GoogleMap": osmLayerG};
		//var baseMaps = { "OpenStreetMap": osmLayer, "GoogleMap": osmLayerG };
		
        gMainMap = L.map("map", {
            zoomControl:true,
            center: new L.LatLng(55.8, 37.7)
            , zoom: 7
        });
      //  gMainMap.zoomControl.setPosition('topright');

/* update by Kazi 09-10-2020 for Google Map   */		
//        gMainMap.addLayer(osmLayer);
		gMainMap.addLayer(osmLayerG);
/* End of modification by Kazi 09-10-2020   */


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
            
        }
        finally {
        }
        var overlayMaps = {};
        var sLayer = "";
        var sWMSURL = "";
        var arrayLength = sLayers.length;
        arrayLen = arrayLength;

        var oWMSLayer = null;

      if(srid!=='2157')
	  {
      proj4.defs("EPSG:29903", "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs");
      proj4.defs("urn:ogc:def:crs:EPSG::29903", "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs");
	  }
	  else{  
	 
      proj4.defs("EPSG:2157", "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=0.99982 +x_0=600000 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
      proj4.defs("urn:ogc:def:crs:EPSG::2157", "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=0.99982 +x_0=600000 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
	  }
	   
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
           if (srid !=='2157')
		{
      
                var options = {
                    layers: sLayers[i].name
                                    , format: 'image/png'
                                    , crs:L.CRS.EPSG3857
                                    , version: '1.3.0'
                                    , TILED: true
                                    , transparent: true
                                    , layerid: sLayers[i].layerid
                                    , zIndex: nZIndex - (nzInc * i)
                                    , apiKey: sLayers[i].token									
									, maxZoom: 20
									
								 
									
								
                    ,
                };
		}
		else{
			
                var options = {
                    layers: sLayers[i].name
                                    , format: 'image/png'
                                    , crs:L.CRS.EPSG2157
                                    , version: '1.3.0'
                                    , TILED: true
                                    , transparent: true
                                    , layerid: sLayers[i].layerid
                                    , zIndex: nZIndex - (nzInc * i)
                                    , apiKey: sLayers[i].token									
									, maxZoom: 20
									
								 
									
								
                    ,
                };
		}
		            
           
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

                    
                        queryLayerInfo(sDataURL, false, false, false, false,"");
                    }
                 else if (sLayers[i].maxSCALE==="")
                 {
                        queryLayerInfo(sDataURL, false, true, false, false,"");
                    }
					else{
						  queryLayerInfo(sDataURL, false, true, false, false,"");
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
        //gMainMap.on("zoomstart", mZoomStart);//function mZoomStart fires on zooming
        gMainMap.on("zoomend", mZoomEnd);
        gMainMap.on('overlayremove', onOverlayRemove);//function onOverlayRemove fires on removing a layer on the layer control i.e Unchecking the checkbox in the control
              
        
        
              
        RegisterSearchControl();
        //  var control = layersControl.getOverlays(); // { Truck 1: true, Truck 2: false, Truck 3: false }
        currentScale = $('.leaflet-control-scalefactor-line').text();    
       
	   
		//Added by C.Kinane (DCC) to zoom to feature 28/11/2019*********************START**********************
		
		
		var query_string = window.location.search.substring(1);
		var parsed_qs = parse_query_string(query_string);
		
				
		if (parsed_qs.zoomto === undefined) {
		// if there is no zoomto value passed in we ignore and carry on loading the MapZone page as normal.	
		//	alert("Its undefined!");
		//	document.getElementById('freetext').setAttribute("value", parsed_qs.zoomto);
		//	GetSearchItemLayer();
		} else {
			//If zoomto is passed in - we get the value and populate the search input box.
			document.getElementById('freetext').setAttribute("value", parsed_qs.zoomto);
			GetSearchItemLayer();
		}
		
		//Added by C.Kinane (DCC) to zoom to feature 28/11/2019*********************END**********************
}

	
	
    catch (e)
{
        ShowMessageForm(e.message);
    }
    finally {
    }
}

//Added by C.Kinane (DCC) to zoom to feature 28/11/2019*********************START**********************
function parse_query_string(query) {
	//Function to parse the input query string - added by C.Kinane 28/11/2019
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    // If first entry with this name
    if (typeof query_string[key] === "undefined") {
      query_string[key] = decodeURIComponent(value);
      // If second entry with this name
    } else if (typeof query_string[key] === "string") {
      var arr = [query_string[key], decodeURIComponent(value)];
      query_string[key] = arr;
      // If third or later entry with this name
    } else {
      query_string[key].push(decodeURIComponent(value));
    }
  }
  return query_string;
}
//Added by C.Kinane (DCC) to zoom to feature 28/11/2019*********************END**********************

function mZoomStart()
{

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
                            queryLayerInfo(dUrl, false, true, false, false,"");
							 
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

							
							//while(index<=(sWFSUrlCollection[j].length))
						while(index<(1))
							{
								
						     var bounds = gMainMap.getBounds();

                            var oNewCoords1 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._northEast.lng, bounds._northEast.lat]);
                            var oNewCoords2 = proj4('EPSG:4326', 'EPSG:'+srid, [bounds._southWest.lng, bounds._southWest.lat]);

                            var dUrl = sWFSUrlCollection[j].sDataURL;
							dUrl += '&BBOX=' + (oNewCoords1[0]) + "," + (oNewCoords1[1]) + "," + (oNewCoords2[0]) + "," + (oNewCoords2[1]);
							
                           queryLayerInfo(dUrl, false, false, false, true,"");						   
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
                            queryLayerInfo(dUrl, false, true, false, false,"");
							 
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
                            queryLayerInfo(dUrl, false, false, false, true,"");						   
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

if (sWFSUrlCollection.length !== 0) 
{
for(var i=0;i<sWFSUrlCollection.length;i++)
{
if(layersChecked.includes(sWFSUrlCollection[i].Name))
{
	
	var cScale = currentScale.split(":");
    var minScale = cScale[0];
	
    var vScale = Number(removeCommas(cScale[1]));
	if ((vScale >Number(sWFSUrlCollection[i].layerMaxScale)))// ||(sWFSUrlCollection[i].layerMaxScale === ""))
		{
		var leng = $(".leaflet-popup-close-button").length;
	                      if(leng>0)
	                          {
		                       for(var j=0;j<leng;j++)
		                         {
	                            $(".leaflet-popup-close-button")[j].click();
		                         }
	                            }
	}
                          
	
}

  // $("#map").trigger("resize");

}
}
}




//To remove comma from scale value
function removeCommas(str) {
    while (str.search(",") >= 0) {
        str = (str + "").replace(',', '');
    }
    return str;
};

function onOverlayRemove(e) {
	

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
                 queryLayerInfo(dUrl, false, false, false, true,"");
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
                            queryLayerInfo(dUrl, false, true, false, false,"");
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
	
 queryLayerInfo(dataUrl, false,false,true,false,searchLayer);
	
	
 
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
        success: function (response) {var datalayer =  (response.d);
			 callQueryAPI(datalayer,data);     
          
                    
         

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
    
        
            var sDataURL = "";
            try {              

                //sDataURL = sSearchFeatureLayerMainURL;
click=1;

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

                   

					 
                            queryLayerInfo(sDataURL, true, false, false,false,sWFSUrlCollection[i].Name);
							console.log(sDataURL);
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
        function queryLayerInfo(sDataURL, bFromClickEvent,bFromMouseMoveEvent,bfreeTextSearchEvent,removeMouseOver,cLayerName) {
          try {
    
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
							//Style for turned on features
                            weight: 0.,
                            opacity: 5,
                            fillOpacity: 0,
                            color: 'white',
                            dashArray: '0.0001'
                        };
                         var oOtherStyle = {
                            weight: 1,
                            opacity: 3,
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
												//gMainMap.fitBounds(oSearchLayer.getBounds(),{maxZoom:17});//Currnet maxZoom set to 17 to display  freetext search result at a scale of 1:2849,Change this value if this scale has to be changed
                                               
												
												
                                            }

                                        if(bFromClickEvent )
										{
                                         for(var i=0;i<oLayerTooltips.length;i++)
											 {
										 
									if(cLayerName==oLayerTooltips[i].name)
									{ 
                                            var sTooltip = oLayerTooltips[i].mytooltip;
                                         for(var j=0;j<obj.features.length;j++)
										 {
									 if(j==1)
									 {return;}
                                            var attrs = Object.keys(obj.features[j].properties)
                                            for (var nAttr = 0; nAttr < attrs.length; nAttr += 1) 
											{
                                                attribute = attrs[nAttr];
                                                value = obj.features[featureCount-1].properties[attribute];

                                                sTooltip = sTooltip.replaceAll("*[" + attribute + "]*", value);
											
                                                if ((attribute.toUpperCase()) === (tooltip.toUpperCase()))
													{
                                                   
                                                    var Id = value;
                                                }
										

                                            }
											sTooltip = sTooltip.replaceAll("|", "'");
                                            sTooltip = sTooltip.replaceAll("nbsp;", " ");
                                            sTooltip = sTooltip.replaceAll("<br/>", " ");
                                            sTooltip = sTooltip.replaceAll("<br>", " ");
                                            sTooltip = sTooltip.replaceAll("<br />", " ");


                                            relatedTooltip = sTooltip;
                                          
	                                         
                                           if(bFromClickEvent && click==1) // if ((bFromClickEvent && ! bfreeTextSearchEvent) ||(!bFromClickEvent && bfreeTextSearchEvent))
											{


                                            click=0;
													 GetRelatedRecords(i, Id, relatedTooltip, oSearchLayer,true);
											
											
                                            }
                                            }
											
										//	i=oLayerTooltips.length;
											}
										
										}
										}
										else
										{
											for(var k=0;k<oLayerTooltips.length;k++)
											{
											if(cLayerName==oLayerTooltips[k].name)
									{
											var sTooltip = oLayerTooltips[k].mytooltip;
                                    
                                            var attrs = Object.keys(obj.features[i].properties)
                                            for (var nAttr = 0; nAttr < attrs.length; nAttr += 1) 
											{
                                                attribute = attrs[nAttr];
                                                value = obj.features[i].properties[attribute];

                                                sTooltip = sTooltip.replaceAll("*[" + attribute + "]*", value);
											
                                                if ((attribute.toUpperCase()) === (tooltip.toUpperCase()))
													{
                                                   
                                                    var Id = value;
                                                }
										

										     }
											 
											 sTooltip = sTooltip.replaceAll("|", "'");
                                            sTooltip = sTooltip.replaceAll("nbsp;", " ");
                                            sTooltip = sTooltip.replaceAll("<br/>", " ");
                                            sTooltip = sTooltip.replaceAll("<br>", " ");
                                            sTooltip = sTooltip.replaceAll("<br />", " ");


                                            relatedTooltip = sTooltip;
                                          
	                                         if(bfreeTextSearchEvent)  
                                            // if ((bFromClickEvent && ! bfreeTextSearchEvent) ||(!bFromClickEvent && bfreeTextSearchEvent))
											{


                                              
													 GetRelatedRecords(i, Id, relatedTooltip, oSearchLayer);
											
											
                                            }
                                           
										
											
										}
											}
                                            
										}	
										
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
                                                                                              
                                               // if (attribute !== tooltip) 
											//	{delete obj.features[i].properties[attribute]; //Deleting other properties of features to retain only Plan_Ref so as to improve performance
                                                   
												//}

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
        function GetRelatedRecords(i,Id, relatedToolTip, oSearchLayer,isClick)
        {
            var responseResult =[];
			var fullToolTipInfo="";


 if(Id !==undefined)
 {
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
						  
                             fullToolTipInfo = relatedToolTip + relatedTooltipInfo;
						   
                        }

                        fullToolTipInfo += '</tbody><table>';                
if(!isClick)
{
                      gMainMap.fitBounds(oSearchLayer.getBounds(), { maxZoom: 17 });
}
                        var oCenter = oSearchLayer.getBounds().getCenter();
                      
                        var popup = L.responsivePopup({autoClose:false})
                                        .setLatLng([oCenter.lat, oCenter.lng])
                                         .setContent( fullToolTipInfo)
                                        .openOn(gMainMap);
						
								  
		 document.getElementsByClassName("AppTabReg")[0].style.backgroundColor="white";
		 document.getElementsByClassName("AppTabReg")[0].style.borderBottomColor  ="white";
		 $(".AppTabReg").hover(function(){$(this).css("background-color","grey");},function(){$(this).css("background-color","white");})
	    $(".AppTabRelated").hover(function(){$(this).css("background-color","grey");},function (){$(this).css("background-color","white");})
						

                    }
                     
                },
                error:function()
                {
                    return "";
                }
            })
			
		

 }
 if(fullToolTipInfo=="")
 {
  var oCenter = oSearchLayer.getBounds().getCenter();
                      
                        var popup = L.responsivePopup({autoClose:false})
                                         .setLatLng([oCenter.lat, oCenter.lng])
                                          .setContent(relatedToolTip)
                                        .openOn(gMainMap)
 }
    
        }


        function mouseOverOff(feature,layer)
        {
             
        }
		// This function apply the mouseover event to each polygon in the Geojson data
        function onEachFeature(feature, layer)
		{

            try {
			
                   var ocenter = layer.getBounds().getCenter();                   
                    var polygon =JSON.stringify(feature.properties.Plan_Ref);				
		              
		//console.log(Object.values(feature.properties)[0]);
					if(polygon!==undefined)
					{
                     var vtooltip = polygon.replace(/^"(.*)"$/, '$1');
					 
					}
					else 
					{
						 var registerNo = JSON.stringify(feature.properties.Register_No);
						 var  vtooltip ="" ;
						 if(registerNo!==undefined)
						 {
							 vtooltip =  registerNo.replace(/^"(.*)"$/, '$1');
					
						 }
						 else
						 {
							  vtooltip = Object.values(feature.properties)[1];
						 }
					}
					
					
					
                  
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
    function callQueryAPI(cLayerName,data)
{
	/*The section of code closes the popup already open before showing another one*/
  var leng = $(".leaflet-popup-close-button").length;
	                                 if(leng>0)
	                               {
		                         for(var j=0;j<leng;j++)
		                         {
	                            $(".leaflet-popup-close-button")[j].click();
		                         }
	                              }

  /*Popup code ends*/
	
    var headerParams = window.localStorage.getItem('apps_storage');
    

    

  var baseUrl=  bUrl.replace("/geoservices/wms/","/sqlquery/");
  var authUrl = bUrl.replace("/geoservices/wms/","/oauth2/token");

  var queryapi = baseUrl + cLayerName + '?query=' + freeTextQuery + "'" + data + "'" + '&format=geojson&srid=' + '' + srid + '';
  //  var queryapi = 'Https://DUBDT011/api/v1/sqlquery/'+cLayerName+'?query=' + 'select * from planningmaster where plan_Ref=' + "'"+data+"'" + '&format=geojson&srid='+''+srid+'';
    var headerParams = window.localStorage.getItem('apps_storage');

    var tokenparse = JSON.parse(headerParams);
    var tokenstring = tokenparse.access_token;
    var refreshToken =tokenparse.refresh_token;
 
    $.ajax({
        url: queryapi,
        type: 'GET',
        ContentType: 'Application/json',
        beforeSend: function (xhr, textStatus, ex) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + tokenstring);
            xhr.setRequestHeader('Tenant', bTenant);
        },
		statusCode:{401:function (){
  alert("Session Expired.Do you want to reload?");
			
			window.location.reload();
		}},
        success: function (data) {
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
            // var oLocatedStyle = {
                // weight: 0.,
                // opacity: 5,
                // fillOpacity: 0,
                // color: 'white',
                // dashArray: '0.0001'
            // };
			 var oLocatedStyle = {
                            weight: 0.,
                            opacity: 5,
                            fillOpacity: 0,
                            color: 'white',
                            dashArray: '0.0001'
                        };
						
			//The style for the zoomTo from url. Updated by C.Kinane (DCC) 29/11/2019.
            var oOtherStyle = {
				
                fillOpacity: 0.5,
                color: 'red',
				dashArray: '10',
				
				
            };

            var sStyle = oLocatedStyle;
            var featureLength = 0;
            var bSingleFeatureOnly = true;
            oZoomToJSON.features.push(obj.features[0]);
            oSearchLayer = L.Proj.geoJson(oZoomToJSON,
                                       {
                                           style: oOtherStyle
                                       });
            gMainMap.addLayer(oSearchLayer);
            var cZoom = gMainMap.getZoom();
            if (oSearchLayer !== "") {
            //    gMainMap.fitBounds(oSearchLayer.getBounds(), { maxZoom: 17 });

            }
            
            var featureCount = obj.features.length;
            for (var i = 0; i < oLayerTooltips.length; i++) {
                if (cLayerName == oLayerTooltips[i].name) {

                    var sTooltip = oLayerTooltips[i].mytooltip;
                    for (var j = 0; j < obj.features.length; j++) {
                        var attrs = Object.keys(obj.features[j].properties)
                        for (var nAttr = 0; nAttr < attrs.length; nAttr += 1) {
                            attribute = attrs[nAttr];
                            value = obj.features[featureCount - 1].properties[attribute];

                            sTooltip = sTooltip.replaceAll("*[" + attribute + "]*", value);

                            if ((attribute.toUpperCase()) === (tooltip.toUpperCase())) {

                                var Id = value;
                            }


                        }
                        sTooltip = sTooltip.replaceAll("|", "'");
                        sTooltip = sTooltip.replaceAll("nbsp;", " ");
                        sTooltip = sTooltip.replaceAll("<br/>", " ");
                        sTooltip = sTooltip.replaceAll("<br>", " ");
                        sTooltip = sTooltip.replaceAll("<br />", " ");


                        relatedTooltip = sTooltip;



                        GetRelatedRecords(i, Id, relatedTooltip, oSearchLayer,false);



                    }

                }




            }
        }
    });

}
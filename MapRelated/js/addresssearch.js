
var g_nMiniCircleRadius = 6;
var g_nLargeCircleRadius = 50;
var oPerimeterCircle = null;
var oMiniPerimeterCircle = null;
var intervalHandle = null;

//String.prototype.replaceAll = function (search, replacement) {
//    var target = this;
//    return target.replace(new RegExp(search, 'g'), replacement);
//};

function RegisterSearchControl() {
    try {
        m_bSearchRegistered = true;

        var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(51.172253706, -11.133929491),
                                                            new google.maps.LatLng(55.5097894249, -5.2672302723));

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        //var searchBox = new google.maps.places.SearchBox(input, {bounds: defaultBounds});

        var options = { componentRestrictions: { country: 'irl' } };
        var searchBox = new google.maps.places.Autocomplete(input, options);

        searchBox.addListener('place_changed', function () {
            var place = searchBox.getPlace();

            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            try {
                oDrawnItems.clearLayers();
            }
            catch (ex) {

            }
            finally {
            }

            try {
                var sAddress = place.adr_address;
                if (sAddress.indexOf(place.name) < 0) {
                    sAddress = "<span class=\"street-address\">" + place.name + "</span><br/>" + sAddress;
                }
                var oMap = gMainMap;
                oMap.panTo(new L.LatLng(place.geometry.location.lat(), place.geometry.location.lng()));
                AddAlertPositionCircle(sAddress, place.geometry.location.lat(), place.geometry.location.lng(), true);
            }
            catch (ex) {

            }
            finally {
            }



        });



    }
    catch (ex) {

    }
    finally {

    }
}


function AddAlertPositionCircle(sPlaceName, sCoord2, sCoord1, bGoogleLocation) {
    try {

        if (!(oPerimeterCircle == undefined || oPerimeterCircle == null)) {
            ClearAlertPosition(false);
        }

        {
            var sPlaceTable = "";

            sPlaceTable += "<table style='width: 300px;'>";
            sPlaceTable += "<tr>";
            sPlaceTable += "<td>";
            //sPlaceTable += "<img src='css/images/geolocation.png'/></td>";
           sPlaceTable += "<td>" + sPlaceName + "<br/><br/><a onclick='ClearAlertPosition(1)' href='#'></a></td>";
            sPlaceTable += "</tr>";
            sPlaceTable += "</tr>";

            if (bGoogleLocation == true) {
                sPlaceTable += "<tr>";
                //sPlaceTable += "<td style='text-align: center;' colspan=2><hr/><img src='css/images/powered-by-google/desktop/powered_by_google_on_white.png'/></td>";
                sPlaceTable += "</tr>";
            }

            sPlaceTable += "</table>";

            oPerimeterCircle = L.circle([sCoord2, sCoord1]
										//, g_nLargeCircleRadius,
										//{
										//    color: 'green',
										//    fillColor: '#66CD00',
										//    fillOpacity: 0.3,
										//    TOOLTIP: "Point of interest"
										//}
                                        );

            oPerimeterCircle.addTo(gMainMap).bindPopup(sPlaceTable).openPopup();;

            //SENAN
            oMiniPerimeterCircle = L.circle([sCoord2, sCoord1]
										//, g_nMiniCircleRadius,
										//{
										//    color: '#0097BA',
										//    fillColor: '#12A5D5',
										//    fillOpacity: .5,
										//    dashArray: '10,10'
										//}
                                        );


            oMiniPerimeterCircle.on('add', function (e) {
                //doAnimations();
                // putting this in setInterval so it runs forever
                //intervalHandle = setInterval(function () { doAnimations() }, 1200);
            });

            sPlaceName = sPlaceName.replaceAll(',', '<br/>');



            oMiniPerimeterCircle.addTo(gMainMap).bindPopup(sPlaceTable).openPopup();

            gMainMap.setView([sCoord2, sCoord1], 17);
        }

    }
    catch (ex) {
        alert(ex.message);
    }
    finally {

    }

}

function ClearAlertPosition(bClearLabel) {
    try {

        if (oPerimeterCircle != undefined) {
            gMainMap.removeLayer(oPerimeterCircle);
        }
        if (oMiniPerimeterCircle != undefined) {
            gMainMap.removeLayer(oMiniPerimeterCircle);
        }

        if (intervalHandle != null) {
            clearInterval(intervalHandle);
            intervalHandle = null;
        }


    }
    catch (ex) {
        alert(ex.message);
    }
    finally {

    }
}



//function doAnimations() {
//    setTimeout(function () {
//        try {
//            oMiniPerimeterCircle.setRadius(g_nMiniCircleRadius * 1.2);
//        }
//        catch (ex) {
//        }
//        finally {

//        }
//    }, 100);
//    setTimeout(function () {
//        try {
//            oMiniPerimeterCircle.setRadius(g_nMiniCircleRadius * 1.4);
//        }
//        catch (ex) {
//        }
//        finally {

//        }
//    }, 300);
//    setTimeout(function () {
//        try {
//            oMiniPerimeterCircle.setRadius(g_nMiniCircleRadius * 1.6);
//        }
//        catch (ex) {
//        }
//        finally {

//        }
//    }, 500);
//    setTimeout(function () {
//        try {
//            oMiniPerimeterCircle.setRadius(g_nMiniCircleRadius * 1.4);
//        }
//        catch (ex) {
//        }
//        finally {

//        }
//    }, 900);
//    setTimeout(function () {
//        try {
//            oMiniPerimeterCircle.setRadius(g_nMiniCircleRadius * 1.2);
//        }
//        catch (ex) {
//        }
//        finally {

//        }
//    }, 1100);
//};
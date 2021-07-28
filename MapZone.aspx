<%@ Page Language="C#" AutoEventWireup="true" CodeFile="MapZone.aspx.cs" Inherits="MapZone" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title> <%=m_sMapName %> Map</title>
     <meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	
	<link rel="shortcut icon" href='favicon.ico'/>    

      
    <!-- Bootstrap  -->    
    
    <link href="MapRelated/css/bootstrap2.css" rel="stylesheet" />
    <link href="maprelated/bootstrap/dist/css/bootstrap.css" rel="stylesheet" /> 
    <link href="MapRelated/css/leaflet.scalefactor.min.css" rel="stylesheet" />   
    <script src="maprelated/js/jquery.js"></script>    
    <script src="maprelated/js/popper.js"></script>
    <script src="maprelated/bootstrap/dist/js/bootstrap.min.js"></script>
   
    <link href="maprelated/leaflet/leaflet.css" rel="stylesheet" />
    <link href="maprelated/css/imgs.css" rel="stylesheet" />
    <link href="MapRelated/css/leaflet.draw.css" rel="stylesheet" />   
    <link href="MapRelated/css/font-awesome.min.css" rel="stylesheet" />
    <link href="MapRelated/css/leaflet.responsive.popup.css" rel="stylesheet" />
    <link href="MapRelated/css/leaflet.responsive.popup.rtl.css" rel="stylesheet" />
    <%--     <link href="MapRelated/css/mapmenu.css" rel="stylesheet" />
    <link href="MapRelated/css/dragdiv.css" rel="stylesheet" />--%>
     
    <link href="MapRelated/css/L.Control.ZoomBox.css" rel="stylesheet" />

    <link href="MapRelated/css/Popup.css" rel="stylesheet" />

    <link href="MapRelated/css/custom.css" rel="stylesheet" />


    <script src="maprelated/leaflet/leaflet-src.js"></script>    
    <script src="maprelated/js/leaflet-wmts.js"></script>
    <script src="MapRelated/js/leaflet.vectorgrid.js"></script>
    <script src="MapRelated/js/Proj4.js"></script>
    <script src="maprelated/proj4leaflet/lib/proj4-compressed.js"></script>

    <script src="MapRelated/js/leaflet-imageoverlay-wms.js"></script> 
    <script src="MapRelated/js/leaflet.draw-src.js"></script>
    <script src="MapRelated/js/leaflet.draw.js"></script>       
    <script src="maprelated/js/imgs.js"></script>
    <script src="MapRelated/js/addresssearch.js"></script> <%--added by sreedevi--%>
    <script src="MapRelated/leaflet/leaflet.responsive.popup.js"></script>
    
    <%--    Added by sreedevi--%>
	<!-- Begin Cookie Consent plugin by Silktide - http://silktide.com/cookieconsent -->
    <link href="MapRelated/css/cookieconsent.min.css" rel="stylesheet" />
    <script src="MapRelated/js/cookieconsent.min.js"></script>
    <%--Prag Links--%> 
          <link rel="stylesheet" href="maprelated/css/leaflet-search.min.css"/>
    
    <script type="text/javascript" src="MapRelated/js/leaflet-search.min.js"></script>
    <script type="text/javascript" src="MapRelated/js/place.js"></script>
        <%--Prag Links End--%> 
 <%--   <script src="MapRelated/js/Control.Home.js"></script>
    <script src="MapRelated/js/Control.ZoomHome.js"></script>--%>

        
       <script src="MapRelated/js/L.Control.ZoomBox.min.js"></script>
    
   <script src="MapRelated/js/jquery-1.11.2.js"></script>
     <script src="MapRelated/js/jquery-1.12.1-ui.js"></script>
    <script src="MapRelated/js/jquery-ui.js"></script>
    <link href="MapRelated/css/jquery-ui.css" rel="stylesheet" />
  
</head>
<body onload="LoadMap()">
 
    <form id="form1" runat="server">
    <asp:ScriptManager ID="ScriptManager1" EnableCdn="true" runat="server">
    </asp:ScriptManager>

    <!-- header -->
    <header class="page-header font-small blue">

        <div>
                <img src="MapRelated/css/custom/customerlogo.png" class="header-img " alt="<%=m_sMapName %>"/>
        </div>
          <%--    added by sreedevi--%>
        
     <div class="row" style="margin-top:20px;">     
	  <div class="col-50 address">
	  <input 	id="pac-input"   type="text"   placeholder="Address Search" /></div>
	   <div class="col-50 freetext">
	  <input 	id="freetext" z-index:10000;"  name ="freetext" class="controls" type="text"  placeholder="Planning Application Search" /></div>
	  </div>            
                                          
                          
                             
        
        <div class="header-text text-center py-3"><b>Welcome to Dublin City Planning Application Map</b><br /></div>
         
      
      <!-- Copyright -->
    </header>
    <!-- header -->

    <section class="dc4container">
    <%-- added by sreedevi--%>
        <div>
            <asp:GridView ID="gvPopup" runat="server" AutoGenerateColumns="false">
                <Columns>
                    <asp:BoundField  HeaderText="Application" />
                </Columns>
            </asp:GridView>
            
        </div>
        <%--end by sreedevi--%>
         <div id="leftSide" class="full">
                 
            <div id="map" class="dc4map">
         
            </div>
        </div>
     
    </section>
   
    <!-- Cookie -->
        <div class="cookie_container"></div>
    <!-- Cookie -->
    </form>

    <!-- Message Form -->
    <div class="modal fade" id="messageForm" tabindex="-1" role="dialog" aria-labelledby="messageFormLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="messageFormLabel">Please Note</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div id="messageFormTextDIV" class="modal-body">
            hello
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <script src="MapRelated/leaflet/leaflet.scalefactor.min.js"></script>
    <script>
   //  tell the embed parent frame the height of the content
    if (window.parent && window.parent.parent){
        window.parent.parent.postMessage(["resultsFrame", {

        height: document.body.getBoundingClientRect().height,
        slug: "xg41w12v"
      }], "*")
    }
	
   $("#freetext").on("autocompleteclose", function () {
        GetSearchItemLayer();
    });

    
   
    $(document).ready(function () {
        $("#freetext").autocomplete({
         
            source: function (request, response) {
                var freetext = $("#freetext").val();
             
                    $.ajax({
                        type: "post",
                        url: "MapZone.aspx/Freetextsearch",
                        data: '{request:"' + freetext + '"}',  //'{request:"' + request["term"] + '"}',
                        contentType: "application/json;charser=utf-8",                        
                        dataType: "json",
                        success: function (data) {

                        
                            response(data.d);


                        },
                        error: function () {
                            return "";
                        }
                    })               
               
            }, minLength: 2
        });
    });

  </script>
   

       
     
<script src="MapRelated/js/Popup.js"></script>
    

    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
</body>
</html>

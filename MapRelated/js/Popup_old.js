﻿function openCity(event, tabname) {
   debugger;
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("AppTable");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementById("AppReg");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabname).style.display = "block";
    event.currentTarget.className += " active"; 
    
}

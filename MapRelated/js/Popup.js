function openCity(event, tabname) {
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
	var tabs = document.getElementById(tabname);
	
   document.getElementById(tabname).style.display = "block";
	

   event.currentTarget.className += " active"; 
   if(tabname ==='stab')
   {
	   document.getElementsByClassName("AppTabReg")[0].style.backgroundColor="#EAEEF1";
	  // document.getElementsByClassName("AppTabReg")[0].style.border-bottom-style="solid"; 
	   document.getElementsByClassName("AppTabReg")[0].style.borderBottomColor  ="#718E9C";
	  
	   
   }
    else{
	     document.getElementsByClassName("AppTabReg")[0].style.backgroundColor="white";
		 document.getElementsByClassName("AppTabReg")[0].style.borderBottomColor  ="white";
	   // document.getElementsByClassName("AppTabReg")[0].style.border-bottom-style="solid"; 
	   // document.getElementsByClassName(AppTabReg)[0].style.border-bottom-color="white"; 
	   
    }
   if(tabname =='ftab')
    {
	    document.getElementsByClassName("AppTabRelated")[0].style.backgroundColor="#EAEEF1";

	   document.getElementsByClassName("AppTabRelated")[0].style.borderBottomColor  ="#718E9C";
	  
   }
    else{
	       document.getElementsByClassName("AppTabRelated")[0].style.backgroundColor="white";
		  document.getElementsByClassName("AppTabRelated")[0].style.borderBottomColor  ="white";
   }

    
}

// ==UserScript==
// @name          WBSEC-UI Update
// @namespace     https://github.com/abusalam/WBSEC
// @description   Helper Script For UI Correction in Firefox
// @include       http://wbsec.org/*
// @grant         none
// @downloadURL   https://github.com/abusalam/WBSEC/raw/master/WBSEC.user.js
// @updateURL     https://github.com/abusalam/WBSEC/raw/master/WBSEC.user.js
// @version       1.0
// @icon          http://www.gravatar.com/avatar/43f0ea57b814fbdcb3793ca3e76971cf
// ==/UserScript==

/**
 * How can I use jQuery in Greasemonkey scripts in Google Chrome?
 * All Credits to Original Author for this wonderfull function.
 *
 * @author  Erik Vergobbi Vold & Tyler G. Hicks-Wright
 * @link    http://stackoverflow.com/questions/2246901
 * @param   {reference} callback
 * @returns {undefined}
 */
function jQueryInclude(callback) {
  var jQueryScript = document.createElement("script");
  var jQueryCDN = "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js";
  jQueryScript.setAttribute("src", jQueryCDN);
  jQueryScript.addEventListener('load', function() {
    var UserScript = document.createElement("script");
    UserScript.textContent = 'window.jQ=jQuery.noConflict(true);'
            + 'var BaseURL = "http://wbsec.org/";'
            + '(' + callback.toString() + ')();';
    document.head.appendChild(UserScript);
  }, false);
  document.head.appendChild(jQueryScript);
}

/**
 * Main Body of Script
 *
 * @returns {undefined}
 */
jQueryInclude(function() {
  setInterval(function () {
    //jQ("#Label2").text("West Bengal (WB)");
    jQ("#GridView1PanelItem").css("height", "auto");
    jQ("#GridView1PanelItem").css("width", "auto");
    jQ("#GridView1PanelItemContent").css("height", "auto");
    jQ("#GridView1PanelItemContent").css("width", "auto");
    jQ("#GridView1Wrapper").css("height", "auto");
    jQ("#GridView1Wrapper").css("width", "auto");
    //jQ(".GridCellDiv").css("width", "auto");
    
    
    jQ("#GridView1PanelHeader").css("width","auto");
    jQ("#GridCellDiv").css("width","auto");
    //jQ("#GridView1HeaderCopy").css("width","auto");
    jQ("#GridView1PanelHeaderContent").css("width","auto");
    jQ(".main").css("width","auto");
    jQ(".page").css("width","auto");
    
    jQ(".GridviewScrollItem").css("background-color", "white");
    jQ(".GridviewScrollItem:odd").css("background-color", "#f0f0f0");
    jQ(".GridviewScrollItem:hover").css("background-color", "silver");
    jQ(".GridviewScrollItem td").css("background-color", "transparent");
    
    
    jQ("#GridView1VerticalRail").hide();
    jQ("#GridView1VerticalBar").hide();
    jQ("#GridView1Vertical_TIMG").hide();
    jQ("#GridView1Vertical_BIMG").hide();
    jQ("#GridView1HorizontalRail").hide();
    jQ("#GridView1HorizontalBar").hide();
    jQ("#GridView1Horizontal_LIMG").hide();
    jQ("#GridView1Horizontal_RIMG").hide();
    jQ("#GridView1PanelHeaderContentFreeze").hide();
    jQ("#GridView1PanelItemContentFreeze").hide();
    jQ(".loginDisplay").hide();
    jQ(".titleYear").hide();
    jQ(".headerTop").hide();
    jQ("input[type='radio']").removeAttr("disabled");
    
  }, 2000);
  
  var RefreshIT = function() {
    var d = new Date();
    jQ("#Label2").text("Time (" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ")");
    
    if ((d.getSeconds() % 40) == 0) {
  		jQ("#MainContent_btnSearch").click();
    }
    setTimeout(RefreshIT, 15000);
    return true;
  };
  
  RefreshIT();
});

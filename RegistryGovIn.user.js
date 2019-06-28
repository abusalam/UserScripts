// ==UserScript==
// @name          RegistryGovIn-UI Update
// @namespace     https://github.com/abusalam/WBSEC
// @description   Helper Script For UI Correction in Firefox
// @include       https://registry.gov.in/*
// @grant         none
// @downloadURL   https://github.com/abusalam/UserScripts/raw/master/RegistryGovIn.user.js
// @updateURL     https://github.com/abusalam/UserScripts/raw/master/RegistryGovIn.user.js
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

    jQ(".container").css("width","1071px");

});

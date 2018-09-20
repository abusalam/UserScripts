// ==UserScript==
// @name        Get Details of Minority Scholarships
// @namespace   https://github.com/abusalam
// @description Automation of MAME Scholarship Generation
// @include     https://nsp.gov.in/NSPADMIN/*
// @version     0.0.1
// @grant       none
// @downloadURL https://github.com/abusalam/UserScripts/raw/master/NSP.user.js
// @updateURL   https://github.com/abusalam/UserScripts/raw/master/NSP.user.js
// @icon        http://www.gravatar.com/avatar/43f0ea57b814fbdcb3793ca3e76971cf
// ==/UserScript==
/**
 * How can I use jQuery in Greasemonkey scripts in Google Chrome?
 * All Credits to Original Author for this wonderfull function.
 *
 * @author  Erik Vergobbi Vold & Tyler G. Hicks-Wright
 * @link    http://stackoverflow.com/questions/2246901
 * @param   {Function} callback
 * @returns {undefined}
 */
function jQueryInclude(callback) {
  var jQueryScript = document.createElement('script');
  var jQueryCDN = '//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
  jQueryScript.setAttribute('src', jQueryCDN);
  jQueryScript.addEventListener('load', function () {
    var UserScript = document.createElement('script');
    UserScript.textContent = 'window.jQ=jQuery.noConflict(true);'
      + 'var BaseURL = "https://nsp.gov.in/NSPADMIN/";'
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

jQueryInclude(function () {
jQ(".table > tbody:nth-child(1) > tr:nth-child(4) > th:nth-child(1)").text("DISE Code");
	jQ(document.body).find(".table > tbody:nth-child(1) > tr > td:nth-child(2) > a:nth-child(1)")
    .each(function (Index, Item) {
    	jQ(Item).parent().prev().text(jQ(Item).attr("onclick").trim().split(",").splice(1,1).toString().split(")").shift());
		});
});

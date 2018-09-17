// ==UserScript==
// @name        Submit HRA using GRIPS
// @namespace   https://github.com/abusalam
// @description Auto Submission and Generation of Challan for HRA
// @include     https://wbifms.gov.in/GRIPS/*
// @version     1.2.4
// @grant       none
// @downloadURL https://github.com/abusalam/UserScripts/raw/master/GRIPS.user.js
// @updateURL   https://github.com/abusalam/UserScripts/raw/master/GRIPS.user.js
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
      + 'var BaseURL = "https://wbifms.gov.in/GRIPS/";'
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

  /**
   * Depositor Details
   *
   * Edit the Following Below to include your details
   *
   * @type {string}
   */
  var HRA = {};
  var getHRA = localStorage.getItem('HRA');
  if (getHRA === null) {
    HRA = {
      'DepositorName': '',
      'MobileNo': '',
      'Address': 'Quarter No. Z/0, XYZ Govt. RHE',
      'eMailID': 'email@example.com',
      'RefNo': 'Z0',
      'FromDate': '01/01/2017',
      'ToDate': '31/01/2017',
      'Remarks': 'HRA Deposited to State Government.',
      'HeadOfAccount': '0216-02-101-001-05',
      'Amount': 0
    };
    localStorage.setItem('HRA', JSON.stringify(HRA, null, 2));
  } else {
    HRA = JSON.parse(getHRA);
  }
  /** DO NOT EDIT BEYOND THIS **/

  jQ('body').before(jQ('<div id="GRN"></div>').css({
      'position': 'absolute',
      'top': 50,
      'left': 160,
      'font-size': '24px',
      'color': 'OLIVE'
    }).text(function () {
      return 'GRN# ' + localStorage.getItem('GRN');
    })
  );
  jQ('body').append(jQ('<textarea id="HRA"></textarea>').css({
      'position': 'absolute',
      'top': '0',
      'left': '0',
      'font-size': '14px',
      'height': '10px',
      'width': '10px',
      'color': 'OLIVE'
    }).val(function () {
      var HRA = JSON.parse(localStorage.getItem('HRA'));
      return JSON.stringify(HRA, null, 2);
    }).blur(function () {
      localStorage.setItem('HRA', jQ(this).val());
    })
  );
  jQ('#dealernm').val(HRA.DepositorName);
  jQ('#mobile').val(HRA.MobileNo);
  jQ('#address').val(HRA.Address);
  jQ('#email').val(HRA.eMailID);
  jQ('#usertype').val('Depositor');
  jQ('#mode').val('1'); // Payment Mode: [1] Online Payment
  jQ('#param2').val(HRA.RefNo);
  jQ('#dept_nm1').val('043').trigger('change'); // Select Department/Directorate: [043] Housing
  jQ('#confirmAmnt').val(HRA.Amount);

  setInterval(function () {
    if (jQ('#m_pay1').val() !== 'Housing Rents') {
      jQ('#trade_nm').val(HRA.DepositorName);
      jQ('#office_address').val(HRA.Address);
      jQ('#prdfrm').val(HRA.FromDate);
      jQ('#prdto').val(HRA.ToDate);
      jQ('#remarks').val(HRA.Remarks);
      jQ('#amount1').val(HRA.Amount).blur();
      jQ('#m_pay1').val('Housing Rents').trigger('change');
      jQ('#tax_type').val('001'); // Select Service: [001] Collection under Government Housing Scheme
    }
    if (HRA.HeadOfAccount !== jQ('#componentdetail_cd1').val()) {
      jQ('#componentdetail_cd1').val(HRA.HeadOfAccount).trigger('change');
    }
    if (jQ('#grn_no_reprint1').length && jQ('#grn_no_reprint2').length && jQ('#grn_no_reprint3').length) {
      var savedGRN = localStorage.getItem('GRN');
      jQ('#grn_no_reprint1').val(savedGRN.substr(2, 6));
      jQ('#grn_no_reprint2').val(savedGRN.substr(8, 9));
      jQ('#grn_no_reprint3').val(savedGRN.substr(17, 1));
    } else if (jQ('#finalGrnInRequest').length) {
      localStorage.setItem('GRN', jQ('#finalGrnInRequest').val());
      jQ('#GRN').text('Govt. Reference No.(GRN#): ' + jQ('#finalGrnInRequest').val());
    }
  }, 2000);
});

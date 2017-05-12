// ==UserScript==
// @name        IntraNIC Directory
// @namespace   https://github.com/abusalam
// @description Retrieve List of IntraNIC Directory in JSON Format
// @include     https://intranic.nic.in/portalnic/intranic4/portal_new/directorysearch
// @version     1.0.3
// @grant       none
// @downloadURL https://github.com/abusalam/UserScripts/raw/master/IntraNIC.user.js
// @updateURL   https://github.com/abusalam/UserScripts/raw/master/IntraNIC.user.js
// @icon        http://www.gravatar.com/avatar/43f0ea57b814fbdcb3793ca3e76971cf
// ==/UserScript==
function jQueryInclude(callback) {
  var jQueryScript = document.createElement('script');
  var jQueryCDN = '//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
  jQueryScript.setAttribute('src', jQueryCDN);
  jQueryScript.addEventListener('load', function () {
    var UserScript = document.createElement('script');
    UserScript.textContent = 'window.jQ=jQuery.noConflict(true);'
      + 'var BaseURL = "https://intranic.nic.in/";'
      + '(' + callback.toString() + ')();';
    document.head.appendChild(UserScript);
  }, false);
  document.head.appendChild(jQueryScript);
}
jQueryInclude(function () {
  /**
   *  JQuery.AjaxQueue
   *
   *  Author: Rui Jiang (rui.jiang@zsassociates.com)
   *  Purpose: Represents a queue of AJAX actions. Can be used to force
   *           synchronicity or detect how many actions are actively running.
   *       Can be used on its own or in conjunction with JQuery.Notifications.
   *  Notes: Requires Math.uuid.js from http://www.broofa.com/Tools/Math.uuid.js.
   *
   *   -----------------------------------------------------------------------------------------------
   *
   *  Configuration Options:
   *  [optional] (number)
   *  concurrentActions  : Number of actions allowed to run at the same time. Set to
   *              0 or leave it unset for unlimited.
   *
   *
   *  Properties:
   *  active    : Array of the names of active actions waiting for a response.
   *  waiting    : Array of the names of waiting actions.
   *
   *  Methods:
   *  (returns null)
   *  addAction(params)  : Add a new JQuery AJAX action. Valid params are any which
   *              can be specified as part of a $.Ajax() call. Check out
   *              http://docs.jquery.com/Ajax/jQuery.ajax#options for
   *              valid parameters.
   *
   *              One additional parameter that must be specified is "name".
   *              "name" is the title of the action (ie. "Adding Object").
   *              You will also need to specify the "success" parameter to
   *              have your Ajax call perform a function upon server
   *              response.
   *
   *              An optional parameter "cancel" can be given to provide a
   *              a function to call in the event the action is canceled
   *              (see cancelAction()).
   *
   *   (returns null)
   *  cancelAction(actionName)  : Remove all JQuery AJAX actions named actionName.
   *              Queued actions will not have requests made, and active
   *              actions will ignore their responses.  If one or more
   *              actions are canceled, then queued actions will be run
   *              up to the concurrent limit.
   *
   *  (returns null)
   *  clearWaitingActions()  : Clears any waiting actions. These will never execute.
   *
   *  (returns null)
   *  setPreAction(fn)  : A function you should not have to call. Used by
   *              Notifications to update itself before an Ajax call.
   *
   *  [returns null]
   *  setPostAddAction(fn)    : A function you should not have to call. Used by
   *                                                 Notifications to update itself after adding an action.
   *
   *  (returns null)
   *  setPostAction(fn)  : A function you should not have to call. Used by
   *              Notifications to update itself after an Ajax call.
   *
   *   -----------------------------------------------------------------------------------------------
   *
   *   Usage:
   *
   *   var ajaxqueue = $().ajaxqueue({
   *   	concurrentActions: 3
   *   });
   *
   *   ajaxqueue.addAction({
   *       name: "new action",
   *       type: "POST",
   *       url: "../ajax/testechoaction",
   *       data: {},
   *       success: function(response) {
   *           $('#actionqueOutput').append(response + "<br />");
   *       },
   *       error: function(XMLHttpRequest, textStatus, errorThrown) {
   *           $('#actionqueOutput').append(textStatus + "<br />");
   *       }
   *   });
   *
   */
  (function (jQ) {
    jQ.fn.extend({
      ajaxqueue: function (options) {
        // Region: Constructing Plugin
        var defaults = {
          concurrentActions: 0
        };
        var opts = defaults;
        if (options) {
          opts = $.extend(defaults, options);
        }        // Region: Fields

        var active = [];
        var queue = [];
        var idCount = 0;
        var preAction = null;
        var postAddAction = null;
        var postAction = null;
        var id = Math.uuid();
        // Region: Properties
        this.active = function () {
          var actives = [];
          for (var index = 0; index < active.length; index++) {
            actives.push(active[index].action.name);
          }
          return actives;
        }
        this.waiting = function () {
          var queued = [];
          for (var index = 0; index < queue.length; index++) {
            queued.push(queue[index].action.name);
          }
          return queued;
        }
        this.id = function () {
          return id;
        }        // Region: Public Functions

        this.addAction = function (params) {
          var newAction = ajaxAction(params);
          if (opts.concurrentActions === 0 || active.length < opts.concurrentActions) {
            active.push({
              id: newAction.id,
              action: newAction
            });
            // execute
            newAction.ajax();
          } else {
            queue.push({
              id: newAction.id,
              action: newAction
            });
          }
          if (postAddAction) {
            postAddAction();
          }
          idCount++;
        }
        this.cancelAction = function (actionName) {
          var matchesName = function (item) {
            return (item.action.name === actionName);
          };
          var cancelActive = $.grep(active, matchesName);
          var cancelQueue = $.grep(queue, matchesName);
          for (var index = 0; index < cancelActive.length; index++) {
            removeActionFromArray(cancelActive[index].id, active);
            cancelActive[index].action.cancel();
          }
          for (var index = 0; index < cancelQueue.length; index++) {
            removeActionFromArray(cancelQueue[index].id, queue);
            cancelQueue[index].action.cancel();
          }
          startNextAction();
        }
        this.clearWaitingActions = function () {
          queue = [];
        }
        this.setPostAddAction = function (fn) {
          postAddAction = fn;
        }
        this.setPreAction = function (fn) {
          preAction = fn;
        }
        this.setPostAction = function (fn) {
          postAction = fn;
        }        // Region: Private Functions

        function completeAction(actionId) {
          var result = removeActionFromArray(actionId, active);
          if (postAction) {
            postAction();
          }
          startNextAction();
          return result;
        }

        function startNextAction() {
          while (opts.concurrentActions > 0 && queue.length > 0 && active.length < opts.concurrentActions) {
            var nextActionObject = queue.shift();
            active.push({
              id: nextActionObject.id,
              action: nextActionObject.action
            });
            if (preAction) {
              preAction();
            }            // execute

            nextActionObject.action.ajax();
          }
        }

        function removeActionFromArray(actionId, array) {
          var spliceIndex = -1;
          for (var index = 0; index < array.length; index++) {
            if (array[index].id === actionId) {
              spliceIndex = index;
              break;
            }
          }
          if (spliceIndex >= 0) {
            array.splice(spliceIndex, 1);
            return true;
          }
          return false;
        }        // Region: Supporting Objects

        var ajaxAction = function (params) {
          var actionSuccess,
            actionError;
          var actionId = 'action_' + idCount;
          // need to hold this separately to prevent infinite loop
          var paramsSuccess = params.success;
          // there are 2 signatures for the success function
          if (paramsSuccess.length === 1) {
            actionSuccess = function (data) {
              if (completeAction(actionId)) paramsSuccess(data);
            }
          } else if (paramsSuccess.length === 2) {
            actionSuccess = function (data, textStatus) {
              if (completeAction(actionId)) paramsSuccess(data, textStatus);
            }
          } else if (paramsSuccess.length === 3) {
            actionSuccess = function (data, textStatus, request) {
              if (completeAction(actionId)) paramsSuccess(data, textStatus, request);
            }
          }
          params.success = actionSuccess;
          // only 1 possible signature for error function
          var paramsError;
          if (params.error) {
            paramsError = params.error;
            actionError = function (XMLHttpRequest, textStatus, errorThrown) {
              if (completeAction(actionId)) paramsError(XMLHttpRequest, textStatus, errorThrown);
            }
            params.error = actionError;
          }
          return {
            id: actionId,
            name: params.name,
            ajax: function () {
              $.ajax(params);
            },
            cancel: function () {
              if (params.cancel) {
                if (params.context) {
                  params.cancel.apply(params.context, []);
                } else {
                  params.cancel();
                }
              }
            }
          }
        }
        return this;
      }
    });
  })(jQ);
  /**
   * Math.uuid.js (v1.4)
   * http://www.broofa.com
   * mailto:robert@broofa.com
   * Copyright (c) 2009 Robert Kieffer
   * Dual licensed under the MIT and GPL licenses.
   *
   * Generate a random uuid.
   *
   * USAGE: Math.uuid(length, radix)
   *   length - the desired number of characters
   *   radix  - the number of allowable values for each character.
   *
   * EXAMPLES:
   *   // No arguments  - returns RFC4122, version 4 ID
   *   >>> Math.uuid()
   *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
   *
   *   // One argument - returns ID of the specified length
   *   >>> Math.uuid(15)     // 15 character ID (default base=62)
   *   "VcydxgltxrVZSTV"
   *
   *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
   *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
   *   "01001010"
   *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
   *   "47473046"
   *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
   *   "098F4D35"
   */
  Math.uuid = (function () {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    return function (len, radix) {
      var chars = CHARS,
        uuid = [];
      radix = radix || chars.length;
      if (len) {
        // Compact form
        for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
      } else {
        // rfc4122, version 4 form
        var r;
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (var i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | Math.random() * 16;
            uuid[i] = chars[(i == 19) ? (r & 3) | 8 : r];
          }
        }
      }
      return uuid.join('');
    };
  })();
  /**
   * JQuery.AjaxQueue Configurations
   */
  var AjaxQueue = jQ().ajaxqueue({
    concurrentActions: 1
  });
  /**
   * Main Functions to Retrieve IntraNIC Directory Contacts
   */
  localStorage.setItem('Serial', 0);
  localStorage.setItem('EmpCount',0);
  var listEmp = [];
  var Designation = {
    'Value': '',
    'Description': ''
  };
  var GetEmpListByDesignation = function (Desg, Page) {

    jQ('#Info').html('GetDirectory ' + Desg.Description + '[' + Desg.Value + ']:Page-' + Page);

    AjaxQueue.addAction({
      name: 'GetDirectory ' + Desg.Value + '-' + Page,
      type: 'GET',
      url: BaseURL + 'portalnic/intranic4/dirsearchresultadv',
      dataType: 'html',
      xhrFields: {
        withCredentials: true
      },
      data: {
        'designation': Desg.Value,
        'page': Page,
        'random': Math.random()
      },
      beforeSend : function(jqXHR, settings){
        jQ('#Info').html('GetDirectory ' + Desg.Description + '[' + Desg.Value + ']:Page-' + Page);
        return true;
      },
      success: function (data) {
        try {
          if (Page === 1) {
            jQ(data).find('.head').each(function (Index, Item) {
              var EmpCount = parseInt(jQ.trim(jQ(Item).html().replace(/[^0-9]/g, '')));
              localStorage.setItem('EmpCount', parseInt(localStorage.getItem('EmpCount')) + EmpCount );
              var PageCount = Math.ceil(EmpCount / 10);
              while (Page < PageCount) {
                Page++;
                GetEmpListByDesignation(Desg, Page);
              }
            });
          }

          jQ(data).find('.row').each(function (Index, Item) {
            jQ(Item).css({
              'float': 'left',
              'height': '300px',
              'width': '300px',
              'margin': '5px',
              'border': '2px solid',
              'padding': '2px'
            });

            var Serial = parseInt(localStorage.getItem('Serial')) + 1;
            localStorage.setItem('Serial', Serial);
            var EmpPhoto = jQ(Item).find('img');
            EmpPhoto.attr('width', '150px');
            EmpPhoto.attr('height', '200px');
            EmpPhoto.css({'float': 'right'});
            jQ(Item).prepend('<div class="itemSerial">' + Serial + '</div>');

            jQ('#dirData').append(Item);

            var EmpHin = jQ(Item).find('.name:first');
            var EmpCode = EmpHin.next().html();
            var EmpState = EmpHin.next().next().html();
            var EmpEMail = EmpHin.next().next().next().html();
            var EmpEng = jQ(Item).find('.name:last');
            var EmpDesg = EmpEng.next().html();
            var EmpPlace = EmpEng.next().next().html();

            listEmp.push({
              "EmpCode": jQ.trim(EmpCode.replace(/[^0-9]/g, '')),
              "Name": jQ(Item).find('.name:last').text(),
              "Photo": EmpPhoto.attr('src'),
              "eMailID" : EmpEMail,
              "Designation": jQ.trim(EmpDesg.replace(/[0-9]/g, '').replace(/-/i, '')),
              "State": jQ.trim(EmpState),
              "Location": jQ.trim(EmpPlace),
              "Phone": jQ.trim(jQ(Item).find('.phone:last').html().replace(/&nbsp;/g, '').replace(/[\s\n]/g, ''))
            });
            jQ('#jsonData').text(JSON.stringify(listEmp, null, 2));

          });
          //var Pages = jQ('.pagination').first().text().split(' ');
          //jQ('#dirData').text('Total Pages: ' + Pages);
        }
        catch (e) {
          alert(' Error:' + e);
        }
      },
      error: function (jqXHR, FailMsg) {
        GetEmpListByDesignation(Desg, Page);
        alert(' Error:' + FailMsg);
      },
      complete : function(jqXHR, textStatus){
        jQ('#Info').html('Complete ' + Desg.Description + '[' + Desg.Value + ']:Page-' + Page);
        jQ('#Info').append('<br/>Waiting: ' + AjaxQueue.waiting().length);
        jQ('#Info').append('<br/>Records: ' + localStorage.getItem('Serial') + '/' + localStorage.getItem('EmpCount'));

        jQ('.itemSerial').css({
          'font-size': '30px',
          'background-color': '#777',
          'border-radius': '10px',
          'color': '#fff',
          'display': 'inline-block',
          'font-weight': '700',
          'line-height': '1',
          'min-width': '10px',
          'padding': '3px 7px',
          'text-align': 'center',
          'vertical-align': 'middle',
          'white-space': 'nowrap',
          'position' : 'relative',
          'top' : '180px',
          'left' : '245px'
        });
      }
    });
  };

  var optDesg = [];
  jQ('#search_adv_desg').find('option').each(function (Index, Item) {
    if (jQ(Item).val().length) {
      Designation = {
        'Value': jQ(Item).val(),
        'Description': jQ(Item).text()
      };
      optDesg.push(Designation);
      GetEmpListByDesignation(Designation, 1);
    }
  });

  jQ('body').html('<div id="UI"><div id="Info"></div><pre id="optDesg"></pre><textarea id="jsonData" rows="40" cols="100"></textarea></div>');
  jQ('body').prepend('<div id="dirData"></div>');
  jQ('#dirData').css({
    'margin': '10px'
  });
  jQ('#UI').css({
    'position': 'absolute',
    'top': '200px',
    'left': '200px',
    'padding': '4px',
    'background-color': 'OLIVE'
  });
  jQ('#Info').css({
    'background-color': 'ORANGE',
    'margin': '2px 0px 6px 0px',
    'padding': '2px',
    'font-size': '14px',
    'font-weight': 'bold'
  });
});

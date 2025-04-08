// ==UserScript==
// @name         Generate MasterOtp
// @namespace    http://tampermonkey.net/
// @version      2025-04-05
// @description  try to take over the world!
// @author       You
// @include      https://ifms.wb.gov.in/auth/
// @include      https://train-ifms.wb.gov.in/auth/
// @include      http://ifms3.test/
// @include      http://uat.ifms3.test/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gov.in
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // *** Configuration ***
    const selectors = [
        'input[formcontrolname="otp"]'
        // Add more selectors as needed
    ];
    // *** End of Configuration ***


    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const first = sumDigits(now.getFullYear());
    const second = sumDigits(now.getMonth() + 1);
    const third = sumDigits(now.getDate());
    const fourth = sumDigits(now.getHours());
    const fifth = sumDigits(first + second + third + fourth);
    const sixth = sumDigits(first + second + third + fourth + fifth);
    const masterOtp = (((((first * 10) + second) * 10 + third) * 10 + fourth) * 10 + fifth) * 10 + sixth;

    console.log("Otp:" + masterOtp + " At: " + now);

    function provideOtp(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.focus();
            element.value = masterOtp;
            clearInterval(optFillInterval);
            console.log("Stop Filling Otp");
        });
    }

    function sumDigits(value) {
        var argValue = value, sum = 0;

        while (value) {
            sum += value % 10;
            value = Math.floor(value / 10);
        }
        if(sum>9)
        {
            return sumDigits(sum);
        }
        console.log(argValue + "->" + sum);
        return sum;
    }

    var optFillInterval = setInterval(
        function() {
            console.log("Trying to fill Otp");
            selectors.forEach(selector => {
                provideOtp(selector);
            });
        }
        , 5000
    );


})();

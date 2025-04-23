// ==UserScript==
// @name         Generate MasterOtp
// @namespace    http://tampermonkey.net/
// @version      3.0.2
// @downloadURL  https://github.com/abusalam/UserScripts/raw/refs/heads/master/MasterOTP.user.js
// @updateURL    https://github.com/abusalam/UserScripts/raw/refs/heads/master/MasterOTP.user.js
// @description  try to take over the world!
// @author       You
// @include      http://ifms3.test/
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js#sha512=a+SUDuwNzXDvz4XrIcXHuCf089/iJAoN4lmrXJg18XnduKK6YlDHNRalv4yd1N40OKI80tFidF+rqTFKGPoWFQ==
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/aes.min.js#sha512=UOtWWEXoMk1WLeC873Gmrkb2/dZMwvN1ViM9C1mNvNmQSeXpEr8sRzXLmUSha1X4x5V892uFmEjiZzUsYiHYiw==
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


    var cryptoKey ='secret-aes-key';
    var cryptoIv ='secret-aes-iv';


    var key = CryptoJS.enc.Utf8.parse(cryptoKey);
    var iv = CryptoJS.enc.Utf8.parse(cryptoIv);

    function decrypt(encryptText) {
        var decryptedBytes = CryptoJS.AES.decrypt(encryptText, key, {
            keySize: 128 / 8,
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        var decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return decryptedText
    }

    function parseJwtPayload(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }
            const encodedPayload = parts[1];
            const decodedPayload = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
            const payload = JSON.parse(decodedPayload);
            return payload;
        } catch (error) {
            console.error('Error parsing JWT payload:', error);
            return null;
        }
    }

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

    function tryJwtDecode(token) {
        if(token.slice(0,4) == 'eyJh') {
            return parseJwtPayload(token);
        }
        return token;
    }

    var decryptInterval = setInterval(
        function() {
        //console.log('Items: ' + localStorage.length);
        for (var i = 0; i < localStorage.length; i++) {
            if ( localStorage.key(i).slice(0,2) !== 'D-') {
                var decryptedData = decrypt(localStorage.getItem(localStorage.key(i)));
                var jwtPayload = tryJwtDecode(decryptedData);
                localStorage.setItem(
                    'D-' + localStorage.key(i),
                    JSON.stringify(jwtPayload).replace(/-/g, '+').replace(/_/g, '/')
                );
                if (jwtPayload.exp) {
                    localStorage.setItem(
                        'D-Exp-' + localStorage.key(i),
                        new Date(jwtPayload.exp * 1000)
                    );
                }
                localStorage.setItem('D-LastUpdate', new Date());
            }
            //console.log(localStorage.key(i) + ' => ' +localStorage.getItem(localStorage.key(i)));
        }
    }, 2000);
})();

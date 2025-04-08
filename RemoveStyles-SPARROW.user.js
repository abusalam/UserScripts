// ==UserScript==
// @name         Remove Inline Style Attribute - Sparrow NIC
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Removes the inline style attribute from elements on Sparrow NIC websites.
// @author       You
// @match        https://sparrownic.saccess.nic.in/*
// @match        https://sparrow-nic.eoffice.gov.in/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // *** Configuration ***
    const selectors = [
        "#someElementId", // Replace with your selectors
        ".TabbedPanelsContentGroup",
        "div[data-attribute='value']"
        // Add more selectors as needed
    ];
    // *** End of Configuration ***

    function removeInlineStyle(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.hasAttribute('style')) {
                console.log("Removing:" + element.getAttribute("style"))
                element.removeAttribute('style');
            }
        });
    }

    selectors.forEach(selector => {
        removeInlineStyle(selector);
    });

    // Observe DOM changes and re-apply the changes
    const observer = new MutationObserver(mutations => {
        selectors.forEach(selector => {
            removeInlineStyle(selector);
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true, // Important: Observe attribute changes
        characterData: true
    });

})();

// ==UserScript==
// @name         Red Message Box for Blocks Top Level
// @namespace    https://github.com/danmansfield/
// @version      2.0.0
// @description  Shows a red message box when "Top Level" label appears with title="Blocks"
// @author       Dan Mansfield
// @match        https://support.bleckfield.com/*
// @updateURL    https://raw.githubusercontent.com/danmansfield/tmscripts/main/blocks-warning.user.js
// @downloadURL  https://raw.githubusercontent.com/danmansfield/tmscripts/main/blocks-warning.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let hasAddedWarning = false;

    // Function to create and insert the red message box
    function createRedMessageBox() {
        // Prevent duplicate warnings
        if (hasAddedWarning) return;
        
        // Check if the label exists
        const label = document.querySelector('label[for="input-field-for-toplevel_name"]');
        
        if (label && label.textContent.trim() === 'Top Level') {
            // Find the specific div with title="Blocks"
            const parentContainer = label.closest('.col-md-12');
            
            if (parentContainer) {
                const readValueDiv = parentContainer.querySelector('.read-value[title="Blocks"]');
                
                if (readValueDiv) {
                    // Find the profile-details div to insert our warning
                    const profileDetails = document.querySelector('.profile-details');
                    
                    if (profileDetails) {
                        // Check if we already added the message box
                        if (!document.querySelector('.tampermonkey-red-message')) {
                            // Find profile-title
                            const profileTitle = profileDetails.querySelector('.profile-title');
                            if (!profileTitle) return;
                            
                            // Make profile-title position relative
                            profileTitle.style.position = 'relative';
                            
                            // Create the red message box
                            const messageBox = document.createElement('span');
                            messageBox.className = 'tampermonkey-red-message';
                            messageBox.textContent = '⚠️ Blocks Top Level!';
                            
                            // Apply all styles directly
                            messageBox.setAttribute('style', `
                                background-color: #dc3545 !important;
                                color: white !important;
                                padding: 3px 8px !important;
                                border-radius: 3px !important;
                                font-weight: bold !important;
                                font-size: 11px !important;
                                border: 1px solid #c82333 !important;
                                position: absolute !important;
                                top: 0 !important;
                                right: 0 !important;
                                z-index: 1000 !important;
                                white-space: nowrap !important;
                                display: inline-block !important;
                                line-height: normal !important;
                            `);
                            
                            // Append the message
                            profileTitle.appendChild(messageBox);
                            hasAddedWarning = true;
                            console.log('[DEBUG] Small warning badge added');
                        }
                    }
                }
            }
        }
    }

    // Check periodically
    const checkInterval = setInterval(function() {
        // Stop if loader is still visible
        if (document.querySelector('.application-loader')) {
            return;
        }
        
        createRedMessageBox();
        
        // Stop checking after we've added the warning
        if (hasAddedWarning) {
            clearInterval(checkInterval);
            
            // Continue monitoring for page changes
            const observer = new MutationObserver(function() {
                createRedMessageBox();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }, 500);
    
    // Stop checking after 30 seconds
    setTimeout(function() {
        clearInterval(checkInterval);
    }, 30000);

})();

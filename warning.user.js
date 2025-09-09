// ==UserScript==
// @name         Support System Warning Badges
// @namespace    https://github.com/danmansfield/
// @version      2.3.0
// @description  Shows warning badges for Blocks and Happy Telecom top level entries, highlights prepay for Blocks
// @author       Dan Mansfield
// @match        https://support.bleckfield.com/*
// @updateURL    https://raw.githubusercontent.com/danmansfield/tmscripts/main/warning.user.js
// @downloadURL  https://raw.githubusercontent.com/danmansfield/tmscripts/main/warning.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let hasAddedWarning = false;
    let lastCheckedURL = '';

    // Function to highlight the Pre-pay balance section
    function highlightPrepayBalance() {
        // Keep trying until we find it or give up
        let attempts = 0;
        const maxAttempts = 30; // Try for 15 seconds
        
        const tryHighlight = setInterval(function() {
            attempts++;
            
            // Find the Pre-pay balance label
            const prepayLabel = document.querySelector('label[for="input-field-for-prepay_balance"]');
            
            if (prepayLabel) {
                // Find the parent row container
                const prepayRow = prepayLabel.closest('.row');
                
                if (prepayRow && !prepayRow.classList.contains('prepay-highlighted')) {
                    // Add a class to prevent re-highlighting
                    prepayRow.classList.add('prepay-highlighted');
                    
                    // Apply highlighting styles with !important to override
                    prepayRow.setAttribute('style', `
                        background-color: #ffe6e6 !important;
                        border: 2px solid #dc3545 !important;
                        border-radius: 5px !important;
                        padding: 5px !important;
                        margin-top: 5px !important;
                        margin-bottom: 5px !important;
                    `);
                    
                    // Also make the label bold to draw attention
                    prepayLabel.setAttribute('style', `
                        font-weight: bold !important;
                        color: #dc3545 !important;
                    `);
                    
                    // Find ALL value divs within this row and make text black
                    const allValueDivs = prepayRow.querySelectorAll('.read-value, .noedit-value');
                    allValueDivs.forEach(function(div) {
                        div.style.cssText += 'color: #000000 !important; font-weight: bold !important;';
                        // Also apply to any child elements
                        const children = div.querySelectorAll('*');
                        children.forEach(function(child) {
                            child.style.cssText += 'color: #000000 !important;';
                        });
                    });
                    
                    console.log('[DEBUG] Pre-pay balance section highlighted');
                    clearInterval(tryHighlight);
                }
            }
            
            // Stop trying after max attempts
            if (attempts >= maxAttempts) {
                console.log('[DEBUG] Could not find Pre-pay balance section after ' + maxAttempts + ' attempts');
                clearInterval(tryHighlight);
            }
        }, 500);
    }

    // Function to create and insert the warning message box
    function createRedMessageBox() {
        // Reset if URL changed (navigated to different ticket)
        if (window.location.href !== lastCheckedURL) {
            hasAddedWarning = false;
            lastCheckedURL = window.location.href;
            // Remove old warning if exists
            const oldWarning = document.querySelector('.tampermonkey-red-message');
            if (oldWarning) oldWarning.remove();
            // Remove old highlighting
            const oldHighlight = document.querySelector('.prepay-highlighted');
            if (oldHighlight) {
                oldHighlight.classList.remove('prepay-highlighted');
                oldHighlight.removeAttribute('style');
            }
        }
        
        // Prevent duplicate warnings on same page
        if (hasAddedWarning) return;
        
        // Check if page is still loading
        if (document.querySelector('.application-loader')) {
            return; // Wait for page to finish loading
        }
        
        // Check if the label exists
        const label = document.querySelector('label[for="input-field-for-toplevel_name"]');
        
        if (label && label.textContent.trim() === 'Top Level') {
            // Find the specific div with title
            const parentContainer = label.closest('.col-md-12');
            
            if (parentContainer) {
                const readValueDiv = parentContainer.querySelector('.read-value[title]');
                
                if (readValueDiv) {
                    const titleValue = readValueDiv.getAttribute('title');
                    let warningText = '';
                    let bgColor = '#dc3545'; // Default red
                    
                    // Determine which warning to show
                    if (titleValue === 'Blocks') {
                        warningText = '⚠️ Blocks Top Level!';
                        // Call the highlight function for Blocks tickets
                        highlightPrepayBalance();
                    } else if (titleValue && titleValue.startsWith('Happy Telecom')) {
                        warningText = '🔒 No email passwords without approval!';
                        bgColor = '#ff8c00'; // Orange for Happy Telecom
                    }
                    
                    // Only proceed if we have a warning to show
                    if (warningText) {
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
                                
                                // Create the warning message box
                                const messageBox = document.createElement('span');
                                messageBox.className = 'tampermonkey-red-message';
                                messageBox.textContent = warningText;
                                
                                // Apply all styles directly with !important to override site CSS
                                messageBox.setAttribute('style', `
                                    background-color: ${bgColor} !important;
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
                                console.log('[DEBUG] Warning badge added:', warningText);
                            }
                        }
                    }
                }
            }
        }
    }

    // Check every 500ms
    setInterval(function() {
        createRedMessageBox();
    }, 500);
    
    // Also monitor for DOM changes
    const observer = new MutationObserver(function() {
        createRedMessageBox();
    });
    
    // Start observing when body is available
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // Wait for body to exist
        const bodyWait = setInterval(function() {
            if (document.body) {
                clearInterval(bodyWait);
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        }, 100);
    }

})();

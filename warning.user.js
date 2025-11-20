// ==UserScript==
// @name         Support System Warning Badges
// @namespace    https://github.com/danmansfield/
// @version      2.6.0
// @description  Shows warning badges for Blocks and Happy Telecom top level entries, Portman Care customer group, and highlights prepay for Blocks
// @author       Dan Mansfield
// @match        https://support.bleckfield.com/*
// @updateURL    https://raw.githubusercontent.com/danmansfield/tmscripts/main/warning.user.js
// @downloadURL  https://raw.githubusercontent.com/danmansfield/tmscripts/main/warning.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let hasAddedWarnings = false;
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

    // Function to create and insert the warning message boxes
    function createWarningMessages() {
        // Reset if URL changed (navigated to different ticket)
        if (window.location.href !== lastCheckedURL) {
            hasAddedWarnings = false;
            lastCheckedURL = window.location.href;
            // Remove old warnings if exist
            const oldWarnings = document.querySelectorAll('.tampermonkey-warning-message');
            oldWarnings.forEach(warning => warning.remove());
            // Remove old highlighting
            const oldHighlight = document.querySelector('.prepay-highlighted');
            if (oldHighlight) {
                oldHighlight.classList.remove('prepay-highlighted');
                oldHighlight.removeAttribute('style');
            }
        }
        
        // Prevent duplicate warnings on same page
        if (hasAddedWarnings) return;
        
        // Check if page is still loading
        if (document.querySelector('.application-loader')) {
            return; // Wait for page to finish loading
        }
        
        const warnings = [];
        let shouldHighlightPrepay = false;
        
        // Check for Top Level conditions
        const topLevelLabel = document.querySelector('label[for="input-field-for-toplevel_name"]');
        let topLevelValue = '';
        
        if (topLevelLabel && topLevelLabel.textContent.trim() === 'Top Level') {
            // Find the specific div with title
            const parentContainer = topLevelLabel.closest('.col-md-12');
            
            if (parentContainer) {
                const readValueDiv = parentContainer.querySelector('.read-value[title]');
                
                if (readValueDiv) {
                    topLevelValue = readValueDiv.getAttribute('title');
                    console.log('[DEBUG] Top Level value found:', topLevelValue);
                    
                    // Check for Blocks
                    if (topLevelValue === 'Blocks') {
                        warnings.push({
                            text: '⚠️ Blocks Top Level!',
                            bgColor: '#dc3545' // Red
                        });
                        shouldHighlightPrepay = true;
                    } 
                    // Check for Happy Telecom (any variant)
                    if (topLevelValue && topLevelValue.startsWith('Happy Telecom')) {
                        warnings.push({
                            text: '🔒 No email passwords without approval!',
                            bgColor: '#ff8c00' // Orange
                        });
                    }
                }
            }
        }
        
        // Check for Portman Care customer group - FLEXIBLE APPROACH
        // Find any label with text "Customer Group"
        const allLabels = Array.from(document.querySelectorAll('label'));
        const customerGroupLabel = allLabels.find(label => 
            label.textContent.trim() === 'Customer Group'
        );
        
        if (customerGroupLabel) {
            console.log('[DEBUG] Found Customer Group label');
            const customerGroupContainer = customerGroupLabel.closest('.col-md-12') || 
                                          customerGroupLabel.closest('.col-md-6') ||
                                          customerGroupLabel.closest('[class*="col"]');
            
            if (customerGroupContainer) {
                // Look for Portman Care in the value divs
                const valueDivs = customerGroupContainer.querySelectorAll('.read-value, .noedit-value');
                let isPortmanCare = false;
                
                valueDivs.forEach(div => {
                    const titleAttr = div.getAttribute('title');
                    const textContent = div.textContent.trim();
                    
                    // Check both title attribute and text content for "Portman Care"
                    if ((titleAttr && titleAttr === 'Portman Care') || 
                        (textContent && textContent === 'Portman Care')) {
                        isPortmanCare = true;
                        console.log('[DEBUG] Portman Care customer group found');
                    }
                });
                
                if (isPortmanCare) {
                    warnings.push({
                        text: '⚠️ Manager Approval Required!',
                        bgColor: '#dc3545' // Red
                    });
                }
            }
        }
        
        console.log('[DEBUG] Total warnings to display:', warnings.length);
        warnings.forEach(w => console.log('[DEBUG] Warning:', w.text));
        
        // Apply highlighting if needed (only for Blocks)
        if (shouldHighlightPrepay) {
            highlightPrepayBalance();
        }
        
        // Add all warning messages that were found
        if (warnings.length > 0) {
            // Find the profile-details div to insert our warnings
            const profileDetails = document.querySelector('.profile-details');
            
            if (profileDetails) {
                // Find profile-title
                const profileTitle = profileDetails.querySelector('.profile-title');
                if (!profileTitle) return;
                
                // Make profile-title position relative
                profileTitle.style.position = 'relative';
                
                // Add each warning as a separate badge
                warnings.forEach(function(warning, index) {
                    // Check if this specific warning already exists
                    const existingWarning = Array.from(document.querySelectorAll('.tampermonkey-warning-message'))
                        .find(el => el.textContent === warning.text);
                    
                    if (!existingWarning) {
                        // Create the warning message box
                        const messageBox = document.createElement('span');
                        messageBox.className = 'tampermonkey-warning-message';
                        messageBox.textContent = warning.text;
                        
                        // Calculate position - stack them vertically if multiple
                        const topPosition = index * 22; // 22px spacing between badges
                        
                        // Apply all styles directly with !important to override site CSS
                        messageBox.setAttribute('style', `
                            background-color: ${warning.bgColor} !important;
                            color: white !important;
                            padding: 3px 8px !important;
                            border-radius: 3px !important;
                            font-weight: bold !important;
                            font-size: 11px !important;
                            border: 1px solid #c82333 !important;
                            position: absolute !important;
                            top: ${topPosition}px !important;
                            right: 0 !important;
                            z-index: ${1000 + index} !important;
                            white-space: nowrap !important;
                            display: inline-block !important;
                            line-height: normal !important;
                        `);
                        
                        // Append the message
                        profileTitle.appendChild(messageBox);
                        console.log('[DEBUG] Warning badge added:', warning.text);
                    }
                });
                
                hasAddedWarnings = true;
            }
        }
    }

    // Check every 500ms
    setInterval(function() {
        createWarningMessages();
    }, 500);
    
    // Also monitor for DOM changes
    const observer = new MutationObserver(function() {
        createWarningMessages();
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

# Tampermonkey Scripts

## Blocks Top Level Warning Script

Adds a visual warning badge when viewing "Blocks" Top Level entries in the Bleckfield support system.

### Installation

1. **Install Tampermonkey Extension**
   - [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. **Install the Script**
   - **[Click here to install](https://raw.githubusercontent.com/danmansfield/tmscripts/main/warning.user.js)**
   - Tampermonkey will open automatically
   - Click the "Install" button

3. **Verify Installation**
   - Navigate to https://support.bleckfield.com
   - Open a ticket with "Blocks" as Top Level
   - You should see a small red warning badge in the top-right

### Auto-Updates

The script automatically checks for updates daily. To manually check:
- Tampermonkey icon → Dashboard → Select script → Check for updates

### Version History
- **2.0.0** (2024) - Initial release with auto-update support

### Troubleshooting

If the warning doesn't appear:
1. Check Tampermonkey is enabled (icon should not be greyed out)
2. Refresh the page (F5)
3. Check the console for debug messages (F12)

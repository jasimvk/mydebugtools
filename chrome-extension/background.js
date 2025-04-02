// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  // JWT Decoder
  chrome.contextMenus.create({
    id: 'decodeJWT',
    parentId: 'myDebugToolsMenu',
    title: 'Decode JWT',
    contexts: ['selection']
  });

  // JSON Formatter
  chrome.contextMenus.create({
    id: 'formatJSON',
    parentId: 'myDebugToolsMenu',
    title: 'Format JSON',
    contexts: ['selection']
  });

  // Base64 Decoder
  chrome.contextMenus.create({
    id: 'decodeBase64',
    parentId: 'myDebugToolsMenu',
    title: 'Decode Base64',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;

  switch (info.menuItemId) {
    case 'decodeJWT':
      try {
        const [header, payload, signature] = selectedText.split('.');
        const decodedHeader = JSON.parse(atob(header));
        const decodedPayload = JSON.parse(atob(payload));
        
        chrome.storage.local.set({
          jwtInput: selectedText,
          jwtOutput: JSON.stringify({
            header: decodedHeader,
            payload: decodedPayload,
            signature: signature
          }, null, 2)
        });
      } catch (error) {
        chrome.storage.local.set({
          jwtInput: selectedText,
          jwtOutput: 'Invalid JWT: ' + error.message
        });
      }
      break;

    case 'formatJSON':
      try {
        const parsed = JSON.parse(selectedText);
        chrome.storage.local.set({
          jsonInput: selectedText,
          jsonOutput: JSON.stringify(parsed, null, 2)
        });
      } catch (error) {
        chrome.storage.local.set({
          jsonInput: selectedText,
          jsonOutput: 'Invalid JSON: ' + error.message
        });
      }
      break;

    case 'decodeBase64':
      try {
        const decoded = atob(selectedText);
        chrome.storage.local.set({
          base64Input: selectedText,
          base64Output: decoded
        });
      } catch (error) {
        chrome.storage.local.set({
          base64Input: selectedText,
          base64Output: 'Error decoding: ' + error.message
        });
      }
      break;
  }
}); 
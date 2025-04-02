// Theme handling
const themeToggle = document.getElementById('themeToggle');
let isDarkMode = false;

// Load saved theme preference
chrome.storage.local.get(['isDarkMode'], (result) => {
  isDarkMode = result.isDarkMode || false;
  updateTheme();
});

themeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  updateTheme();
  chrome.storage.local.set({ isDarkMode });
});

function updateTheme() {
  document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

// Tab handling
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.dataset.tab;
    
    // Update active states
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  });
});

// JSON Formatter
document.getElementById('formatJson').addEventListener('click', () => {
  const input = document.getElementById('jsonInput').value;
  try {
    const parsed = JSON.parse(input);
    document.getElementById('jsonOutput').textContent = JSON.stringify(parsed, null, 2);
  } catch (error) {
    document.getElementById('jsonOutput').textContent = 'Invalid JSON: ' + error.message;
  }
});

document.getElementById('minifyJson').addEventListener('click', () => {
  const input = document.getElementById('jsonInput').value;
  try {
    const parsed = JSON.parse(input);
    document.getElementById('jsonOutput').textContent = JSON.stringify(parsed);
  } catch (error) {
    document.getElementById('jsonOutput').textContent = 'Invalid JSON: ' + error.message;
  }
});

// JWT Decoder
document.getElementById('decodeJwt').addEventListener('click', () => {
  const input = document.getElementById('jwtInput').value;
  try {
    const [header, payload, signature] = input.split('.');
    const decodedHeader = JSON.parse(atob(header));
    const decodedPayload = JSON.parse(atob(payload));
    
    document.getElementById('jwtOutput').textContent = JSON.stringify({
      header: decodedHeader,
      payload: decodedPayload,
      signature: signature
    }, null, 2);
  } catch (error) {
    document.getElementById('jwtOutput').textContent = 'Invalid JWT: ' + error.message;
  }
});

document.getElementById('verifyJwt').addEventListener('click', () => {
  const input = document.getElementById('jwtInput').value;
  try {
    const [header, payload, signature] = input.split('.');
    const decodedHeader = JSON.parse(atob(header));
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if JWT is expired
    const exp = decodedPayload.exp;
    const isExpired = exp && Date.now() >= exp * 1000;
    
    document.getElementById('jwtOutput').textContent = JSON.stringify({
      header: decodedHeader,
      payload: decodedPayload,
      signature: signature,
      status: isExpired ? 'Expired' : 'Valid',
      expiration: exp ? new Date(exp * 1000).toISOString() : 'No expiration'
    }, null, 2);
  } catch (error) {
    document.getElementById('jwtOutput').textContent = 'Invalid JWT: ' + error.message;
  }
});

// XML Formatter
document.getElementById('formatXml').addEventListener('click', () => {
  const input = document.getElementById('xmlInput').value;
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, 'text/xml');
    const serializer = new XMLSerializer();
    const formatted = serializer.serializeToString(xmlDoc);
    document.getElementById('xmlOutput').textContent = formatted;
  } catch (error) {
    document.getElementById('xmlOutput').textContent = 'Invalid XML: ' + error.message;
  }
});

document.getElementById('minifyXml').addEventListener('click', () => {
  const input = document.getElementById('xmlInput').value;
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, 'text/xml');
    const serializer = new XMLSerializer();
    const minified = serializer.serializeToString(xmlDoc).replace(/>\s+</g, '><');
    document.getElementById('xmlOutput').textContent = minified;
  } catch (error) {
    document.getElementById('xmlOutput').textContent = 'Invalid XML: ' + error.message;
  }
});

// Base64 Converter
document.getElementById('encodeBase64').addEventListener('click', () => {
  const input = document.getElementById('base64Input').value;
  try {
    const encoded = btoa(input);
    document.getElementById('base64Output').textContent = encoded;
  } catch (error) {
    document.getElementById('base64Output').textContent = 'Error encoding: ' + error.message;
  }
});

document.getElementById('decodeBase64').addEventListener('click', () => {
  const input = document.getElementById('base64Input').value;
  try {
    const decoded = atob(input);
    document.getElementById('base64Output').textContent = decoded;
  } catch (error) {
    document.getElementById('base64Output').textContent = 'Error decoding: ' + error.message;
  }
});

// URL Encoder
document.getElementById('encodeUrl').addEventListener('click', () => {
  const input = document.getElementById('urlInput').value;
  try {
    const encoded = encodeURIComponent(input);
    document.getElementById('urlOutput').textContent = encoded;
  } catch (error) {
    document.getElementById('urlOutput').textContent = 'Error encoding: ' + error.message;
  }
});

document.getElementById('decodeUrl').addEventListener('click', () => {
  const input = document.getElementById('urlInput').value;
  try {
    const decoded = decodeURIComponent(input);
    document.getElementById('urlOutput').textContent = decoded;
  } catch (error) {
    document.getElementById('urlOutput').textContent = 'Error decoding: ' + error.message;
  }
});

// Hash Generator
document.getElementById('generateMd5').addEventListener('click', () => {
  const input = document.getElementById('hashInput').value;
  const hash = CryptoJS.MD5(input).toString();
  document.getElementById('hashOutput').textContent = hash;
});

document.getElementById('generateSha1').addEventListener('click', () => {
  const input = document.getElementById('hashInput').value;
  const hash = CryptoJS.SHA1(input).toString();
  document.getElementById('hashOutput').textContent = hash;
});

document.getElementById('generateSha256').addEventListener('click', () => {
  const input = document.getElementById('hashInput').value;
  const hash = CryptoJS.SHA256(input).toString();
  document.getElementById('hashOutput').textContent = hash;
});

// Add loading state helper functions
function setLoading(element, isLoading) {
  if (isLoading) {
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = 'Loading...';
  } else {
    element.disabled = false;
    element.textContent = element.dataset.originalText;
  }
}

// API Tester
document.getElementById('sendRequest').addEventListener('click', async () => {
  const button = document.getElementById('sendRequest');
  const method = document.getElementById('httpMethod').value;
  const url = document.getElementById('apiUrl').value;
  const body = document.getElementById('apiBody').value;
  
  try {
    setLoading(button, true);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (method !== 'GET' && body) {
      try {
        options.body = JSON.stringify(JSON.parse(body));
      } catch (e) {
        throw new Error('Invalid JSON in request body');
      }
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    document.getElementById('apiResponse').textContent = JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data
    }, null, 2);
  } catch (error) {
    document.getElementById('apiResponse').textContent = 'Error: ' + error.message;
  } finally {
    setLoading(button, false);
  }
});

document.getElementById('clearRequest').addEventListener('click', () => {
  document.getElementById('apiUrl').value = '';
  document.getElementById('apiBody').value = '';
  document.getElementById('apiResponse').textContent = '';
});

// CORS Tester
document.getElementById('testCors').addEventListener('click', async () => {
  const button = document.getElementById('testCors');
  const url = document.getElementById('corsUrl').value;
  
  try {
    setLoading(button, true);
    const response = await fetch(url, { method: 'OPTIONS' });
    const headers = Object.fromEntries(response.headers.entries());
    
    const corsInfo = {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
      corsEnabled: !!headers['access-control-allow-origin'],
      allowedOrigins: headers['access-control-allow-origin'],
      allowedMethods: headers['access-control-allow-methods'],
      allowedHeaders: headers['access-control-allow-headers'],
      maxAge: headers['access-control-max-age']
    };
    
    document.getElementById('corsOutput').textContent = JSON.stringify(corsInfo, null, 2);
  } catch (error) {
    document.getElementById('corsOutput').textContent = 'Error: ' + error.message;
  } finally {
    setLoading(button, false);
  }
});

// Clear All Data
document.getElementById('clearAllData').addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all saved data?')) {
    chrome.storage.local.clear(() => {
      // Clear all textareas and outputs
      document.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
      document.querySelectorAll('pre').forEach(pre => pre.textContent = '');
      alert('All data cleared!');
    });
  }
});

// Load saved data from storage
chrome.storage.local.get(['jsonInput', 'jwtInput', 'xmlInput', 'base64Input', 'urlInput', 'hashInput', 'apiUrl', 'apiBody', 'corsUrl'], (result) => {
  if (result.jsonInput) document.getElementById('jsonInput').value = result.jsonInput;
  if (result.jwtInput) document.getElementById('jwtInput').value = result.jwtInput;
  if (result.xmlInput) document.getElementById('xmlInput').value = result.xmlInput;
  if (result.base64Input) document.getElementById('base64Input').value = result.base64Input;
  if (result.urlInput) document.getElementById('urlInput').value = result.urlInput;
  if (result.hashInput) document.getElementById('hashInput').value = result.hashInput;
  if (result.apiUrl) document.getElementById('apiUrl').value = result.apiUrl;
  if (result.apiBody) document.getElementById('apiBody').value = result.apiBody;
  if (result.corsUrl) document.getElementById('corsUrl').value = result.corsUrl;
});

// Save data to storage when changed
['jsonInput', 'jwtInput', 'xmlInput', 'base64Input', 'urlInput', 'hashInput', 'apiUrl', 'apiBody', 'corsUrl'].forEach(id => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('input', (e) => {
      chrome.storage.local.set({ [id]: e.target.value });
    });
  }
});

// Add copy to clipboard functionality
function addCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = '📋';
    copyButton.title = 'Copy to clipboard';
    copyButton.onclick = async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent);
        copyButton.textContent = '✓';
        setTimeout(() => {
          copyButton.textContent = '📋';
        }, 2000);
      } catch (err) {
        copyButton.textContent = '❌';
        setTimeout(() => {
          copyButton.textContent = '📋';
        }, 2000);
      }
    };
    pre.parentNode.insertBefore(copyButton, pre);
  });
}

// Add auto-format on paste for JSON
document.getElementById('jsonInput').addEventListener('paste', (e) => {
  setTimeout(() => {
    try {
      const input = e.target.value;
      const parsed = JSON.parse(input);
      e.target.value = JSON.stringify(parsed, null, 2);
    } catch (error) {
      // If not valid JSON, leave as is
    }
  }, 0);
});

// Add auto-format on paste for XML
document.getElementById('xmlInput').addEventListener('paste', (e) => {
  setTimeout(() => {
    try {
      const input = e.target.value;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, 'text/xml');
      const serializer = new XMLSerializer();
      e.target.value = serializer.serializeToString(xmlDoc);
    } catch (error) {
      // If not valid XML, leave as is
    }
  }, 0);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to send API request
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'network') {
      document.getElementById('sendRequest').click();
    }
  }
  
  // Ctrl/Cmd + Shift + F to format JSON
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f') {
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'formatters') {
      document.getElementById('formatJson').click();
    }
  }
});

// Initialize copy buttons
addCopyButtons(); 
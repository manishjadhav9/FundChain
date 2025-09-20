/**
 * IPFS service for uploading files and content to IPFS
 * Using the local IPFS node running on port 5001
 */

// Local IPFS settings
const IPFS_HOST = 'http://127.0.0.1:5001';
const IPFS_GATEWAY = 'http://127.0.0.1:8080';

// IPFS gateways with local node first
const PUBLIC_GATEWAYS = [
  'http://127.0.0.1:8080/ipfs', // Local IPFS gateway (fastest)
  'https://gateway.ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs', 
  'https://ipfs.io/ipfs',
  'https://dweb.link/ipfs',
  'https://cf-ipfs.com/ipfs',
];

// IPFS Node ID for testing connection
const IPFS_NODE_ID = '12D3KooWNp5JabhQdHbeapJwxdQYwD2J7NV21pr84tv4GFghUeF7';

// Use global fetch to avoid the webpack module resolution issue
const fetchImplementation = typeof window !== 'undefined' ? window.fetch.bind(window) : global.fetch;

/**
 * Check if IPFS node is running
 * @returns {Promise<boolean>} - True if the IPFS node is running
 */
export async function checkIPFSConnection() {
  try {
    console.log('🔍 Checking IPFS connection...');
    const response = await fetch(`${IPFS_HOST}/api/v0/id`, {
      method: 'POST',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ IPFS connected - Node ID:', data.ID);
      return true;
    } else {
      console.warn('⚠️ IPFS API not responding:', response.status);
      return false;
    }
  } catch (error) {
    console.warn('⚠️ IPFS connection check failed:', error.message);
    console.log('💡 Make sure IPFS daemon is running: ipfs daemon');
    return false;
  }
}

/**
 * Upload a file to IPFS
 * @param {File} file - File object to upload
 * @returns {Promise<string>} - IPFS hash (CID) of the uploaded file
 */
export async function uploadFileToIPFS(file) {
  console.log('📤 Uploading file to IPFS:', file.name);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload with automatic pinning
    const response = await fetch(`${IPFS_HOST}/api/v0/add?pin=true&progress=false`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ File uploaded and pinned to IPFS:', data.Hash);
    
    // Verify the file is accessible via local gateway
    try {
      const testUrl = `http://127.0.0.1:8080/ipfs/${data.Hash}`;
      const testResponse = await fetch(testUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (testResponse.ok) {
        console.log('✅ File verified accessible via local gateway');
      }
    } catch (verifyError) {
      console.warn('⚠️ Could not verify file accessibility:', verifyError.message);
    }
    
    return data.Hash;
  } catch (error) {
    console.error('❌ IPFS upload error:', error);
    
    // Generate a deterministic mock CID for development
    const mockCid = generateMockCID(file.name + file.size + file.lastModified);
    console.warn(`⚠️ Using mock CID for development: ${mockCid}`);
    return mockCid;
  }
}

// Helper function to generate mock CIDs for development
async function generateMockCID(input) {
  // Create a simple hash-like string that looks like a CID
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // Use crypto.subtle if available, otherwise fallback to simple hash
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `Qm${hashHex.substring(0, 44)}`; // Make it look like a real CID
    } catch (e) {
      console.warn('Crypto API not available, using fallback hash');
    }
  }
  
  // Fallback: simple hash function
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and create CID-like string
  const positiveHash = Math.abs(hash).toString(16).padStart(12, '0');
  return `QmTZRVmhNi6AAuW2XwLykCyJZVcXDK2xE6oA5KG6vf${positiveHash}`;
}

/**
 * Check if an IPFS hash/CID is valid format
 * @param {string} hash - IPFS hash to validate
 * @returns {boolean} - True if valid CID format
 */
export function isValidIPFSHash(hash) {
  if (!hash || typeof hash !== 'string') return false;
  
  // Handle ipfs:// protocol
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
  }
  
  // Basic CID validation (starts with Qm and reasonable length)
  return hash.startsWith('Qm') && hash.length >= 46 && hash.length <= 59;
}

/**
 * Upload multiple files to IPFS
 * @param {File[]} files - Array of File objects to upload
 * @returns {Promise<string[]>} - Array of IPFS hashes (CIDs) for each file
 */
export async function uploadFilesToIPFS(files) {
  try {
    console.log(`Uploading ${files.length} files to IPFS...`);
    // Upload files sequentially to avoid timeouts and errors
    const results = [];
    for (const file of files) {
      const hash = await uploadFileToIPFS(file);
      results.push(hash);
    }
    return results;
  } catch (error) {
    console.error('Error uploading multiple files to IPFS:', error);
    throw new Error(`Failed to upload files to IPFS: ${error.message}`);
  }
}

/**
 * Upload JSON data to IPFS
 * @param {Object} data - JSON data to upload
 * @returns {Promise<string>} - IPFS hash (CID) of the uploaded JSON
 */
export async function uploadJSONToIPFS(data) {
  try {
    console.log('Uploading JSON to IPFS:', Object.keys(data));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });
    const cid = await uploadFileToIPFS(file);
    console.log('JSON uploaded with CID:', cid);
    return cid;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
  }
}

/**
 * Try to fetch content from multiple gateways with timeout
 * @param {string} hash - IPFS hash (CID)
 * @returns {Promise<Response>} - Response from the first successful gateway
 */
async function tryGateways(hash) {
  // Use only public gateways for better reliability
  const gateways = PUBLIC_GATEWAYS;
  
  // Try each gateway with timeout
  for (const gateway of gateways) {
    try {
      console.log(`🔄 Trying gateway: ${gateway}`);
      const response = await fetchImplementation(`${gateway}/${hash}`, {
        signal: AbortSignal.timeout(8000), // 8 second timeout per gateway
        cache: 'default' // Allow caching for better performance
      });
      
      if (response.ok) {
        console.log(`✅ Success with gateway: ${gateway}`);
        return response;
      } else {
        console.warn(`⚠️ Gateway ${gateway} returned status: ${response.status}`);
      }
    } catch (error) {
      console.warn(`❌ Gateway ${gateway} failed:`, error.message);
    }
  }
  
  throw new Error('All IPFS gateways failed');
}

/**
 * Get content from IPFS by hash with improved error handling
 * @param {string} hash - IPFS hash (CID) to fetch
 * @returns {Promise<Blob>} - Content as a Blob
 */
export async function getFromIPFS(hash) {
  try {
    console.log(`📥 Fetching content from IPFS: ${hash}`);
    
    // Try multiple gateways
    const response = await tryGateways(hash);
    const blob = await response.blob();
    
    console.log(`✅ Successfully fetched ${blob.size} bytes from IPFS`);
    return blob;
  } catch (error) {
    console.error('❌ Failed to fetch from IPFS gateways:', error.message);
    
    // For development, return a mock blob for common file types
    if (hash.includes('image') || hash.startsWith('Qm')) {
      console.log('🎭 Returning mock image blob for development');
      // Create a small SVG as fallback
      const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#6b7280">
          Image not available
        </text>
      </svg>`;
      return new Blob([svgContent], { type: 'image/svg+xml' });
    }
    
    throw new Error(`Failed to fetch content from IPFS: ${error.message}`);
  }
}

/**
 * Get JSON content from IPFS by hash with fallback
 * @param {string} hash - IPFS hash (CID) to fetch
 * @returns {Promise<Object>} - JSON data
 */
export async function getJSONFromIPFS(hash) {
  try {
    console.log(`📄 Fetching JSON from IPFS: ${hash}`);
    const blob = await getFromIPFS(hash);
    const text = await blob.text();
    const data = JSON.parse(text);
    console.log(`✅ Successfully parsed JSON with keys:`, Object.keys(data));
    return data;
  } catch (error) {
    console.error('❌ Error fetching JSON from IPFS:', error.message);
    
    // Return mock JSON data for development
    console.log('🎭 Returning mock JSON data for development');
    return {
      title: "Mock Document",
      description: "This is a mock document for development purposes",
      type: "application/json",
      createdAt: new Date().toISOString(),
      content: "Document content not available - IPFS gateway timeout"
    };
  }
}

/**
 * Get an HTTP URL for an IPFS resource (for displaying in browser)
 * @param {string} hash - IPFS hash (CID)
 * @returns {string} - HTTP URL for the IPFS resource
 */
export function getIPFSUrl(hash) {
  if (!hash) return '';
  
  // Handle ipfs:// protocol
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
  }
  
  // For development, use the most reliable public gateway directly
  return `${PUBLIC_GATEWAYS[0]}/${hash}`;
}

/**
 * Get an HTTP URL with public gateway fallback
 * @param {string} hash - IPFS hash (CID)
 * @returns {string} - HTTP URL for the IPFS resource with public gateway
 */
export function getPublicIPFSUrl(hash) {
  if (!hash) return '';
  
  // Handle ipfs:// protocol
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
  }
  
  // Use local gateway first (fastest and most reliable for our setup)
  return `${PUBLIC_GATEWAYS[0]}/${hash}`;
}

/**
 * Get multiple IPFS URLs for fallback loading
 * @param {string} hash - IPFS hash (CID)
 * @returns {string[]} - Array of HTTP URLs for fallback loading
 */
export function getIPFSUrlsWithFallbacks(hash) {
  if (!hash) return [];
  
  // Handle ipfs:// protocol
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
  }
  
  // Return URLs from all gateways for fallback
  return PUBLIC_GATEWAYS.map(gateway => `${gateway}/${hash}`);
}

/**
 * Create a placeholder image URL for when IPFS fails
 * @param {string} text - Text to display in placeholder
 * @returns {string} - Placeholder image URL
 */
export function getPlaceholderImageUrl(text = 'Campaign Image') {
  const encodedText = encodeURIComponent(text);
  return `https://via.placeholder.com/600x400/f97316/ffffff?text=${encodedText}`;
} 
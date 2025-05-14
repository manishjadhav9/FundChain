/**
 * IPFS service for uploading files and content to IPFS
 * Using the local IPFS node running on port 5001
 */

// Local IPFS settings
const IPFS_HOST = 'http://127.0.0.1:5001';
const IPFS_GATEWAY = 'http://127.0.0.1:8080';

// Public gateways for fallback
const PUBLIC_GATEWAYS = [
  'https://ipfs.io/ipfs',
  'https://gateway.ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://dweb.link/ipfs'
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
    console.log('Checking IPFS connection to:', IPFS_HOST);
    
    // Try direct API call first with more detailed error handling
    try {
      const apiResponse = await fetchImplementation(`${IPFS_HOST}/api/v0/id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Set credentials to omit to avoid CORS preflight issues
        credentials: 'omit',
        // Add random query param to avoid browser caching
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }).catch(e => {
        console.error('API fetch error:', e.message);
        return { ok: false, error: e };
      });
      
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        console.log('Connected to IPFS node:', data.ID);
        return true;
      } else {
        console.warn('API check returned non-ok response:', apiResponse.status);
      }
    } catch (apiError) {
      console.error('API check error:', apiError.message);
    }
    
    // Fallback to gateway check with detailed logging
    console.log('API check failed, trying gateway:', IPFS_GATEWAY);
    try {
      // Add a timestamp parameter to avoid cache
      const timestamp = Date.now();
      const response = await fetchImplementation(`${IPFS_GATEWAY}/ipfs/${IPFS_NODE_ID}?ts=${timestamp}`, {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'omit',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }).catch(e => {
        console.error('Gateway fetch error:', e.message);
        return { ok: false, error: e };
      });
      
      if (response.ok) {
        console.log('Connected to IPFS gateway successfully');
        return true;
      } else {
        console.warn('Gateway check returned non-ok response:', response.status);
      }
    } catch (gatewayError) {
      console.error('Gateway check error:', gatewayError.message);
    }
    
    // Try a public gateway as a last resort
    console.log('Local checks failed, trying public gateway');
    try {
      const publicResponse = await fetchImplementation(`${PUBLIC_GATEWAYS[0]}/${IPFS_NODE_ID}`, {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'omit',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }).catch(e => ({ ok: false }));
      
      if (publicResponse.ok) {
        console.log('Connected to public IPFS gateway, but local node may have issues');
        // Return true so app can function with public gateways
        return true;
      }
    } catch (publicError) {
      console.error('Public gateway check error:', publicError.message);
    }
    
    console.log('Could not connect to any IPFS node or gateway');
    return false;
  } catch (error) {
    console.error('Error in IPFS connection check:', error);
    return false;
  }
}

/**
 * Upload a file to IPFS
 * @param {File} file - File object to upload
 * @returns {Promise<string>} - IPFS hash (CID) of the uploaded file
 */
export async function uploadFileToIPFS(file) {
  try {
    console.log(`Uploading file to IPFS: ${file.name} (${file.size} bytes)`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Try uploading to IPFS
    const response = await fetchImplementation(`${IPFS_HOST}/api/v0/add?pin=true`, {
      method: 'POST',
      body: formData,
      // Let browser set content-type with boundary
    }).catch(error => {
      console.error('IPFS upload fetch error:', error);
      return { ok: false, statusText: error.message };
    });

    if (!response.ok) {
      console.error(`IPFS upload failed with status: ${response.status} ${response.statusText}`);
      throw new Error(`IPFS upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('File uploaded successfully:', data);
    return data.Hash; // Return the IPFS hash (CID)
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
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
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const file = new File([blob], 'data.json', { type: 'application/json' });
    return await uploadFileToIPFS(file);
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
  }
}

/**
 * Try to fetch content from multiple gateways
 * @param {string} hash - IPFS hash (CID)
 * @returns {Promise<Response>} - Response from the first successful gateway
 */
async function tryGateways(hash) {
  // Start with local gateway
  const gateways = [`${IPFS_GATEWAY}/ipfs`, ...PUBLIC_GATEWAYS];
  
  // Try each gateway
  for (const gateway of gateways) {
    try {
      const response = await fetchImplementation(`${gateway}/${hash}`);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn(`Gateway ${gateway} failed:`, error.message);
    }
  }
  
  throw new Error('All gateways failed');
}

/**
 * Get content from IPFS by hash
 * @param {string} hash - IPFS hash (CID) to fetch
 * @returns {Promise<Blob>} - Content as a Blob
 */
export async function getFromIPFS(hash) {
  try {
    // Try multiple gateways, starting with local
    const response = await tryGateways(hash);
    return await response.blob();
  } catch (error) {
    // Last try - direct API call
    try {
      console.log('All gateways failed, trying API directly');
      const response = await fetchImplementation(`${IPFS_HOST}/api/v0/cat?arg=${hash}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`IPFS API fetch failed: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (apiError) {
      console.error('Error fetching from IPFS:', apiError);
      throw new Error(`Failed to fetch content from IPFS: ${apiError.message}`);
    }
  }
}

/**
 * Get JSON content from IPFS by hash
 * @param {string} hash - IPFS hash (CID) to fetch
 * @returns {Promise<Object>} - JSON data
 */
export async function getJSONFromIPFS(hash) {
  try {
    const blob = await getFromIPFS(hash);
    const text = await blob.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching JSON from IPFS:', error);
    throw new Error(`Failed to fetch JSON from IPFS: ${error.message}`);
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
  
  // Use local gateway first, then fall back to public gateway
  return `${IPFS_GATEWAY}/ipfs/${hash}`;
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
  
  // Use public gateway for more reliable access
  return `${PUBLIC_GATEWAYS[0]}/${hash}`;
} 
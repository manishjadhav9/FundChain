/**
 * Enhanced IPFS utility with local file fallback
 * This module tries to upload to IPFS first, but falls back to local storage if that fails
 */

// IPFS API configuration - updated for better local node support
const IPFS_API_URL = 'http://127.0.0.1:5001/api/v0';
const IPFS_GATEWAY_URL = 'http://127.0.0.1:8080/ipfs';
const LOCAL_STORAGE_PATH = '/uploads';

/**
 * Direct method to upload to IPFS without initial checks - helps bypass issues
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - IPFS hash
 */
async function directIpfsUpload(file) {
  console.log(`Directly uploading file to IPFS: ${file.name}`);
  
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    // Set longer timeout for larger files
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    // Directly send to IPFS API
    const response = await fetch(`${IPFS_API_URL}/add?pin=true`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`IPFS upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('IPFS upload successful:', data);
    
    return data.Hash;
  } catch (error) {
    console.error('Direct IPFS upload error:', error);
    throw error;
  }
}

/**
 * Safely upload a file, trying IPFS first then falling back to local storage
 * @param {File} file - The file to upload
 * @returns {Promise<{hash: string, source: 'ipfs'|'local'}>} - Hash and source of uploaded file
 */
export async function safeUploadFile(file) {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  try {
    // Try direct IPFS upload without checks
    console.log(`Attempting IPFS upload: ${file.name} (${file.size} bytes)`);
    
    // Try up to 3 times for IPFS upload
    let ipfsHash = null;
    let attempts = 0;
    
    while (attempts < 3 && !ipfsHash) {
      try {
        attempts++;
        console.log(`IPFS upload attempt ${attempts}...`);
        ipfsHash = await directIpfsUpload(file);
      } catch (err) {
        console.warn(`IPFS attempt ${attempts} failed:`, err.message);
        if (attempts >= 3) throw err;
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Successfully uploaded to IPFS: ${ipfsHash}`);
    return { hash: ipfsHash, source: 'ipfs' };
  } catch (error) {
    console.warn(`All IPFS upload attempts failed: ${error.message}. Falling back to local storage.`);
    
    // Fall back to local storage
    const localHash = await saveToLocalStorage(file);
    console.log(`Successfully saved to local storage: ${localHash}`);
    return { hash: localHash, source: 'local' };
  }
}

/**
 * Save a file to local storage
 * @param {File} file - The file to save
 * @returns {Promise<string>} - Local hash/identifier for the file
 */
async function saveToLocalStorage(file) {
  try {
    console.log(`Saving file to local storage: ${file.name}`);
    
    // Create a new FormData and append the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to our API endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Local upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error during local upload');
    }
    
    console.log(`Successfully saved to local storage: ${data.hash}`);
    return data.hash; // Returns something like 'local:1234567890abcdef.jpg'
  } catch (error) {
    console.error('Error saving file locally:', error);
    // Last resort fallback - create an object URL
    // Note: This is temporary and won't persist after page refresh
    const objectUrl = URL.createObjectURL(file);
    const tempId = `temp:${Date.now()}`;
    
    // Store the mapping
    localStorage.setItem(tempId, objectUrl);
    console.warn('Using temporary in-memory storage as last resort');
    
    return tempId;
  }
}

/**
 * Check if IPFS node is running
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if IPFS node is running
 */
export async function checkIPFSConnection(timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${IPFS_API_URL}/id`, {
      method: 'POST',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    console.log('IPFS node detected with ID:', data.ID);
    return true;
  } catch (error) {
    console.log(`IPFS connection check failed: ${error.message}`);
    return false;
  }
}

/**
 * Upload multiple files safely with fallback
 * @param {File[]} files - Array of files to upload
 * @returns {Promise<{hash: string, source: string}[]>} - Array of hashes and their sources
 */
export async function safeUploadFiles(files) {
  if (!files || files.length === 0) {
    return [];
  }
  
  // Upload files sequentially
  const results = [];
  for (const file of files) {
    const result = await safeUploadFile(file);
    results.push(result);
  }
  
  return results;
}

/**
 * Upload JSON data, trying IPFS first then falling back to local
 * @param {object} data - JSON data to upload
 * @returns {Promise<{hash: string, source: 'ipfs'|'local'}>} - Hash and source
 */
export async function safeUploadJSON(data) {
  // Convert JSON to a file
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], 'data.json', { type: 'application/json' });
  
  // Use the same upload function for consistency
  return await safeUploadFile(file);
}

/**
 * Get a URL for accessing the content by hash
 * @param {string} hash - The IPFS hash or local identifier
 * @returns {string} - URL to access the content
 */
export function getContentUrl(hash) {
  if (!hash) return '';
  
  // Handle different hash formats
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
    return `${IPFS_GATEWAY_URL}/${hash}`;
  }
  
  if (hash.startsWith('local:')) {
    // Local file stored on server
    return `/uploads/${hash.replace('local:', '')}`;
  }
  
  if (hash.startsWith('temp:')) {
    // Fallback for temporary file URLs
    return localStorage.getItem(hash) || '';
  }
  
  // Assume it's a plain IPFS hash
  return `${IPFS_GATEWAY_URL}/${hash}`;
}

// For backward compatibility with existing code
export const uploadFileToIPFS = safeUploadFile;
export const uploadFilesToIPFS = safeUploadFiles;
export const uploadJSONToIPFS = safeUploadJSON;
export const getIPFSUrl = getContentUrl;

export default {
  uploadFileToIPFS: safeUploadFile,
  uploadFilesToIPFS: safeUploadFiles,
  uploadJSONToIPFS: safeUploadJSON,
  getIPFSUrl: getContentUrl,
  checkIPFSConnection
}; 
/**
 * Enhanced IPFS service with pinning and retrieval
 * Handles both local IPFS node and remote pinning services
 */

import { uploadFileToIPFS, getPublicIPFSUrl, getIPFSUrlsWithFallbacks, isValidIPFSHash } from './ipfs.js';

// Pinning service configurations
const PINNING_SERVICES = {
  // Pinata (popular IPFS pinning service)
  PINATA: {
    baseUrl: 'https://api.pinata.cloud',
    gateway: 'https://gateway.pinata.cloud/ipfs',
    // You'll need to get these from https://pinata.cloud
    apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
    secretKey: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || ''
  },
  
  // Web3.Storage (free IPFS pinning)
  WEB3_STORAGE: {
    baseUrl: 'https://api.web3.storage',
    gateway: 'https://w3s.link/ipfs',
    // Get token from https://web3.storage
    token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || ''
  },
  
  // NFT.Storage (free for NFTs and metadata)
  NFT_STORAGE: {
    baseUrl: 'https://api.nft.storage',
    gateway: 'https://nftstorage.link/ipfs',
    // Get token from https://nft.storage
    token: process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN || ''
  }
};

/**
 * Upload file to IPFS with automatic pinning
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export async function uploadAndPinFile(file, options = {}) {
  const { pinningService = 'LOCAL', metadata = {} } = options;
  
  try {
    console.log(`📤 Uploading and pinning file: ${file.name} (${file.size} bytes)`);
    
    let hash;
    
    // Try local IPFS first
    if (pinningService === 'LOCAL') {
      try {
        hash = await uploadToLocalIPFS(file, true); // Pin locally
        console.log(`✅ File uploaded and pinned locally: ${hash}`);
        return hash;
      } catch (localError) {
        console.warn('⚠️ Local IPFS upload failed, trying pinning services...');
      }
    }
    
    // Try pinning services
    if (pinningService === 'PINATA' || pinningService === 'AUTO') {
      try {
        hash = await uploadToPinata(file, metadata);
        if (hash) {
          console.log(`✅ File uploaded and pinned via Pinata: ${hash}`);
          return hash;
        }
      } catch (pinataError) {
        console.warn('⚠️ Pinata upload failed:', pinataError.message);
      }
    }
    
    if (pinningService === 'WEB3_STORAGE' || pinningService === 'AUTO') {
      try {
        hash = await uploadToWeb3Storage(file, metadata);
        if (hash) {
          console.log(`✅ File uploaded and pinned via Web3.Storage: ${hash}`);
          return hash;
        }
      } catch (web3Error) {
        console.warn('⚠️ Web3.Storage upload failed:', web3Error.message);
      }
    }
    
    // Fallback to regular upload without guaranteed pinning
    console.log('🔄 Falling back to regular IPFS upload...');
    hash = await uploadFileToIPFS(file);
    
    // Try to pin the uploaded file
    if (hash && isValidIPFSHash(hash)) {
      await pinExistingHash(hash);
    }
    
    return hash;
    
  } catch (error) {
    console.error('❌ Upload and pin failed:', error);
    throw error;
  }
}

/**
 * Upload to local IPFS with pinning
 */
async function uploadToLocalIPFS(file, pin = true) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = pin 
    ? 'http://127.0.0.1:5001/api/v0/add?pin=true&progress=false'
    : 'http://127.0.0.1:5001/api/v0/add?pin=false&progress=false';
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(30000) // 30 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`Local IPFS upload failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.Hash;
}

/**
 * Upload to Pinata pinning service
 */
async function uploadToPinata(file, metadata = {}) {
  const { apiKey, secretKey } = PINNING_SERVICES.PINATA;
  
  if (!apiKey || !secretKey) {
    throw new Error('Pinata API credentials not configured');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  // Add metadata
  const pinataMetadata = {
    name: file.name,
    keyvalues: {
      uploadedAt: new Date().toISOString(),
      ...metadata
    }
  };
  formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
  
  const response = await fetch(`${PINNING_SERVICES.PINATA.baseUrl}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey
    },
    body: formData,
    signal: AbortSignal.timeout(60000) // 60 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.IpfsHash;
}

/**
 * Upload to Web3.Storage
 */
async function uploadToWeb3Storage(file, metadata = {}) {
  const { token } = PINNING_SERVICES.WEB3_STORAGE;
  
  if (!token) {
    throw new Error('Web3.Storage token not configured');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${PINNING_SERVICES.WEB3_STORAGE.baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-NAME': file.name
    },
    body: formData,
    signal: AbortSignal.timeout(60000)
  });
  
  if (!response.ok) {
    throw new Error(`Web3.Storage upload failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.cid;
}

/**
 * Pin an existing IPFS hash
 * @param {string} hash - IPFS hash to pin
 * @param {string} service - Pinning service to use
 */
export async function pinExistingHash(hash, service = 'LOCAL') {
  if (!isValidIPFSHash(hash)) {
    throw new Error('Invalid IPFS hash');
  }
  
  try {
    console.log(`📌 Pinning existing hash: ${hash}`);
    
    if (service === 'LOCAL') {
      const response = await fetch(`http://127.0.0.1:5001/api/v0/pin/add?arg=${hash}`, {
        method: 'POST',
        signal: AbortSignal.timeout(30000)
      });
      
      if (response.ok) {
        console.log(`✅ Hash pinned locally: ${hash}`);
        return true;
      }
    }
    
    // Try pinning services for existing hashes
    if (service === 'PINATA') {
      await pinHashToPinata(hash);
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn(`⚠️ Failed to pin hash ${hash}:`, error.message);
    return false;
  }
}

/**
 * Pin existing hash to Pinata
 */
async function pinHashToPinata(hash) {
  const { apiKey, secretKey } = PINNING_SERVICES.PINATA;
  
  if (!apiKey || !secretKey) {
    throw new Error('Pinata API credentials not configured');
  }
  
  const response = await fetch(`${PINNING_SERVICES.PINATA.baseUrl}/pinning/pinByHash`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretKey
    },
    body: JSON.stringify({
      hashToPin: hash,
      pinataMetadata: {
        name: `Pinned-${hash}`,
        keyvalues: {
          pinnedAt: new Date().toISOString()
        }
      }
    }),
    signal: AbortSignal.timeout(30000)
  });
  
  if (!response.ok) {
    throw new Error(`Pinata pin failed: ${response.statusText}`);
  }
  
  console.log(`✅ Hash pinned to Pinata: ${hash}`);
}

/**
 * Check if a hash is pinned
 * @param {string} hash - IPFS hash to check
 * @returns {Promise<boolean>} - True if pinned
 */
export async function isHashPinned(hash) {
  if (!isValidIPFSHash(hash)) {
    return false;
  }
  
  try {
    // Check local pinning
    const response = await fetch(`http://127.0.0.1:5001/api/v0/pin/ls?arg=${hash}`, {
      method: 'POST',
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.Keys && Object.keys(data.Keys).length > 0;
    }
  } catch (error) {
    console.warn(`Failed to check pin status for ${hash}:`, error.message);
  }
  
  return false;
}

/**
 * Get enhanced IPFS URLs with pinning service gateways
 * @param {string} hash - IPFS hash
 * @returns {string[]} - Array of gateway URLs including pinning services
 */
export function getEnhancedIPFSUrls(hash) {
  if (!hash || !isValidIPFSHash(hash)) {
    return [];
  }
  
  // Handle ipfs:// protocol
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
  }
  
  // Start with local gateway (fastest)
  const localGateway = `http://127.0.0.1:8080/ipfs/${hash}`;
  
  // Get standard fallback URLs
  const standardUrls = getIPFSUrlsWithFallbacks(hash);
  
  // Add pinning service gateways
  const pinningGateways = [
    `${PINNING_SERVICES.PINATA.gateway}/${hash}`,
    `${PINNING_SERVICES.WEB3_STORAGE.gateway}/${hash}`,
    `${PINNING_SERVICES.NFT_STORAGE.gateway}/${hash}`
  ];
  
  // Combine all URLs: local first, then pinning services, then standard gateways
  return [localGateway, ...pinningGateways, ...standardUrls.slice(1)];
}

/**
 * Retrieve content with enhanced pinning service support
 * @param {string} hash - IPFS hash
 * @returns {Promise<Blob>} - Content blob
 */
export async function retrievePinnedContent(hash) {
  if (!hash || !isValidIPFSHash(hash)) {
    throw new Error('Invalid IPFS hash');
  }
  
  console.log(`📥 Retrieving pinned content: ${hash}`);
  
  const urls = getEnhancedIPFSUrls(hash);
  
  for (const url of urls) {
    try {
      console.log(`🔄 Trying: ${url}`);
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000) // 10 second timeout per URL
      });
      
      if (response.ok) {
        console.log(`✅ Content retrieved from: ${url}`);
        return await response.blob();
      }
    } catch (error) {
      console.warn(`❌ Failed to retrieve from ${url}:`, error.message);
    }
  }
  
  throw new Error('Content not accessible via any gateway');
}

/**
 * Bulk pin multiple hashes
 * @param {string[]} hashes - Array of IPFS hashes to pin
 * @param {string} service - Pinning service to use
 */
export async function bulkPinHashes(hashes, service = 'LOCAL') {
  const results = [];
  
  for (const hash of hashes) {
    try {
      const success = await pinExistingHash(hash, service);
      results.push({ hash, success });
    } catch (error) {
      results.push({ hash, success: false, error: error.message });
    }
  }
  
  return results;
}

export default {
  uploadAndPinFile,
  pinExistingHash,
  isHashPinned,
  getEnhancedIPFSUrls,
  retrievePinnedContent,
  bulkPinHashes
};

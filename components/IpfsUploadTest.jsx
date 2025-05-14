'use client';

import { useState } from 'react';
import { checkIPFSConnection, uploadFileToIPFS, uploadJSONToIPFS, getIPFSUrl } from '../lib/ipfs';

export default function IpfsUploadTest() {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [jsonHash, setJsonHash] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle checking IPFS connection
  const handleCheckConnection = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const connected = await checkIPFSConnection();
      setIsConnected(connected);
      
      if (connected) {
        setSuccessMessage('Successfully connected to IPFS node');
      } else {
        setError('Failed to connect to IPFS node. Make sure it is running.');
      }
    } catch (err) {
      setError(`Error checking IPFS connection: ${err.message}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const hash = await uploadFileToIPFS(file);
      setFileHash(hash);
      setSuccessMessage(`File uploaded successfully to IPFS with hash: ${hash}`);
    } catch (err) {
      setError(`Error uploading file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle JSON upload
  const handleJsonUpload = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const testData = {
        name: 'Test Campaign',
        description: 'This is a test campaign',
        timestamp: new Date().toISOString()
      };
      
      const hash = await uploadJSONToIPFS(testData);
      setJsonHash(hash);
      setSuccessMessage(`JSON uploaded successfully to IPFS with hash: ${hash}`);
    } catch (err) {
      setError(`Error uploading JSON: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">IPFS Upload Test</h1>
      
      {/* Connection Status */}
      <div className="mb-6">
        <button 
          onClick={handleCheckConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? 'Checking...' : 'Check IPFS Connection'}
        </button>
        
        {isConnected && (
          <div className="mt-2 text-green-600">
            ✓ Connected to IPFS node
          </div>
        )}
      </div>
      
      {/* File Upload */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">File Upload</h2>
        <input 
          type="file" 
          onChange={handleFileChange}
          className="mb-2 w-full"
        />
        <button 
          onClick={handleFileUpload}
          disabled={!file || isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          {isLoading ? 'Uploading...' : 'Upload File to IPFS'}
        </button>
        
        {fileHash && (
          <div className="mt-2">
            <p className="font-semibold">File Hash: <span className="font-normal">{fileHash}</span></p>
            <p className="font-semibold">Gateway URL: <a 
              href={getIPFSUrl(fileHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline font-normal"
            >
              {getIPFSUrl(fileHash)}
            </a></p>
          </div>
        )}
      </div>
      
      {/* JSON Upload */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">JSON Upload</h2>
        <p className="mb-2 text-gray-600">Test uploading a sample JSON object to IPFS</p>
        <button 
          onClick={handleJsonUpload}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
        >
          {isLoading ? 'Uploading...' : 'Upload Test JSON to IPFS'}
        </button>
        
        {jsonHash && (
          <div className="mt-2">
            <p className="font-semibold">JSON Hash: <span className="font-normal">{jsonHash}</span></p>
            <p className="font-semibold">Gateway URL: <a 
              href={getIPFSUrl(jsonHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline font-normal"
            >
              {getIPFSUrl(jsonHash)}
            </a></p>
          </div>
        )}
      </div>
      
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-200 rounded text-red-700 mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-200 rounded text-green-700 mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Troubleshooting</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Make sure your IPFS daemon is running (e.g., <code>ipfs daemon</code>)</li>
          <li>Verify IPFS API is accessible at <code>http://127.0.0.1:5001/api/v0</code></li>
          <li>Check CORS settings on your IPFS node (run <code>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'</code>)</li>
          <li>Restart the IPFS daemon after changing CORS settings</li>
          <li>Check your browser console for more detailed error messages</li>
        </ul>
      </div>
    </div>
  );
} 
"use client";

import { useState, useRef } from "react";
import { safeUploadFile, getContentUrl } from "@/lib/ipfs";

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      // Reset previous results
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      // Upload the file using our enhanced function
      const uploadResult = await safeUploadFile(file);
      setResult(uploadResult);
      
      console.log("Upload result:", uploadResult);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (hash: string) => {
    return getContentUrl(hash);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">File Upload Test</h1>
      <p className="mb-6 text-gray-600">
        This page tests the enhanced upload functionality with IPFS and local storage fallback.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload a File</h2>
          
          <div className="mb-4">
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            
            <div 
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-40 max-w-full object-contain mb-3" 
                  />
                  <p className="text-sm text-gray-600">{file?.name} ({Math.round(file?.size as number / 1024)} KB)</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg 
                    className="w-12 h-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-medium">Click to select a file</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, PDF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full py-2 px-4 rounded-md font-medium transition ${
              !file || uploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Result</h2>
          
          {result ? (
            <div>
              <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-md text-green-700">
                Upload successful!
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Details:</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li><strong>Source:</strong> {result.source}</li>
                  <li><strong>Hash:</strong> <code className="bg-gray-100 p-1 rounded">{result.hash}</code></li>
                </ul>
              </div>
              
              {result.hash && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Preview:</h3>
                  <div className="border rounded-md p-2">
                    <img 
                      src={getImageUrl(result.hash)} 
                      alt="Uploaded file" 
                      className="max-h-60 max-w-full object-contain mx-auto" 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 break-all">
                    URL: {getImageUrl(result.hash)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No upload result yet.</p>
              <p className="text-sm">Select a file and click "Upload File" to test.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
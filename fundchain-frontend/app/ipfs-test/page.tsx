"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  checkIPFSConnection, 
  uploadFileToIPFS, 
  uploadJSONToIPFS,
  getIPFSUrl,
  getPublicIPFSUrl 
} from "@/lib/ipfs"
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon, Terminal } from "lucide-react"

export default function IPFSTestPage() {
  const [status, setStatus] = useState<string>("")
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [uploadedHash, setUploadedHash] = useState<string>("")
  const [jsonUploadedHash, setJsonUploadedHash] = useState<string>("")
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [jsonUploadStatus, setJsonUploadStatus] = useState<string>("")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isJsonUploading, setIsJsonUploading] = useState<boolean>(false)
  const [jsonInput, setJsonInput] = useState<string>('{\n  "name": "FundChain Project",\n  "description": "A sample JSON document",\n  "attributes": {\n    "category": "Blockchain",\n    "fundraising": true\n  }\n}')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-test connection on component mount
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus("Testing connection to IPFS node...")
      const connected = await checkIPFSConnection()
      setIsConnected(connected)
      setStatus(connected ? "Connected to IPFS node successfully!" : "Failed to connect to IPFS node. Make sure your IPFS daemon is running and CORS is properly configured.")
    } catch (error: any) {
      setIsConnected(false)
      setStatus(`Error: ${error.message}`)
      console.error("IPFS connection error:", error)
    }
  }

  const handleFileUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setUploadStatus("Please select a file first")
      return
    }

    try {
      setIsUploading(true)
      setUploadStatus("Uploading file to IPFS...")
      
      const hash = await uploadFileToIPFS(file)
      setUploadedHash(hash)
      setUploadStatus(`File uploaded successfully! CID: ${hash}`)
    } catch (error: any) {
      setUploadStatus(`Error uploading file: ${error.message}`)
      console.error("IPFS upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleJsonUpload = async () => {
    if (!jsonInput) {
      setJsonUploadStatus("Please enter JSON data first")
      return
    }

    try {
      setIsJsonUploading(true)
      setJsonUploadStatus("Uploading JSON to IPFS...")
      
      // Parse JSON to validate it
      const jsonData = JSON.parse(jsonInput)
      const hash = await uploadJSONToIPFS(jsonData)
      setJsonUploadedHash(hash)
      setJsonUploadStatus(`JSON uploaded successfully! CID: ${hash}`)
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        setJsonUploadStatus(`Invalid JSON: ${error.message}`)
      } else {
        setJsonUploadStatus(`Error uploading JSON: ${error.message}`)
      }
      console.error("JSON upload error:", error)
    } finally {
      setIsJsonUploading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">IPFS Connection & Upload Test</h1>
      
      {!isConnected && isConnected !== null && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            Could not connect to IPFS. Make sure your IPFS daemon is running and CORS is properly configured.
            See the configuration guide section below.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>IPFS Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-4">
                  Test connection to your local IPFS node
                </p>
                <Button onClick={testConnection}>
                  Check IPFS Connection
                </Button>
              </div>
              
              {status && (
                <div className="mt-4 p-4 rounded-md bg-muted">
                  <p className="font-mono text-sm">
                    Status: {status}
                  </p>
                  {isConnected !== null && (
                    <div className={`mt-2 flex items-center ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                      <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <p>{isConnected ? 'Connected' : 'Disconnected'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="file">
          <TabsList className="mb-4">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="json">Upload JSON</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file">
            <Card>
              <CardHeader>
                <CardTitle>Upload File to IPFS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select a file to upload</Label>
                    <Input id="file" type="file" ref={fileInputRef} className="mt-2" />
                  </div>
                  
                  <Button onClick={handleFileUpload} disabled={isUploading || !isConnected}>
                    {isUploading ? "Uploading..." : "Upload to IPFS"}
                  </Button>
                  
                  {uploadStatus && (
                    <div className="mt-4 p-4 rounded-md bg-muted">
                      <p className="font-mono text-sm break-all">
                        {uploadStatus}
                      </p>
                      
                      {uploadedHash && (
                        <div className="mt-4 space-y-2">
                          <div>
                            <p className="font-medium">Local Gateway URL:</p>
                            <a 
                              href={getIPFSUrl(uploadedHash)} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline break-all"
                            >
                              {getIPFSUrl(uploadedHash)}
                            </a>
                          </div>
                          
                          <div>
                            <p className="font-medium">Public Gateway URL:</p>
                            <a 
                              href={getPublicIPFSUrl(uploadedHash)} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline break-all"
                            >
                              {getPublicIPFSUrl(uploadedHash)}
                            </a>
                          </div>
                          
                          {fileInputRef.current?.files?.[0]?.type.startsWith('image/') && (
                            <div className="mt-4">
                              <p className="font-medium">Preview:</p>
                              <div className="mt-2 max-w-sm border rounded-md overflow-hidden">
                                <img 
                                  src={getPublicIPFSUrl(uploadedHash)} 
                                  alt="Uploaded preview" 
                                  className="w-full h-auto"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="json">
            <Card>
              <CardHeader>
                <CardTitle>Upload JSON to IPFS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="json">JSON Data</Label>
                    <div className="mt-2 relative">
                      <textarea
                        id="json"
                        rows={10}
                        className="w-full min-h-[200px] p-4 font-mono text-sm border rounded-md"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={handleJsonUpload} disabled={isJsonUploading || !isConnected}>
                    {isJsonUploading ? "Uploading..." : "Upload JSON to IPFS"}
                  </Button>
                  
                  {jsonUploadStatus && (
                    <div className="mt-4 p-4 rounded-md bg-muted">
                      <p className="font-mono text-sm break-all">
                        {jsonUploadStatus}
                      </p>
                      
                      {jsonUploadedHash && (
                        <div className="mt-4 space-y-2">
                          <div>
                            <p className="font-medium">Local Gateway URL:</p>
                            <a 
                              href={getIPFSUrl(jsonUploadedHash)} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline break-all"
                            >
                              {getIPFSUrl(jsonUploadedHash)}
                            </a>
                          </div>
                          
                          <div>
                            <p className="font-medium">Public Gateway URL:</p>
                            <a 
                              href={getPublicIPFSUrl(jsonUploadedHash)} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline break-all"
                            >
                              {getPublicIPFSUrl(jsonUploadedHash)}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>IPFS Configuration Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                If you're having connection issues, make sure your IPFS node has CORS properly configured:
              </p>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  <code>
                    {`ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST", "PUT", "DELETE", "OPTIONS"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization", "X-Requested-With", "Range", "Content-Type"]'
ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location", "WWW-Authenticate"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'`}
                  </code>
                </pre>
              </div>
              
              <p className="text-muted-foreground">
                After applying these settings, restart your IPFS node.
              </p>

              <div className="mt-4 flex items-start">
                <InfoIcon className="w-5 h-5 mr-2 mt-0.5 text-blue-500" />
                <p className="text-sm">
                  You can also test your IPFS setup directly by visiting <a href="/ipfs-direct-test.html" target="_blank" className="text-blue-500 hover:underline">/ipfs-direct-test.html</a>,
                  which is a simpler test page that bypasses the Next.js framework.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { uploadFileToIPFS, getPublicIPFSUrl, checkIPFSConnection } from "@/lib/ipfs"
import { AlertCircle, Upload, Check, X, Image } from "lucide-react"

interface IpfsUploadProps {
  label?: string
  description?: string
  onUploadComplete: (cid: string) => void
  initialCid?: string
  acceptedFileTypes?: string
  maxSizeMB?: number
  required?: boolean
}

export default function IpfsUpload({
  label = "Upload File",
  description = "Upload a file to IPFS",
  onUploadComplete,
  initialCid = "",
  acceptedFileTypes = "image/*",
  maxSizeMB = 10,
  required = false
}: IpfsUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")
  const [cid, setCid] = useState<string>(initialCid)
  const [ipfsAvailable, setIpfsAvailable] = useState<boolean | null>(null)
  const [checkingIpfs, setCheckingIpfs] = useState<boolean>(true)

  // Check IPFS connection on mount
  useEffect(() => {
    const checkIpfs = async () => {
      try {
        const available = await checkIPFSConnection()
        setIpfsAvailable(available)
      } catch (error) {
        setIpfsAvailable(false)
      } finally {
        setCheckingIpfs(false)
      }
    }
    
    checkIpfs()
  }, [])
  
  // Set preview when initialCid changes
  useEffect(() => {
    if (initialCid) {
      setCid(initialCid)
      setPreview(getPublicIPFSUrl(initialCid))
    }
  }, [initialCid])
  
  // Update preview when file is selected
  useEffect(() => {
    if (!file) return
    
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    
    // Clean up the URL when done
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    // Validate file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }
    
    setFile(selectedFile)
    setError("")
  }
  
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }
    
    if (!ipfsAvailable) {
      setError("IPFS is not available. Make sure your IPFS node is running.")
      return
    }
    
    try {
      setIsUploading(true)
      setError("")
      
      const hash = await uploadFileToIPFS(file)
      setCid(hash)
      onUploadComplete(hash)
    } catch (error: any) {
      setError(`Upload failed: ${error.message}`)
      console.error("IPFS upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }
  
  const clearFile = () => {
    setFile(null)
    if (!initialCid) {
      setPreview("")
      setCid("")
      onUploadComplete("")
    } else {
      // Reset to initial values
      setPreview(getPublicIPFSUrl(initialCid))
      setCid(initialCid)
      onUploadComplete(initialCid)
    }
  }
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload" className="block text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {checkingIpfs ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <div className="text-sm text-muted-foreground">Checking IPFS connection...</div>
        </div>
      ) : !ipfsAvailable ? (
        <Alert variant="destructive" className="text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            IPFS is not available. Make sure your IPFS node is running and CORS is properly configured.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept={acceptedFileTypes}
                disabled={isUploading || !!cid}
                className="cursor-pointer"
              />
            </div>
            
            {!cid ? (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="whitespace-nowrap"
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={clearFile}
                className="whitespace-nowrap"
              >
                <X className="mr-2 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          {cid && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Uploaded to IPFS with CID: <code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded">{cid}</code>
            </div>
          )}
          
          {preview && (
            <div className="mt-4">
              {acceptedFileTypes.includes('image') ? (
                <div className="relative border rounded-md overflow-hidden" style={{maxWidth: '300px'}}>
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center border rounded-md p-3 bg-muted" style={{maxWidth: '300px'}}>
                  <Image className="h-10 w-10 mr-2 text-muted-foreground" />
                  <div className="text-sm truncate">{file?.name || "File uploaded"}</div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
} 
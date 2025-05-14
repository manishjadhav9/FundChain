"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import IpfsUpload from "@/components/ipfs-upload"
import { uploadJSONToIPFS } from "@/lib/ipfs"
import { ethToInr, formatCurrency } from "@/lib/currency"
import { sendCampaignForVerification } from "@/lib/admin-service"
import { AlertCircle, ArrowLeft, FileText, Image as ImageIcon, X, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CreateCampaignPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    targetAmountInr: "",
    campaignType: "",
    imageCid: "",
    documentCids: [] as string[],
    milestones: [] as { title: string; description: string; amount: string }[]
  })
  
  // Add state for milestones
  const [milestones, setMilestones] = useState([
    { title: "Initial Funding", description: "First milestone for campaign setup", amount: "0.5" }
  ]);
  
  const [error, setError] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [metadataCid, setMetadataCid] = useState<string>("")

  // Update INR when ETH amount changes
  useEffect(() => {
    if (formData.targetAmount) {
      const inrAmount = ethToInr(formData.targetAmount);
      setFormData(prev => ({ ...prev, targetAmountInr: inrAmount.toString() }));
    }
  }, [formData.targetAmount]);

  // Sync milestones with formData.milestones
  useEffect(() => {
    setFormData(prev => ({ ...prev, milestones }));
  }, [milestones]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, campaignType: value }))
  }
  
  const handleImageUpload = (cid: string) => {
    setFormData(prev => ({ ...prev, imageCid: cid }))
  }
  
  const handleDocumentUpload = (cid: string) => {
    if (!cid) return
    setFormData(prev => ({ 
      ...prev, 
      documentCids: [...prev.documentCids, cid] 
    }))
  }
  
  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentCids: prev.documentCids.filter((_, i) => i !== index)
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setError("");
      
      // Basic validation
      if (!formData.title || !formData.description || !formData.targetAmount || !formData.campaignType) {
        setError("Please fill in all required fields");
        return;
      }
      
      if (!formData.imageCid) {
        setError("Please upload a campaign image");
        return;
      }
      
      if (formData.documentCids.length === 0) {
        setError("Please upload at least one supporting document");
        return;
      }
      
      if (formData.milestones.length === 0) {
        setError("Please add at least one milestone");
        return;
      }
      
      // Check total milestone amount equals target amount
      const totalMilestoneAmount = formData.milestones.reduce((sum, m) => sum + parseFloat(m.amount), 0);
      const targetAmountFloat = parseFloat(formData.targetAmount);
      
      if (Math.abs(totalMilestoneAmount - targetAmountFloat) > 0.001) {
        setError(`Total milestone amount (${totalMilestoneAmount} ETH) must equal target amount (${targetAmountFloat} ETH)`);
        return;
      }
      
      // Create metadata for IPFS
      const metadata = {
        title: formData.title,
        description: formData.description,
        targetAmount: formData.targetAmount,
        campaignType: formData.campaignType,
        imageCid: formData.imageCid,
        documentCids: formData.documentCids,
        milestones: formData.milestones,
        createdAt: new Date().toISOString()
      };
      
      // Upload metadata to IPFS
      console.log("Uploading metadata to IPFS...");
      const metadataCid = await uploadJSONToIPFS(metadata);
      console.log("Metadata uploaded with CID:", metadataCid);
      
      // Show metamask network fee warning
      if (!confirm("You will need to pay a small network fee using MetaMask to register your campaign on the blockchain. Continue?")) {
        setError("Campaign submission cancelled");
        return;
      }
      
      // Create campaign verification request data
      const campaignData = {
        title: formData.title,
        description: formData.description,
        targetAmount: formData.targetAmount,
        targetAmountInr: formData.targetAmountInr,
        campaignType: formData.campaignType,
        imageHash: formData.imageCid,
        documentHashes: formData.documentCids,
        milestones: formData.milestones,
        metadataCid: metadataCid,
        // Add organizer info - in a real app, this would come from auth context
        organizer: {
          name: "John Doe", 
          email: "john@example.com",
          address: "0x1234567890123456789012345678901234567890"
        }
      };
      
      // Send campaign for admin verification - this will trigger MetaMask
      await sendCampaignForVerification(campaignData);
      
      setSubmitted(true);
      
    } catch (err: any) {
      setError(`Failed to create campaign: ${err.message}`)
      console.error("Campaign creation error:", err)
    } finally {
      setSubmitting(false)
    }
  }
  
  if (submitted) {
    return (
      <div className="container py-10">
        <Alert className="bg-green-50 border-green-200 mb-8">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-medium">Campaign Registered Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            <p>Your campaign has been registered on the blockchain and submitted for verification.</p>
            <p className="mt-2">The admin team will review your campaign and verify it shortly. Once verified, your campaign will be live for donations.</p>
            <p className="mt-2 font-medium">Note: You've already paid the network fee to register the campaign. No additional fee is required.</p>
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between">
          <Link href="/campaigns">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
            </Button>
          </Link>
          
          <Link href="/my-campaigns">
            <Button>
              View My Campaigns
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <Link href="/campaigns">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Provide the basic information about your fundraising campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Campaign Title <span className="text-red-500">*</span></Label>
                  <Input 
                    id="title"
                    name="title"
                    placeholder="Enter a compelling title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="description"
                    name="description"
                    placeholder="Describe your campaign and why people should support it"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetAmount">Target Amount (in ETH) <span className="text-red-500">*</span></Label>
                    <Input 
                      id="targetAmount"
                      name="targetAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.targetAmount}
                      onChange={handleInputChange}
                      required
                    />
                    {formData.targetAmount && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ≈ {formatCurrency(ethToInr(formData.targetAmount))} INR
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="campaignType">Campaign Type <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formData.campaignType}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger id="campaignType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEDICAL">Medical Emergency</SelectItem>
                        <SelectItem value="RELIGIOUS">Religious Cause</SelectItem>
                        <SelectItem value="NGO">NGO Initiative</SelectItem>
                        <SelectItem value="GOVERNMENT">Government Project</SelectItem>
                        <SelectItem value="EDUCATION">Education Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Campaign Media</CardTitle>
                <CardDescription>
                  Upload images and documents for your campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="image">
                  <TabsList className="mb-4">
                    <TabsTrigger value="image">
                      <ImageIcon className="mr-2 h-4 w-4" /> Campaign Image
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                      <FileText className="mr-2 h-4 w-4" /> Supporting Documents
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="image">
                    <IpfsUpload
                      label="Campaign Image"
                      description="Upload a high-quality image that represents your campaign (max 10MB)"
                      onUploadComplete={handleImageUpload}
                      initialCid={formData.imageCid}
                      acceptedFileTypes="image/*"
                      required
                    />
                  </TabsContent>
                  
                  <TabsContent value="documents">
                    <div className="space-y-6">
                      <IpfsUpload
                        label="Supporting Document"
                        description="Upload documents to verify your campaign (PDF, images, etc.)"
                        onUploadComplete={handleDocumentUpload}
                        acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        maxSizeMB={20}
                      />
                      
                      {formData.documentCids.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium mb-2">Uploaded Documents</h3>
                          <div className="space-y-2">
                            {formData.documentCids.map((cid, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                <span className="text-sm truncate mr-2">Document {index + 1}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocument(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Milestones</CardTitle>
                <CardDescription>
                  Define funding milestones for your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="p-4 border rounded-md space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Milestone {index + 1}</h3>
                      {index > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setMilestones(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`milestone-title-${index}`}>Title</Label>
                      <Input 
                        id={`milestone-title-${index}`}
                        value={milestone.title}
                        onChange={(e) => {
                          const newMilestones = [...milestones];
                          newMilestones[index].title = e.target.value;
                          setMilestones(newMilestones);
                        }}
                        placeholder="Milestone title"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`milestone-desc-${index}`}>Description</Label>
                      <Textarea 
                        id={`milestone-desc-${index}`}
                        value={milestone.description}
                        onChange={(e) => {
                          const newMilestones = [...milestones];
                          newMilestones[index].description = e.target.value;
                          setMilestones(newMilestones);
                        }}
                        placeholder="Describe this milestone"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`milestone-amount-${index}`}>Amount (ETH)</Label>
                      <Input 
                        id={`milestone-amount-${index}`}
                        value={milestone.amount}
                        onChange={(e) => {
                          const newMilestones = [...milestones];
                          newMilestones[index].amount = e.target.value;
                          setMilestones(newMilestones);
                        }}
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMilestones(prev => [
                      ...prev, 
                      {
                        title: `Milestone ${prev.length + 1}`,
                        description: "",
                        amount: "0.1"
                      }
                    ]);
                  }}
                >
                  Add Milestone
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Note: Total milestone amounts should equal your campaign target amount of {formData.targetAmount || "0"} ETH.
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Title</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.title || "Not provided"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Type</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.campaignType || "Not selected"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Target Amount</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.targetAmount ? `${formData.targetAmount} ETH` : "Not provided"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Media</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.imageCid ? "Image uploaded" : "No image uploaded"} •&nbsp;
                      {formData.documentCids.length} document(s)
                    </p>
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className="w-full mt-6" 
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Creating Campaign..." : "Create Campaign"}
                </Button>
                
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  By creating a campaign, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

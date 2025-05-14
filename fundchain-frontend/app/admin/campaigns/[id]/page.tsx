"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { 
  ArrowLeft,
  Calendar, 
  CheckCircle,
  ClipboardList,
  DollarSign, 
  Download,
  Eye,
  FileText, 
  Info,
  Lock,
  MessageSquare,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
  XCircle,
  Check,
  Clock,
  ExternalLink,
  AlertTriangle,
  Shield,
  Alert,
  AlertCircle,
  AlertDescription,
  AlertTitle
} from "lucide-react"
import { toast } from "sonner"

import { getCampaign, verifyCampaign } from "@/lib/contracts"
import { getIPFSUrl, getPublicIPFSUrl } from "@/lib/ipfs"

// Mock data for campaign details - in a real app, you would fetch this from an API
const getCampaignDetails = (id: string) => {
  return {
    id,
    title: "Medical Treatment for Arun Kumar",
    type: "MEDICAL",
    organizer: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 9876543220",
      address: "42 Park Street, Kolkata, West Bengal",
      identityProof: {
        type: "Aadhar Card",
        number: "XXXX-XXXX-4589",
        verified: false
      }
    },
    targetAmount: 250000,
    imageHash: "QmTZRVmhNi6AAuW2XwLykCyJZVcXDK2xE6oA5KG6vfbqAX", // IPFS hash for the campaign image
    description: "Urgent financial help needed for Arun Kumar's heart surgery at Apollo Hospital. Arun, a 42-year-old school teacher, has been diagnosed with a severe cardiac condition requiring immediate surgery. His family has exhausted their savings on initial treatments, and they need our support to cover the surgical expenses. The surgery is scheduled for next month, and your contribution will help Arun get the medical care he needs to continue supporting his family.",
    documents: [
      { name: "Medical Reports.pdf", url: "#", type: "pdf", size: "1.2 MB", hash: "" },
      { name: "Hospital Estimate.pdf", url: "#", type: "pdf", size: "450 KB", hash: "" },
      { name: "Identity Proof.jpg", url: "#", type: "image", size: "2.1 MB", hash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" },
      { name: "Recommendation Letter.pdf", url: "#", type: "pdf", size: "320 KB", hash: "" },
      { name: "Previous Treatment Bills.pdf", url: "#", type: "pdf", size: "1.8 MB", hash: "" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-18T11:20:00Z",
    milestones: [
      {
        id: "m1",
        title: "Initial Treatment and Consultation",
        description: "Covering the cost of initial consultations, tests, and pre-surgery treatments.",
        amount: 50000,
        status: "PENDING"
      },
      {
        id: "m2",
        title: "Heart Surgery",
        description: "The main cardiac procedure at Apollo Hospital including surgeon fees, OT charges, and hospitalization.",
        amount: 150000,
        status: "PENDING"
      },
      {
        id: "m3",
        title: "Post-Surgery Care",
        description: "Recovery care, medications, follow-up appointments, and rehabilitation therapy.",
        amount: 50000,
        status: "PENDING"
      }
    ],
    patientDetails: {
      name: "Arun Kumar",
      age: 42,
      condition: "Severe cardiac condition requiring bypass surgery",
      hospital: "Apollo Hospital, Delhi",
      doctorName: "Dr. Rajesh Sharma",
      scheduledDate: "2024-06-15"
    },
    comments: [
      {
        id: "c1",
        user: "Admin",
        text: "Please provide more details about the hospital and surgical procedure.",
        timestamp: "2024-04-19T10:30:00Z"
      },
      {
        id: "c2",
        user: "Rahul Sharma",
        text: "I've uploaded the detailed hospital estimate with procedure information.",
        timestamp: "2024-04-19T14:45:00Z"
      }
    ]
  }
}

export default function AdminCampaignDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [campaign, setCampaign] = useState(getCampaignDetails(params.id))
  const [loading, setLoading] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [verificationComment, setVerificationComment] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [verifying, setVerifying] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/admin/campaigns/" + params.id)
    } else if (!isAdmin) {
      router.push("/dashboard")
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      })
    }
  }, [user, isAdmin, router, params.id, toast])

  // Fetch real campaign data from blockchain when available
  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        // Only attempt to fetch if the ID looks like an Ethereum address
        if (params.id && params.id.startsWith('0x') && params.id.length === 42) {
          setLoading(true);
          const campaignData = await getCampaign(params.id);
          if (campaignData) {
            setCampaign({
              ...campaignData,
              // Merge with existing mock data structure as needed
              documents: campaign.documents // Keep documents from mock for now
            });
          }
        }
      } catch (error) {
        console.error("Error fetching campaign data:", error);
        // Continue using mock data
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [params.id]);

  if (!user || !isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="container py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/admin/verifications")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Verifications
        </Button>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  const handleVerifyCampaign = async () => {
    try {
      setVerifying(true);
      toast({
        title: "Verifying Campaign",
        description: "Processing your verification request...",
      });
      
      // No MetaMask popup or transaction will happen
      await verifyCampaign(params.id);
      
      toast({
        title: "Campaign Verified Successfully",
        description: "The campaign has been verified without requiring any network fees",
        variant: "success",
      });
      
      // Refresh campaign data
      const updatedCampaign = await getCampaign(params.id);
      setCampaign(updatedCampaign);
      setShowVerificationDialog(false);
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "There was an error verifying the campaign",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  }

  const handleRejectCampaign = () => {
    setLoading(true)
    // Here you would make an API call to reject the campaign
    setTimeout(() => {
      setLoading(false)
      setShowRejectionDialog(false)
      toast({
        title: "Campaign Rejected",
        description: "The campaign has been rejected",
        variant: "destructive",
      })
      router.push("/admin/verifications")
    }, 1500)
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/admin/verifications")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Verifications
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{campaign.status}</Badge>
            <Badge variant="outline">{campaign.type}</Badge>
            <span className="text-sm text-muted-foreground">
              Submitted on {new Date(campaign.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>Are you sure you want to verify this campaign? This will:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Update the campaign status on the blockchain</li>
                  <li>Make the campaign publicly visible to all users</li>
                  <li>Enable donations to be received for this campaign</li>
                </ul>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-green-800">No Network Fee Required</h5>
                      <p className="text-sm text-green-700 mt-1">
                        As an admin, you won't be charged any network fee for verifying this campaign.
                        The campaign is already registered on-chain by the donor who paid the initial gas fee.
                      </p>
                    </div>
                  </div>
                </div>
                
                <textarea 
                  className="w-full h-24 p-2 border rounded-md" 
                  placeholder="Add verification notes (optional)"
                  value={verificationComment}
                  onChange={(e) => setVerificationComment(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>Cancel</Button>
                <Button 
                  className="bg-primary hover:bg-primary/90" 
                  onClick={handleVerifyCampaign}
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "Confirm Verification"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Reject Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>Are you sure you want to reject this campaign? Please provide a reason:</p>
                <textarea 
                  className="w-full h-24 p-2 border rounded-md" 
                  placeholder="Reason for rejection (required)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>Cancel</Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectCampaign}
                  disabled={loading || !rejectionReason.trim()}
                >
                  {loading ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full grid grid-cols-4 md:grid-cols-5 lg:flex lg:flex-wrap">
          <TabsTrigger value="overview">
            <Info className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="milestones">
            <ClipboardList className="mr-2 h-4 w-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="organizer">
            <User className="mr-2 h-4 w-4" />
            Organizer
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessageSquare className="mr-2 h-4 w-4" />
            Communication
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>General information about the campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {campaign.imageHash ? (
                <div className="mb-6 border rounded-lg overflow-hidden">
                  <img 
                    src={getPublicIPFSUrl(campaign.imageHash)}
                    alt={campaign.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      // Try direct IPFS gateway if the public gateway fails
                      console.log('Primary IPFS gateway failed, trying alternative...');
                      e.currentTarget.src = `https://ipfs.io/ipfs/${campaign.imageHash}`;
                      
                      // Add a second error handler for the fallback source
                      e.currentTarget.onerror = () => {
                        console.log('All IPFS gateways failed, using placeholder');
                        e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Campaign+Image';
                        // Remove the error handler to prevent infinite loops
                        e.currentTarget.onerror = null;
                      };
                    }}
                  />
                </div>
              ) : (
                <div className="mb-6 border rounded-lg bg-gray-100 h-64 flex items-center justify-center text-gray-400">
                  No image available for this campaign
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Funding</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Target Amount</p>
                      <p className="text-2xl font-bold">₹{campaign.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Submission Date</p>
                      <p className="text-lg">{new Date(campaign.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {campaign.type === "MEDICAL" && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Patient Details</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p className="flex justify-between">
                      <span className="font-medium">Patient Name:</span>
                      <span>{campaign.patientDetails.name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Age:</span>
                      <span>{campaign.patientDetails.age} years</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Medical Condition:</span>
                      <span>{campaign.patientDetails.condition}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Hospital:</span>
                      <span>{campaign.patientDetails.hospital}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Doctor:</span>
                      <span>{campaign.patientDetails.doctorName}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-medium">Scheduled Date:</span>
                      <span>{campaign.patientDetails.scheduledDate}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Link href="#documents">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    View Documents ({campaign.documents.length})
                  </Button>
                </Link>
                <Link href="#milestones">
                  <Button variant="outline" size="sm">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    View Milestones ({campaign.milestones.length})
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab Content */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Documents</CardTitle>
              <CardDescription>
                Review all documents submitted with this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-md">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type.toUpperCase()} · {doc.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // If doc has a hash and is an image type, show preview in a new tab
                          if (doc.hash && doc.type === 'image') {
                            window.open(getPublicIPFSUrl(doc.hash), '_blank');
                          } else {
                            toast({
                              title: "Preview not available",
                              description: "Document preview is not available or requires download",
                              variant: "default"
                            });
                          }
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Verification</CardTitle>
              <CardDescription>
                Verify the authenticity of campaign documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <h3 className="text-amber-800 font-semibold flex items-center">
                    <Info className="mr-2 h-4 w-4" />
                    Document Verification Checklist
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span className="text-sm">Verify that all necessary documents are provided</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span className="text-sm">Confirm authenticity of medical/official documents</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span className="text-sm">Check that organizer's identity documents match provided information</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span className="text-sm">Validate that cost estimates align with target amount</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span className="text-sm">Ensure all documents are legible and not expired</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones Tab Content */}
        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Milestones</CardTitle>
              <CardDescription>
                Review the funding milestones for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Total Target Amount</h3>
                    <p className="text-2xl font-bold">₹{campaign.targetAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Number of Milestones</h3>
                    <p className="text-2xl font-bold">{campaign.milestones.length}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {campaign.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                          <h3 className="font-semibold">{milestone.title}</h3>
                        </div>
                        <Badge variant={milestone.status === "PENDING" ? "secondary" : "default"}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">Milestone Amount</p>
                            <p className="text-lg font-bold">₹{milestone.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Percentage of Total</p>
                            <p className="text-lg font-bold">
                              {Math.round((milestone.amount / campaign.targetAmount) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Milestone Verification</h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Confirm milestone breakdown is reasonable for the campaign type</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Verify milestone amounts match supporting documents</span>
                    </li>
                    <li className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-2" />
                      <span>Check that milestone descriptions provide sufficient detail</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizer Tab Content */}
        <TabsContent value="organizer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organizer Information</CardTitle>
              <CardDescription>
                Details about the campaign organizer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{campaign.organizer.name}</h3>
                    <p className="text-sm text-muted-foreground">Campaign Organizer</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-base">{campaign.organizer.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Phone Number</p>
                    <p className="text-base">{campaign.organizer.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-base">{campaign.organizer.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Identity Verification</p>
                    <div className="flex items-center gap-2">
                      {campaign.organizer.identityProof.verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Pending Verification</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Identity Details</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-sm font-medium">ID Type:</span>
                      <span className="text-sm">{campaign.organizer.identityProof.type}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-sm font-medium">ID Number:</span>
                      <span className="text-sm">{campaign.organizer.identityProof.number}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Previous Campaigns
                  </Button>
                  <Button variant="outline" size="sm">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify Identity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab Content */}
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>
                Messages between admin and campaign organizer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  {campaign.comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`p-4 rounded-lg ${
                        comment.user === "Admin" 
                          ? "bg-muted ml-12" 
                          : "border border-muted-foreground/20 mr-12"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">{comment.user}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">New Message</h3>
                  <div className="space-y-4">
                    <textarea 
                      className="w-full h-24 p-2 border rounded-md" 
                      placeholder="Type your message to the campaign organizer..."
                    />
                    <Button className="w-full">
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 bg-muted p-6 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center">
              <Lock className="mr-2 h-4 w-4" />
              Campaign Verification Actions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Please review all information carefully before verifying or rejecting this campaign
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin/verifications")}
            >
              Return to Verifications
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowRejectionDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Campaign
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              onClick={() => setShowVerificationDialog(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

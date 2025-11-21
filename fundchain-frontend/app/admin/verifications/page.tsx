"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { allCampaigns } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  FileText,
  Search,
  Shield,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Alert,
  AlertDescription,
  AlertTitle
} from "lucide-react"
import { getPendingCampaigns, verifyCampaign, rejectCampaign } from "@/lib/admin-service"
import { formatCurrency } from "@/lib/currency"

// Mock data for organizations pending verification
const pendingOrganizations = [
  {
    id: "org1",
    name: "Hope Foundation",
    type: "NGO",
    email: "contact@hopefoundation.org",
    phone: "+91 9876543210",
    address: "123 Main Street, Mumbai, Maharashtra",
    documents: [
      { name: "Registration Certificate", url: "#" },
      { name: "Tax Exemption Certificate", url: "#" },
      { name: "Bank Statement", url: "#" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-15T10:00:00Z",
  },
  {
    id: "org2",
    name: "Shiva Temple Trust",
    type: "RELIGIOUS",
    email: "info@shivatemple.org",
    phone: "+91 9876543211",
    address: "456 Temple Road, Varanasi, Uttar Pradesh",
    documents: [
      { name: "Trust Registration", url: "#" },
      { name: "Temple Ownership Proof", url: "#" },
      { name: "Bank Statement", url: "#" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-16T14:30:00Z",
  },
  {
    id: "org3",
    name: "Rural Education Initiative",
    type: "NGO",
    email: "contact@ruraledu.org",
    phone: "+91 9876543212",
    address: "789 Village Road, Patna, Bihar",
    documents: [
      { name: "NGO Registration", url: "#" },
      { name: "Project Proposal", url: "#" },
      { name: "Bank Statement", url: "#" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-17T09:15:00Z",
  },
]

// Mock data for campaigns pending verification
const pendingCampaigns = [
  {
    id: "camp1",
    title: "Medical Treatment for Arun Kumar",
    type: "MEDICAL",
    organizer: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 9876543220",
    },
    targetAmount: 250000,
    description: "Urgent financial help needed for Arun Kumar's heart surgery at Apollo Hospital.",
    documents: [
      { name: "Medical Reports", url: "#" },
      { name: "Hospital Estimate", url: "#" },
      { name: "Identity Proof", url: "#" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-18T11:20:00Z",
  },
  {
    id: "camp2",
    title: "Renovation of Village School",
    type: "EDUCATION",
    organizer: {
      name: "Priya Singh",
      email: "priya@example.com",
      phone: "+91 9876543221",
    },
    targetAmount: 500000,
    description: "Fundraising for essential renovations of the primary school in Rajpur village.",
    documents: [
      { name: "School Registration", url: "#" },
      { name: "Renovation Plan", url: "#" },
      { name: "Cost Estimates", url: "#" },
      { name: "Photos of Current Condition", url: "#" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-19T09:45:00Z",
  },
  {
    id: "camp3",
    title: "Annual Temple Festival",
    type: "RELIGIOUS",
    organizer: {
      name: "Ganesh Iyer",
      email: "ganesh@example.com",
      phone: "+91 9876543222",
    },
    targetAmount: 150000,
    description: "Fundraising for the annual Ganesh Chaturthi celebrations at Shri Siddhivinayak Temple.",
    documents: [
      { name: "Temple Committee Approval", url: "#" },
      { name: "Previous Year's Report", url: "#" },
      { name: "Festival Plan", url: "#" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-20T14:30:00Z",
  },
]

export default function AdminVerificationsPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("organizations")
  const [orgSearchQuery, setOrgSearchQuery] = useState("")
  const [orgTypeFilter, setOrgTypeFilter] = useState<string>("all")
  const [organizations, setOrganizations] = useState(pendingOrganizations)

  const [campSearchQuery, setCampSearchQuery] = useState("")
  const [campTypeFilter, setCampTypeFilter] = useState<string>("all")
  const [campaigns, setCampaigns] = useState(pendingCampaigns)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/admin/verifications")
    } else if (!isAdmin) {
      router.push("/dashboard")
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      })
    }
  }, [user, isAdmin, router, toast])

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const pendingCampaigns = await getPendingCampaigns()
      setCampaigns(pendingCampaigns)
    } catch (err) {
      console.error("Error loading campaigns:", err)
      setError("Failed to load pending campaigns")
    } finally {
      setLoading(false)
    }
  }

  if (!user || !isAdmin) {
    return null
  }

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
      org.address.toLowerCase().includes(orgSearchQuery.toLowerCase())

    const matchesType = orgTypeFilter === "all" || org.type === orgTypeFilter

    return matchesSearch && matchesType
  })

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(campSearchQuery.toLowerCase()) ||
      campaign.organizer.name.toLowerCase().includes(campSearchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(campSearchQuery.toLowerCase())

    const matchesType = campTypeFilter === "all" || campaign.type === campTypeFilter

    return matchesSearch && matchesType
  })

  const handleVerifyOrganization = (id: string) => {
    setOrganizations(organizations.filter((org) => org.id !== id))
    toast({
      title: "Organization Verified",
      description: "The organization has been verified successfully",
    })
  }

  const handleRejectOrganization = (id: string) => {
    setOrganizations(organizations.filter((org) => org.id !== id))
    toast({
      title: "Organization Rejected",
      description: "The organization has been rejected",
      variant: "destructive",
    })
  }

  const handleVerifyCampaign = async (id: string) => {
    try {
      await verifyCampaign(id)
      // Reload campaigns after verification
      loadCampaigns()
      toast({
        title: "Campaign Verified",
        description: "The campaign has been verified and published successfully",
      })
    } catch (err) {
      console.error("Error verifying campaign:", err)
      setError("Failed to verify campaign")
    }
  }

  const handleRejectCampaign = async (id: string) => {
    try {
      const reason = prompt("Please provide a reason for rejection:")
      if (reason === null) return

      await rejectCampaign(id, reason)
      // Reload campaigns after rejection
      loadCampaigns()
      toast({
        title: "Campaign Rejected",
        description: "The campaign has been rejected",
        variant: "destructive",
      })
    } catch (err) {
      console.error("Error rejecting campaign:", err)
      setError("Failed to reject campaign")
    }
  }

  const getCampaignTypeLabel = (type: string) => {
    const types = {
      'MEDICAL': 'Medical',
      'RELIGIOUS': 'Religious',
      'NGO': 'NGO',
      'GOVERNMENT': 'Government',
      'EDUCATION': 'Education'
    }
    return types[type] || type
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Verification Dashboard</h1>
          <p className="text-muted-foreground">Review and verify organizations and campaigns</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-2 py-1 text-sm">
            <AlertCircle className="mr-1 h-3 w-3" />
            {organizations.length} Pending Organizations
          </Badge>
          <Badge variant="outline" className="px-2 py-1 text-sm">
            <AlertCircle className="mr-1 h-3 w-3" />
            {campaigns.length} Pending Campaigns
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="organizations">
            <Users className="mr-2 h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Calendar className="mr-2 h-4 w-4" />
            Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search organizations..."
                className="pl-8"
                value={orgSearchQuery}
                onChange={(e) => setOrgSearchQuery(e.target.value)}
              />
            </div>
            <Select value={orgTypeFilter} onValueChange={setOrgTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="NGO">NGO</SelectItem>
                <SelectItem value="RELIGIOUS">Religious</SelectItem>
                <SelectItem value="GOVERNMENT">Government</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOrganizations.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredOrganizations.map((org) => (
                <Card key={org.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">{org.name}</h3>
                          <Badge variant="secondary">{org.status}</Badge>
                          <Badge variant="outline">{org.type}</Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>Email: {org.email}</p>
                          <p>Phone: {org.phone}</p>
                          <p>Address: {org.address}</p>
                          <p>Submitted: {new Date(org.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Documents</h4>
                          <div className="flex flex-wrap gap-2">
                            {org.documents.map((doc, index) => (
                              <Link key={index} href={doc.url}>
                                <Button variant="outline" size="sm">
                                  <FileText className="mr-2 h-4 w-4" />
                                  {doc.name}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 justify-center">
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={() => handleVerifyOrganization(org.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify Organization
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleRejectOrganization(org.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No pending organization verifications</CardTitle>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search campaigns..."
                className="pl-8"
                value={campSearchQuery}
                onChange={(e) => setCampSearchQuery(e.target.value)}
              />
            </div>
            <Select value={campTypeFilter} onValueChange={setCampTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MEDICAL">Medical</SelectItem>
                <SelectItem value="RELIGIOUS">Religious</SelectItem>
                <SelectItem value="EDUCATION">Education</SelectItem>
                <SelectItem value="NGO">NGO</SelectItem>
                <SelectItem value="GOVERNMENT">Government</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <p>Loading campaigns...</p>
          ) : filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No pending campaigns found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold">{campaign.title}</h2>
                          <Badge className="uppercase">{getCampaignTypeLabel(campaign.type)}</Badge>
                          <Badge variant="outline">PENDING</Badge>
                        </div>
                        <p className="text-muted-foreground">{campaign.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(`/campaigns/${campaign.id}?tab=documents`, '_blank')}>
                          <Eye className="mr-1 h-4 w-4" /> View Full Details
                        </Button>
                        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleVerifyCampaign(campaign.id)}>
                          <CheckCircle className="mr-1 h-4 w-4" /> Verify & Publish
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleRejectCampaign(campaign.id)}>
                          <XCircle className="mr-1 h-4 w-4" /> Reject Campaign
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Organizer: {campaign.organizer?.name || "Unknown"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Target: {formatCurrency(campaign.targetAmountInr)} ({campaign.targetAmount} ETH)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Submitted: {formatDate(campaign.submittedAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Documents: {campaign.documentHashes?.length || 0} file(s)
                        </span>
                      </div>
                    </div>

                    {campaign.milestones && campaign.milestones.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Milestones</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {campaign.milestones.slice(0, 4).map((milestone, idx) => (
                            <div key={idx} className="text-xs border rounded p-2">
                              <div className="font-medium">{milestone.title}</div>
                              <div className="text-muted-foreground">
                                {milestone.amount} ETH
                              </div>
                            </div>
                          ))}
                          {campaign.milestones.length > 4 && (
                            <div className="text-xs text-muted-foreground p-2">
                              +{campaign.milestones.length - 4} more milestones
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {campaign.imageHash && (
                    <div className="border-t flex justify-center p-4 bg-gray-50">
                      <img
                        src={`https://ipfs.io/ipfs/${campaign.imageHash}`}
                        alt={campaign.title}
                        className="h-40 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available'
                        }}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 
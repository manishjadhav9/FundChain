"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { Search, Plus, Users, DollarSign, Target, TrendingUp, AlertCircle, CheckCircle, XCircle, BarChart3, Settings, FileText, Bell, Building2, Globe, Mail, Phone, MapPin, Calendar, Award, Shield } from "lucide-react"

// Mock data for NGO dashboard
const mockNgoData = {
  name: "Rural Education Foundation",
  logo: "/placeholder.svg",
  verificationStatus: "verified",
  registrationNumber: "NGO123456",
  establishedYear: 2010,
  mission: "Empowering rural communities through education and sustainable development",
  contact: {
    email: "contact@ruraleducation.org",
    phone: "+91 9876543210",
    address: "123 Education Street, Mumbai, Maharashtra",
    website: "www.ruraleducation.org",
  },
  impact: {
    beneficiaries: 5000,
    villages: 25,
    states: 3,
    years: 14,
  },
  stats: {
    totalCampaigns: 15,
    activeCampaigns: 5,
    completedCampaigns: 10,
    totalDonations: 2500000,
    totalDonors: 500,
    successRate: 92,
  },
  monthlyStats: {
    donations: 250000,
    newDonors: 45,
    activeCampaigns: 5,
    completionRate: 88,
  },
  recentDonations: [
    {
      id: "1",
      donorName: "John Doe",
      amount: 5000,
      campaign: "Help Build a School in Rural India",
      date: "2024-03-15",
      status: "completed",
    },
    {
      id: "2",
      donorName: "Jane Smith",
      amount: 10000,
      campaign: "Medical Aid for Cancer Patients",
      date: "2024-03-10",
      status: "completed",
    },
  ],
  campaigns: [
    {
      id: "1",
      title: "Help Build a School in Rural India",
      image: "/placeholder.svg",
      target: 1000000,
      raised: 750000,
      donors: 120,
      status: "active",
      endDate: "2024-06-30",
      category: "Education",
      location: "Rural Maharashtra",
      impact: "Will provide education to 200 children",
    },
    {
      id: "2",
      title: "Medical Aid for Cancer Patients",
      image: "/placeholder.svg",
      target: 500000,
      raised: 225000,
      donors: 45,
      status: "active",
      endDate: "2024-05-15",
      category: "Healthcare",
      location: "Mumbai",
      impact: "Will support 50 cancer patients",
    },
    {
      id: "3",
      title: "Disaster Relief Fund",
      image: "/placeholder.svg",
      target: 200000,
      raised: 180000,
      donors: 30,
      status: "completed",
      endDate: "2024-03-01",
      category: "Disaster Relief",
      location: "Kerala",
      impact: "Helped 100 families recover",
    },
  ],
  achievements: [
    {
      id: "1",
      title: "Best NGO Award 2023",
      description: "Recognized for outstanding contribution to rural education",
      date: "2023-12-15",
    },
    {
      id: "2",
      title: "100% Transparency Rating",
      description: "Achieved highest transparency rating for 3 consecutive years",
      date: "2023-11-01",
    },
  ],
  notifications: [
    {
      id: "1",
      type: "donation",
      message: "New donation of ₹5,000 received",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "campaign",
      message: "Campaign 'Medical Aid' reached 50% of its target",
      time: "1 day ago",
      read: true,
    },
  ],
}

export default function NgoDashboardPage() {
  const router = useRouter()
  const { user, isNgo } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ngoData, setNgoData] = useState(mockNgoData)
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect if not logged in or not an NGO
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/dashboard/ngo")
    } else if (!isNgo) {
      router.push("/dashboard")
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the NGO dashboard",
        variant: "destructive",
      })
    }
  }, [user, isNgo, router, toast])

  if (!user || !isNgo) {
    return null
  }

  const filteredCampaigns = ngoData.campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container py-8">
      {/* Organization Profile Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white">
            <Image
              src={ngoData.logo}
              alt={ngoData.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{ngoData.name}</h1>
              <Badge variant={ngoData.verificationStatus === "verified" ? "success" : "warning"}>
                {ngoData.verificationStatus}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4">{ngoData.mission}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Est. {ngoData.establishedYear}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Reg. {ngoData.registrationNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{ngoData.contact.website}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Link href="/campaigns/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ngoData.impact.beneficiaries.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">People helped</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Villages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ngoData.impact.villages}</div>
                <p className="text-xs text-muted-foreground mt-1">Communities served</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">States</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ngoData.impact.states}</div>
                <p className="text-xs text-muted-foreground mt-1">Geographic reach</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Years Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ngoData.impact.years}</div>
                <p className="text-xs text-muted-foreground mt-1">Since {ngoData.establishedYear}</p>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{ngoData.stats.totalDonations.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ngoData.stats.activeCampaigns}</div>
                <p className="text-xs text-muted-foreground mt-1">Out of {ngoData.stats.totalCampaigns} total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ngoData.stats.totalDonors}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique contributors</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ngoData.stats.successRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">Campaign completion</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>This month's achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Donations</p>
                    <p className="text-2xl font-bold">₹{ngoData.monthlyStats.donations.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">New Donors</p>
                    <p className="text-2xl font-bold">+{ngoData.monthlyStats.newDonors}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">{ngoData.monthlyStats.activeCampaigns}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{ngoData.monthlyStats.completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Recognition</CardTitle>
                <CardDescription>Recent awards and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ngoData.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted">
                      <Award className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search campaigns..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6">
                    <div className="relative h-40 w-full rounded-md overflow-hidden">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{campaign.title}</h3>
                        <Badge variant={campaign.status === "active" ? "success" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              ₹{campaign.raised.toLocaleString()} / ₹{campaign.target.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={(campaign.raised / campaign.target) * 100} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Category</p>
                            <p className="font-medium">{campaign.category}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{campaign.location}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Impact</p>
                          <p className="font-medium">{campaign.impact}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 justify-center">
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button variant="outline" className="w-full">
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Latest contributions to your campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ngoData.recentDonations.map((donation) => (
                  <Card key={donation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{donation.donorName}</p>
                          <p className="text-sm text-muted-foreground">{donation.campaign}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{donation.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{donation.date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Impact Report</CardTitle>
              <CardDescription>Detailed impact metrics and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Impact Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're working on detailed impact reporting and visualization features
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Manage your NGO profile and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{ngoData.contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{ngoData.contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{ngoData.contact.address}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-4">Organization Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>Established: {ngoData.establishedYear}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>Registration: {ngoData.registrationNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{ngoData.contact.website}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
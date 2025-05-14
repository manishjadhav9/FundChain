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
import { Search, Plus, Users, DollarSign, Target, TrendingUp, AlertCircle, CheckCircle, XCircle, BarChart3, Settings, FileText, Bell } from "lucide-react"

// Mock data for NGO dashboard
const mockNgoData = {
  name: "Rural Education Foundation",
  verificationStatus: "verified",
  totalCampaigns: 5,
  activeCampaigns: 3,
  totalDonations: 750000,
  totalDonors: 150,
  monthlyStats: {
    donations: 150000,
    newDonors: 25,
    activeCampaigns: 3,
    completionRate: 85,
  },
  recentDonations: [
    {
      id: "1",
      donorName: "Manish Jadhav",
      amount: 5000,
      campaign: "Help Build a School in Rural India",
      date: "2024-03-15",
      status: "completed",
    },
    {
      id: "2",
      donorName: "Manish Jadhav",
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
      router.push("/auth/login?redirect=/ngo-dashboard")
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">NGO Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {ngoData.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Link href="/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Campaign
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{ngoData.totalDonations.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ngoData.activeCampaigns}</div>
                <p className="text-xs text-muted-foreground mt-1">Out of {ngoData.totalCampaigns} total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ngoData.totalDonors}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique contributors</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={ngoData.verificationStatus === "verified" ? "success" : "warning"}>
                    {ngoData.verificationStatus}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Organization status</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Statistics</CardTitle>
                <CardDescription>Performance overview for this month</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Latest updates and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ngoData.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-3 rounded-lg ${
                        !notification.read ? "bg-muted" : ""
                      }`}
                    >
                      <div className="mt-1">
                        {notification.type === "donation" ? (
                          <DollarSign className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
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

        <TabsContent value="analytics" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>Detailed performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're working on detailed analytics and reporting features
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
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Settings Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're working on organization settings and profile management
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
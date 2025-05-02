"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { allCampaigns } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle, Clock, FileText, Search, Shield, Users, XCircle } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [campaigns, setCampaigns] = useState(allCampaigns)

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/admin")
    } else if (!isAdmin) {
      router.push("/dashboard")
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      })
    }
  }, [user, isAdmin, router, toast])

  if (!user || !isAdmin) {
    return null
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesType = typeFilter === "all" || campaign.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleVerifyCampaign = (id: string) => {
    setCampaigns(
      campaigns.map((campaign) => (campaign.id === id ? { ...campaign, status: "VERIFIED" as const } : campaign)),
    )

    toast({
      title: "Campaign Verified",
      description: "The campaign has been verified successfully",
    })
  }

  const handleCloseCampaign = (id: string) => {
    setCampaigns(
      campaigns.map((campaign) => (campaign.id === id ? { ...campaign, status: "CLOSED" as const } : campaign)),
    )

    toast({
      title: "Campaign Closed",
      description: "The campaign has been closed successfully",
    })
  }

  const pendingCampaigns = filteredCampaigns.filter((c) => c.status === "OPEN")
  const verifiedCampaigns = filteredCampaigns.filter((c) => c.status === "VERIFIED")
  const closedCampaigns = filteredCampaigns.filter((c) => c.status === "CLOSED")

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage campaigns, verify organizations, and monitor platform activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCampaigns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Campaigns awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{verifiedCampaigns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified and running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Funds Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{campaigns.reduce((sum, campaign) => sum + campaign.amountRaised, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4 mb-8">
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
            <SelectItem value="OPEN">Pending</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="MEDICAL">Medical</SelectItem>
            <SelectItem value="RELIGIOUS">Religious</SelectItem>
            <SelectItem value="NGO">NGO</SelectItem>
            <SelectItem value="GOVERNMENT">Government</SelectItem>
            <SelectItem value="EDUCATION">Education</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex gap-2">
            <Clock className="h-4 w-4" /> Pending
            <Badge variant="secondary" className="ml-1">
              {pendingCampaigns.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex gap-2">
            <CheckCircle className="h-4 w-4" /> Verified
            <Badge variant="secondary" className="ml-1">
              {verifiedCampaigns.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex gap-2">
            <XCircle className="h-4 w-4" /> Closed
            <Badge variant="secondary" className="ml-1">
              {closedCampaigns.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {pendingCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {pendingCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6">
                      <div className="relative h-40 w-full rounded-md overflow-hidden">
                        <Image
                          src={campaign.image || "/placeholder.svg?height=200&width=200"}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">{campaign.title}</h3>
                          <Badge variant="secondary">{campaign.status}</Badge>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Organizer: {campaign.organizer.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <span>Target: ₹{campaign.targetAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 justify-center">
                        <Button
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => handleVerifyCampaign(campaign.id)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Verify Campaign
                        </Button>
                        <Link href={`/admin/campaigns/${campaign.id}`}>
                          <Button variant="outline" className="w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full">
                          Contact Organizer
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
                <CardTitle>No Pending Campaigns</CardTitle>
                <CardDescription>There are no campaigns awaiting verification at this time.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-6">
          {verifiedCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {verifiedCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6">
                      <div className="relative h-40 w-full rounded-md overflow-hidden">
                        <Image
                          src={campaign.image || "/placeholder.svg?height=200&width=200"}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">{campaign.title}</h3>
                          <Badge>{campaign.status}</Badge>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Organizer: {campaign.organizer.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Raised: ₹{campaign.amountRaised.toLocaleString()} of ₹
                              {campaign.targetAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 justify-center">
                        <Button variant="destructive" onClick={() => handleCloseCampaign(campaign.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Close Campaign
                        </Button>
                        <Link href={`/admin/campaigns/${campaign.id}`}>
                          <Button variant="outline" className="w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full">
                          Contact Organizer
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
                <CardTitle>No Verified Campaigns</CardTitle>
                <CardDescription>There are no verified campaigns at this time.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-6">
          {closedCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {closedCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6">
                      <div className="relative h-40 w-full rounded-md overflow-hidden">
                        <Image
                          src={campaign.image || "/placeholder.svg?height=200&width=200"}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">{campaign.title}</h3>
                          <Badge variant="secondary">{campaign.status}</Badge>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Organizer: {campaign.organizer.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Final: ₹{campaign.amountRaised.toLocaleString()} of ₹
                              {campaign.targetAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 justify-center">
                        <Link href={`/admin/campaigns/${campaign.id}`}>
                          <Button variant="outline" className="w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full">
                          Download Report
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
                <CardTitle>No Closed Campaigns</CardTitle>
                <CardDescription>There are no closed campaigns at this time.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Overview of platform performance and user activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">1,245</p>
                <p className="text-xs text-green-500">↑ 12% from last month</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">New Campaigns</p>
                <p className="text-2xl font-bold">28</p>
                <p className="text-xs text-green-500">↑ 8% from last month</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Donations</p>
                <p className="text-2xl font-bold">3,872</p>
                <p className="text-xs text-green-500">↑ 15% from last month</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg. Donation</p>
                <p className="text-2xl font-bold">₹2,450</p>
                <p className="text-xs text-red-500">↓ 3% from last month</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Campaign Distribution by Type</h3>
              <div className="h-64 w-full bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Chart visualization would appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

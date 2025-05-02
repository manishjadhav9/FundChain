"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { allCampaigns } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, FileText, Search, Shield, Users } from "lucide-react"

export default function AdminCampaignsPage() {
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
      router.push("/auth/login?redirect=/admin/campaigns")
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

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaign Management</h1>
          <p className="text-muted-foreground">View and manage all fundraising campaigns</p>
        </div>
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
            <SelectItem value="OPEN">Open</SelectItem>
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

      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredCampaigns.map((campaign) => (
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
                          Raised: ₹{campaign.amountRaised.toLocaleString()} of ₹
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
                    {campaign.status === "OPEN" && (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleVerifyCampaign(campaign.id)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Verify Campaign
                      </Button>
                    )}
                    {campaign.status === "VERIFIED" && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleCloseCampaign(campaign.id)}
                      >
                        Close Campaign
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No campaigns found</CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  )
} 
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
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { Search, Heart, Calendar, Download, FileText, ArrowRight, Filter } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data for donations
const mockDonations = [
  {
    id: "1",
    campaignId: "1",
    campaignTitle: "Help Build a School in Rural India",
    campaignImage: "/placeholder.svg",
    amount: 5000,
    date: "2024-03-15",
    status: "completed",
    receipt: "#",
    campaignProgress: 75,
    campaignTarget: 100000,
    campaignRaised: 75000,
  },
  {
    id: "2",
    campaignId: "2",
    campaignTitle: "Medical Aid for Cancer Patients",
    campaignImage: "/placeholder.svg",
    amount: 10000,
    date: "2024-03-10",
    status: "completed",
    receipt: "#",
    campaignProgress: 45,
    campaignTarget: 500000,
    campaignRaised: 225000,
  },
  {
    id: "3",
    campaignId: "3",
    campaignTitle: "Disaster Relief Fund",
    campaignImage: "/placeholder.svg",
    amount: 2500,
    date: "2024-03-05",
    status: "completed",
    receipt: "#",
    campaignProgress: 90,
    campaignTarget: 200000,
    campaignRaised: 180000,
  },
]

export default function DonationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [donations, setDonations] = useState(mockDonations)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/donations")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch = donation.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || donation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0)

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Donations</h1>
          <p className="text-muted-foreground">Track your contributions and impact</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalDonated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{donations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Campaigns supported</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{donations[0]?.amount.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {donations[0]?.date || "No donations yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-8">
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
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filteredDonations.map((donation) => (
          <Card key={donation.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6">
                <div className="relative h-40 w-full rounded-md overflow-hidden">
                  <Image
                    src={donation.campaignImage}
                    alt={donation.campaignTitle}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{donation.campaignTitle}</h3>
                    <Badge variant="secondary">{donation.status}</Badge>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Campaign Progress</span>
                        <span className="font-medium">{donation.campaignProgress}%</span>
                      </div>
                      <Progress value={donation.campaignProgress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Your Donation</p>
                        <p className="font-medium">₹{donation.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{donation.date}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center">
                  <Link href={`/campaigns/${donation.campaignId}`}>
                    <Button variant="outline" className="w-full">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      View Campaign
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDonations.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Donations Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "No donations match your search criteria"
                    : "You haven't made any donations yet"}
                </p>
                <Link href="/campaigns">
                  <Button>
                    <Heart className="mr-2 h-4 w-4" />
                    Explore Campaigns
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { allCampaigns, userDonations } from "@/lib/data"
import { ArrowRight, Plus, TrendingUp, Users, Heart, Award, Calendar } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isNGO } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/dashboard")
    } else if (isNGO) {
      router.replace("/dashboard/ngo")
    }
  }, [user, isNGO, router])

  if (!user || isNGO) {
    return null
  }

  // Calculate analytics
  const totalDonated = userDonations.reduce((sum, donation) => sum + donation.amount, 0)
  const campaignsSupported = new Set(userDonations.map(d => d.campaignId)).size
  const averageDonation = totalDonated / userDonations.length
  const lastDonation = userDonations[0] // Most recent donation

  // Get top causes based on donation amount
  const causeDonations = userDonations.reduce((acc, donation) => {
    const campaign = allCampaigns.find(c => c.id === donation.campaignId)
    if (campaign) {
      acc[campaign.type] = (acc[campaign.type] || 0) + donation.amount
    }
    return acc
  }, {} as Record<string, number>)

  const topCause = Object.entries(causeDonations)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "None"

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Donor Dashboard</h1>
          <p className="text-muted-foreground">Track your impact and manage your donations</p>
        </div>
        <Link href="/campaigns">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Find Campaigns
          </Button>
        </Link>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalDonated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime contributions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Supported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaignsSupported}</div>
            <p className="text-xs text-muted-foreground mt-1">Active campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{Math.round(averageDonation).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Per campaign</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Cause</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">{topCause}</div>
            <p className="text-xs text-muted-foreground mt-1">Most supported category</p>
          </CardContent>
        </Card>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Impact Score</CardTitle>
            <CardDescription>Your contribution impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">92</div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={92} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">Top 10% of donors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Community Impact</CardTitle>
            <CardDescription>People helped through your donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">1,250+</div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Across all campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Donation Streak</CardTitle>
            <CardDescription>Consistent giving</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">3</div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Months of active giving</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your latest contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userDonations.slice(0, 3).map((donation) => (
                <div key={donation.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      <img
                        src={donation.campaign.image || "/placeholder.svg"}
                        alt={donation.campaign.title}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{donation.campaign.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{donation.amount.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">
                      {donation.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/donations" className="w-full">
              <Button variant="outline" className="w-full">
                View All Donations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>Campaigns you're supporting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allCampaigns
                .filter((campaign) => userDonations.some((d) => d.campaignId === campaign.id))
                .slice(0, 3)
                .map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={campaign.image || "/placeholder.svg"}
                          alt={campaign.title}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{campaign.title}</p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(campaign.amountRaised / campaign.targetAmount) * 100}
                            className="w-24 h-2"
                          />
                          <span className="text-sm text-muted-foreground">
                            {Math.round((campaign.amountRaised / campaign.targetAmount) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{campaign.status}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/campaigns" className="w-full">
              <Button variant="outline" className="w-full">
                Browse More Campaigns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

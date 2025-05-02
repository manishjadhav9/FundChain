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
import { ArrowRight, Plus } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/dashboard")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  // Mock user campaigns (in a real app, these would be filtered from the database)
  const userCampaigns = allCampaigns.slice(0, 2)

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}! Manage your campaigns and donations.</p>
        </div>
        <Link href="/campaigns/create">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Start a Campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCampaigns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userCampaigns.length === 0
                ? "No campaigns yet"
                : userCampaigns.length === 1
                  ? "1 active campaign"
                  : `${userCampaigns.length} active campaigns`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userDonations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {new Set(userDonations.map((d) => d.campaignId)).size} campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Amount Donated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{userDonations.reduce((sum, donation) => sum + donation.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Thank you for your generosity!</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
          <TabsTrigger value="donations">My Donations</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {userCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {userCampaigns.map((campaign) => {
                const percentRaised = Math.min(Math.round((campaign.amountRaised / campaign.targetAmount) * 100), 100)

                return (
                  <Card key={campaign.id}>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold">{campaign.title}</h3>
                            <Badge variant={campaign.status === "VERIFIED" ? "default" : "secondary"}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>₹{campaign.amountRaised.toLocaleString()}</span>
                              <span className="text-muted-foreground">
                                of ₹{campaign.targetAmount.toLocaleString()}
                              </span>
                            </div>
                            <Progress value={percentRaised} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{percentRaised}% Raised</span>
                              <span>{campaign.donorsCount} Donors</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/campaigns/${campaign.id}`}>
                              <Button variant="outline" size="sm">
                                View Campaign
                              </Button>
                            </Link>
                            <Link href={`/campaigns/${campaign.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Milestones</h4>
                          <div className="space-y-2">
                            {campaign.milestones.map((milestone, index) => (
                              <div key={milestone.id} className="flex items-center gap-2">
                                <div
                                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                    milestone.isCompleted
                                      ? "bg-primary/20 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium line-clamp-1">{milestone.title}</p>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      ₹{milestone.targetAmount.toLocaleString()}
                                    </span>
                                    <span className={milestone.isCompleted ? "text-primary" : "text-muted-foreground"}>
                                      {milestone.isCompleted ? "Completed" : "Pending"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Campaigns Yet</CardTitle>
                <CardDescription>You haven't created any fundraising campaigns yet.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/campaigns/create">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Start Your First Campaign
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}

          {userCampaigns.length > 0 && (
            <div className="flex justify-center">
              <Link href="/campaigns/create">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Start a New Campaign
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="donations" className="space-y-6">
          {userDonations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {userDonations.map((donation) => (
                <Card key={donation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{donation.campaign.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(donation.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{donation.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="mt-1">
                          {donation.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Link href={`/campaigns/${donation.campaignId}`}>
                        <Button variant="ghost" size="sm">
                          View Campaign
                        </Button>
                      </Link>
                      <Link href={`/donations/${donation.id}/receipt`}>
                        <Button variant="outline" size="sm">
                          View Receipt
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Donations Yet</CardTitle>
                <CardDescription>You haven't made any donations yet.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/campaigns">
                  <Button className="bg-primary hover:bg-primary/90">
                    Browse Campaigns <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

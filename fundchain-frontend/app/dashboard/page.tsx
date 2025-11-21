"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { allCampaigns, userDonations } from "@/lib/data"
import { ArrowRight, Plus, TrendingUp, Users, Heart, Award, Calendar, DollarSign, Activity } from "lucide-react"

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl mb-10">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80"
            alt="Background"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border-blue-500/50">
              Welcome Back, {user.name.split(' ')[0]}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Your Impact is <span className="text-blue-400">Changing Lives</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-xl">
              Track your contributions, manage your donations, and see the difference you're making in the world.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/campaigns">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                  <Plus className="mr-2 h-5 w-5" /> Explore Campaigns
                </Button>
              </Link>
              <Link href="/redeem">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Redeem Points
                </Button>
              </Link>
            </div>
          </div>

          <Card className="w-full md:w-80 bg-white/10 backdrop-blur-md border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" /> Impact Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-bold">92</span>
                <span className="text-sm text-green-400 mb-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> +5 this month
                </span>
              </div>
              <Progress value={92} className="h-2 bg-white/20" indicatorClassName="bg-yellow-400" />
              <p className="text-xs text-slate-300 mt-3">
                You're in the top <span className="font-bold text-white">10%</span> of donors!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Donated
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalDonated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime contributions</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Campaigns Supported
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaignsSupported}</div>
            <p className="text-xs text-muted-foreground mt-1">Active campaigns</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              People Helped
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,250+</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated impact</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Top Cause
              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize truncate" title={topCause}>{topCause}</div>
            <p className="text-xs text-muted-foreground mt-1">Most supported category</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity - Takes up 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Link href="/donations" className="text-sm text-blue-600 hover:underline font-medium">
              View All History
            </Link>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y">
                {userDonations.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={donation.campaign.image || "/placeholder.svg"}
                          alt={donation.campaign.title}
                          className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{donation.campaign.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-slate-100">₹{donation.amount.toLocaleString()}</p>
                      <Badge variant={donation.status === 'Completed' ? 'default' : 'secondary'} className="text-[10px] h-5">
                        {donation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Campaigns Sidebar - Takes up 1 column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Campaigns</h2>
          </div>

          <div className="space-y-4">
            {allCampaigns
              .filter((campaign) => userDonations.some((d) => d.campaignId === campaign.id))
              .slice(0, 3)
              .map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={campaign.image || "/placeholder.svg"}
                      alt={campaign.title}
                      className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="font-semibold truncate">{campaign.title}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Raised</span>
                        <span className="font-medium">₹{campaign.amountRaised.toLocaleString()}</span>
                      </div>
                      <Progress
                        value={(campaign.amountRaised / campaign.targetAmount) * 100}
                        className="h-1.5"
                      />
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs text-muted-foreground">
                          {Math.round((campaign.amountRaised / campaign.targetAmount) * 100)}% Funded
                        </span>
                        <Link href={`/campaigns/${campaign.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-blue-50 hover:text-blue-600">
                            View <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 border-dashed">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">Support More Causes</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Find new campaigns that align with your values.
                  </p>
                </div>
                <Link href="/campaigns" className="w-full">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Browse Campaigns
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

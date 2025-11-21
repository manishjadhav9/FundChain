"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { Search, Heart, Calendar, Download, FileText, ArrowRight, Filter, DollarSign, Activity, CheckCircle2 } from "lucide-react"
import { userDonations as importedDonations, allCampaigns } from "@/lib/data"

export default function DonationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Transform imported donations to include campaign details
  const donations = importedDonations.map(donation => {
    const campaign = allCampaigns.find(c => c.id === donation.campaignId)
    return {
      id: donation.id,
      campaignId: donation.campaignId,
      campaignTitle: donation.campaign.title,
      campaignImage: donation.campaign.image,
      amount: donation.amount,
      date: new Date(donation.createdAt).toISOString().split('T')[0],
      status: donation.status.toLowerCase(),
      transactionId: donation.transactionId,
      campaignProgress: campaign ? Math.round((campaign.amountRaised / campaign.targetAmount) * 100) : 0,
      campaignTarget: campaign?.targetAmount || 0,
      campaignRaised: campaign?.amountRaised || 0,
    }
  })


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

  const handleDownloadReceipt = (donation: typeof mockDonations[0]) => {
    // Create a receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Donation Receipt - ${donation.transactionId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #3b82f6; margin: 0; }
            .receipt-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #64748b; }
            .value { color: #0f172a; }
            .amount { font-size: 24px; font-weight: bold; color: #3b82f6; text-align: center; padding: 20px; background: #eff6ff; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 14px; }
            .thank-you { text-align: center; color: #3b82f6; font-size: 18px; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌟 FundChain</h1>
            <p>Blockchain-Powered Crowdfunding</p>
          </div>
          
          <div class="thank-you">
            <strong>Thank you for your generous donation!</strong>
          </div>
          
          <div class="receipt-info">
            <div class="info-row">
              <span class="label">Receipt Number:</span>
              <span class="value">${donation.transactionId}</span>
            </div>
            <div class="info-row">
              <span class="label">Donor Name:</span>
              <span class="value">${user.name}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="info-row">
              <span class="label">Campaign:</span>
              <span class="value">${donation.campaignTitle}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value" style="color: #10b981; text-transform: capitalize;">${donation.status}</span>
            </div>
          </div>
          
          <div class="amount">
            Donation Amount: ₹${donation.amount.toLocaleString()}
          </div>
          
          <div class="receipt-info">
            <div class="info-row">
              <span class="label">Campaign Target:</span>
              <span class="value">₹${donation.campaignTarget.toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="label">Amount Raised:</span>
              <span class="value">₹${donation.campaignRaised.toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="label">Progress:</span>
              <span class="value">${donation.campaignProgress}%</span>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an official receipt for your donation to FundChain.</p>
            <p>For any queries, please contact support@fundchain.org</p>
            <p style="margin-top: 20px;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </body>
      </html>
    `

    // Open print dialog with the receipt
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(receiptHTML)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()

      toast({
        title: "Receipt Ready",
        description: "Your receipt is ready to download or print.",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl mb-10">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&q=80"
            alt="Background"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-12">
          <div className="max-w-2xl">
            <Badge className="bg-green-500/20 text-green-200 hover:bg-green-500/30 border-green-500/50 mb-4">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Donation History
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Your <span className="text-green-400">Generosity</span> in Action
            </h1>
            <p className="text-slate-300 text-lg">
              Track all your contributions and see the impact you've made across campaigns.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
            <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
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
            <div className="text-3xl font-bold">{donations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total contributions</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Last Donation
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{donations[0]?.amount.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {donations[0]?.date ? new Date(donations[0].date).toLocaleDateString() : "No donations yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search campaigns..."
            className="pl-10"
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

      {/* Donations List */}
      <div className="space-y-6">
        {filteredDonations.map((donation) => (
          <Card key={donation.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-0">
                {/* Campaign Image */}
                <div className="relative h-48 md:h-auto w-full overflow-hidden">
                  <img
                    src={donation.campaignImage}
                    alt={donation.campaignTitle}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                      {donation.status}
                    </Badge>
                  </div>
                </div>

                {/* Campaign Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{donation.campaignTitle}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {donation.transactionId}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Campaign Progress</span>
                      <span className="font-medium">{donation.campaignProgress}%</span>
                    </div>
                    <Progress value={donation.campaignProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹{donation.campaignRaised.toLocaleString()} raised</span>
                      <span>₹{donation.campaignTarget.toLocaleString()} goal</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground">Your Contribution:</span>
                      <span className="text-2xl font-bold text-green-600">₹{donation.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 p-6 bg-slate-50 dark:bg-slate-900/50 justify-center min-w-[200px]">
                  <Link href={`/campaigns/${donation.campaignId}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      View Campaign
                    </Button>
                  </Link>
                  <Button
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleDownloadReceipt(donation)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDonations.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Donations Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? "No donations match your search criteria. Try adjusting your filters."
                    : "You haven't made any donations yet. Start making a difference today!"}
                </p>
                <Link href="/campaigns">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Heart className="mr-2 h-5 w-5" />
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
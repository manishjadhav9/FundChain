"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { allCampaigns } from "@/lib/data"
import { CheckCircle, Download, Share2 } from "lucide-react"

export default function ThankYouPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const amount = searchParams.get("amount") || "0"

  const campaign = allCampaigns.find((c) => c.id === params.id)

  if (!campaign) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Campaign not found</h1>
        <p className="mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
        <Link href="/campaigns">
          <Button>Browse Campaigns</Button>
        </Link>
      </div>
    )
  }

  const formattedAmount = Number.parseInt(amount).toLocaleString()
  const transactionId = "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container py-12 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Thank You for Your Donation!</h1>
        <p className="text-muted-foreground">
          Your contribution of ₹{formattedAmount} to {campaign.title} has been received.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Donation Receipt</CardTitle>
          <CardDescription>Transaction ID: {transactionId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{currentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaign</span>
              <span>{campaign.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organizer</span>
              <span>{campaign.organizer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Donation Amount</span>
              <span className="font-medium">₹{formattedAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>₹0</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">₹{formattedAmount}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center space-y-4">
        <p>A confirmation email has been sent to your registered email address.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/campaigns/${campaign.id}`}>
            <Button variant="outline">View Campaign</Button>
          </Link>
          <Link href="/campaigns">
            <Button className="bg-primary hover:bg-primary/90">Explore More Campaigns</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

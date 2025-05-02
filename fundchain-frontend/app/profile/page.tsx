import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Gift, History } from "lucide-react"

export default function ProfilePage() {
  // This would be fetched from your backend/blockchain
  const userPoints = 150
  const donationHistory = [
    { id: 1, campaign: "Save the Ocean", amount: 50, points: 50, date: "2024-04-27" },
    { id: 2, campaign: "Education for All", amount: 100, points: 100, date: "2024-04-26" },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Points
            </CardTitle>
            <CardDescription>Track your contribution points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{userPoints}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Points can be redeemed for vouchers in the Redeem section
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Available Rewards
            </CardTitle>
            <CardDescription>Vouchers you can redeem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">$10 Gift Card</p>
                  <p className="text-sm text-muted-foreground">100 points</p>
                </div>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  Redeem
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">$25 Gift Card</p>
                  <p className="text-sm text-muted-foreground">250 points</p>
                </div>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  Redeem
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Donation History
            </CardTitle>
            <CardDescription>Your recent contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donationHistory.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{donation.campaign}</p>
                    <p className="text-sm text-muted-foreground">{donation.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${donation.amount}</p>
                    <p className="text-sm text-muted-foreground">+{donation.points} points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
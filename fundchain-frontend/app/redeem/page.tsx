import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Trophy } from "lucide-react"

const availableVouchers = [
  {
    id: 1,
    name: "$10 Gift Card",
    points: 100,
    description: "Redeem for a $10 gift card to use at participating stores",
    image: "/voucher-10.png"
  },
  {
    id: 2,
    name: "$25 Gift Card",
    points: 250,
    description: "Redeem for a $25 gift card to use at participating stores",
    image: "/voucher-25.png"
  },
  {
    id: 3,
    name: "$50 Gift Card",
    points: 500,
    description: "Redeem for a $50 gift card to use at participating stores",
    image: "/voucher-50.png"
  }
]

export default function RedeemPage() {
  // This would be fetched from your backend/blockchain
  const userPoints = 150

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Redeem Your Points</h1>
        <p className="text-muted-foreground">
          Convert your contribution points into valuable rewards
        </p>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Available Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{userPoints}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Keep donating to earn more points!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableVouchers.map((voucher) => (
          <Card key={voucher.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                {voucher.name}
              </CardTitle>
              <CardDescription>{voucher.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Points Required:</span>
                  <span className="font-bold">{voucher.points}</span>
                </div>
                <button
                  className={`w-full py-2 px-4 rounded-md ${
                    userPoints >= voucher.points
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  disabled={userPoints < voucher.points}
                >
                  {userPoints >= voucher.points ? "Redeem Now" : "Not Enough Points"}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 
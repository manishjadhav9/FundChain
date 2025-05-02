import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy } from "lucide-react"

// This would be fetched from your backend/blockchain
const fundedCampaigns = [
  {
    id: 1,
    title: "Save the Ocean",
    description: "Help us clean up ocean pollution and protect marine life",
    amount: 50,
    points: 50,
    date: "2024-04-27",
    progress: 75,
    status: "Active"
  },
  {
    id: 2,
    title: "Education for All",
    description: "Providing education resources to underprivileged children",
    amount: 100,
    points: 100,
    date: "2024-04-26",
    progress: 90,
    status: "Active"
  }
]

export default function MyFundingsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Fundings</h1>
        <p className="text-muted-foreground">
          Track your contributions and their impact
        </p>
      </div>

      <div className="grid gap-6">
        {fundedCampaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    {campaign.title}
                  </CardTitle>
                  <CardDescription>{campaign.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${campaign.amount}</div>
                  <div className="text-sm text-muted-foreground">+{campaign.points} points</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Campaign Progress</span>
                  <span>{campaign.progress}%</span>
                </div>
                <Progress value={campaign.progress} />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Funded on {campaign.date}</span>
                  <span className="text-green-600">{campaign.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Campaign } from "@/lib/types"

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const percentRaised = Math.min(Math.round((campaign.amountRaised / campaign.targetAmount) * 100), 100)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={campaign.image || "/placeholder.svg?height=200&width=400"}
            alt={campaign.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant={campaign.status === "VERIFIED" ? "default" : "secondary"}>{campaign.status}</Badge>
            <Badge variant="outline" className="bg-background/80">
              {campaign.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-lg font-bold line-clamp-2 mb-2">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{campaign.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>₹{campaign.amountRaised.toLocaleString()}</span>
            <span className="text-muted-foreground">of ₹{campaign.targetAmount.toLocaleString()}</span>
          </div>
          <Progress value={percentRaised} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentRaised}% Raised</span>
            <span>{campaign.donorsCount} Donors</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link href={`/campaigns/${campaign.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        <Link href={`/campaigns/${campaign.id}/donate`} className="flex-1">
          <Button className="w-full bg-primary hover:bg-primary/90">Donate</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

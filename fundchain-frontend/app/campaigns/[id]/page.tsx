"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { allCampaigns } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar, Clock, Share2, Users } from "lucide-react"

export default function CampaignPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")

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

  const percentRaised = Math.min(Math.round((campaign.amountRaised / campaign.targetAmount) * 100), 100)

  const formattedDate = new Date(campaign.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this campaign with others",
      })
    }
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={campaign.image || "/placeholder.svg?height=400&width=800"}
              alt={campaign.title}
              width={800}
              height={400}
              className="w-full object-cover aspect-video"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge variant={campaign.status === "VERIFIED" ? "default" : "secondary"}>{campaign.status}</Badge>
              <Badge variant="outline" className="bg-background/80">
                {campaign.type}
              </Badge>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={campaign.organizer.image || ""} alt={campaign.organizer.name} />
                  <AvatarFallback>{campaign.organizer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{campaign.organizer.name}</p>
                  <p className="text-xs text-muted-foreground">Organizer</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Started on {formattedDate}</span>
              </div>
            </div>

            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-base leading-relaxed">{campaign.description}</p>
                  <p className="text-base leading-relaxed mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                  </p>
                  <p className="text-base leading-relaxed mt-4">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
                    anim id est laborum.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="milestones" className="mt-6">
                <div className="space-y-4">
                  {campaign.milestones.map((milestone, index) => (
                    <Card key={milestone.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              milestone.isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{milestone.title}</h3>
                              <Badge variant={milestone.isCompleted ? "default" : "outline"}>
                                {milestone.isCompleted ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                            <p className="text-sm font-medium mt-2">
                              Target: ₹{milestone.targetAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="updates" className="mt-6">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={campaign.organizer.image || ""} alt={campaign.organizer.name} />
                          <AvatarFallback>{campaign.organizer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{campaign.organizer.name}</h3>
                            <p className="text-xs text-muted-foreground">2 days ago</p>
                          </div>
                          <p className="text-sm mt-2">
                            We've reached our first milestone! Thank you to all our donors for your generous support.
                            We're now moving forward with the next phase of the project.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={campaign.organizer.image || ""} alt={campaign.organizer.name} />
                          <AvatarFallback>{campaign.organizer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{campaign.organizer.name}</h3>
                            <p className="text-xs text-muted-foreground">1 week ago</p>
                          </div>
                          <p className="text-sm mt-2">
                            Campaign launched! We're excited to begin this journey and make a difference. Please share
                            with your friends and family to help us reach our goal.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">₹{campaign.amountRaised.toLocaleString()}</span>
                    <span className="text-muted-foreground">of ₹{campaign.targetAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={percentRaised} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentRaised}% Raised</span>
                    <span>{campaign.donorsCount} Donors</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link href={`/campaigns/${campaign.id}/donate`}>
                    <Button className="w-full bg-primary hover:bg-primary/90">Donate Now</Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{campaign.donorsCount} donors</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Active campaign</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Recent Donors</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">₹5,000 • 2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Anonymous Supporter</p>
                    <p className="text-xs text-muted-foreground">₹10,000 • 3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>RS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Rahul Sharma</p>
                    <p className="text-xs text-muted-foreground">₹2,000 • 5 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>PM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Priya Mehta</p>
                    <p className="text-xs text-muted-foreground">₹1,500 • 1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

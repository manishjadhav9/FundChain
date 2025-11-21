"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, Trophy, ShoppingBag, Ticket, Star, ArrowRight } from "lucide-react"
import { useState } from "react"

type Reward = {
  id: string
  name: string
  points: number
  description: string
  image: string
  category: 'gift-card' | 'merchandise' | 'experience'
  brand?: string
}

const REWARDS: Reward[] = [
  {
    id: "1",
    name: "Amazon Gift Card",
    points: 500,
    description: "$10 Gift Card for Amazon.com",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    category: "gift-card",
    brand: "Amazon"
  },
  {
    id: "2",
    name: "Starbucks Coffee",
    points: 250,
    description: "$5 Starbucks Card for your daily brew",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    category: "gift-card",
    brand: "Starbucks"
  },
  {
    id: "3",
    name: "FundChain Eco Hoodie",
    points: 2000,
    description: "Premium organic cotton hoodie with embroidered logo",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
    category: "merchandise"
  },
  {
    id: "4",
    name: "VIP Gala Ticket",
    points: 5000,
    description: "Exclusive access to our annual charity gala dinner",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    category: "experience"
  },
  {
    id: "5",
    name: "Spotify Premium",
    points: 1000,
    description: "3-month subscription to Spotify Premium",
    image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80",
    category: "gift-card",
    brand: "Spotify"
  },
  {
    id: "6",
    name: "Sustainable Water Bottle",
    points: 750,
    description: "Double-walled insulated stainless steel bottle",
    image: "https://images.unsplash.com/photo-1602143407151-01114192003f?w=800&q=80",
    category: "merchandise"
  }
]

export default function RedeemPage() {
  // Mock user points - in real app this comes from context/API
  const userPoints = 1250
  const nextTierPoints = 2500
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const filteredRewards = activeCategory === "all"
    ? REWARDS
    : REWARDS.filter(r => r.category === activeCategory)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 md:p-12 mb-12 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2 text-indigo-100">
              <Trophy className="h-5 w-5" />
              <span className="font-medium tracking-wide uppercase text-sm">Rewards Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Turn Your Impact Into <span className="text-yellow-300">Rewards</span>
            </h1>
            <p className="text-indigo-100 text-lg">
              You've earned points by making a difference. Now treat yourself to exclusive rewards from our partners.
            </p>
          </div>

          <Card className="w-full md:w-96 bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-indigo-100">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold">{userPoints.toLocaleString()}</span>
                <span className="text-indigo-200">pts</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-indigo-200">
                  <span>Silver Tier</span>
                  <span>Gold Tier ({nextTierPoints} pts)</span>
                </div>
                <Progress value={(userPoints / nextTierPoints) * 100} className="h-2 bg-white/20" indicatorClassName="bg-yellow-400" />
                <p className="text-xs text-indigo-200 mt-2">
                  Donate {nextTierPoints - userPoints} more points to reach Gold status
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      {/* Rewards Section */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Available Rewards
          </h2>

          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-4 md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="gift-card">Gift Cards</TabsTrigger>
              <TabsTrigger value="merchandise">Merch</TabsTrigger>
              <TabsTrigger value="experience">Events</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => (
            <Card key={reward.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-black font-bold shadow-sm">
                    {reward.points} pts
                  </Badge>
                </div>
                {reward.brand && (
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="backdrop-blur-md bg-black/50 text-white border-none">
                      {reward.brand}
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      {reward.category.replace('-', ' ')}
                    </p>
                    <CardTitle className="line-clamp-1">{reward.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {reward.description}
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <Button
                  className="w-full gap-2 group-hover:bg-primary/90 transition-colors"
                  disabled={userPoints < reward.points}
                  variant={userPoints >= reward.points ? "default" : "secondary"}
                >
                  {userPoints >= reward.points ? (
                    <>
                      Redeem Reward
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Need {reward.points - userPoints} more pts
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { allCampaigns } from "@/lib/data"
import { ArrowLeft, CreditCard } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function DonatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isLoading, setIsLoading] = useState(false)

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

  const handleAmountSelect = (value: string) => {
    setAmount(value)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value)
    setAmount("custom")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const donationAmount = amount === "custom" ? Number.parseInt(customAmount) : Number.parseInt(amount)

    if (!donationAmount || donationAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Donation successful!",
        description: `Thank you for your donation of ₹${donationAmount.toLocaleString()} to ${campaign.title}`,
      })

      router.push(`/campaigns/${campaign.id}/thank-you?amount=${donationAmount}`)
    } catch (error) {
      toast({
        title: "Donation failed",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Campaign
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Donate to {campaign.title}</h1>
          <p className="text-muted-foreground mb-6">
            Your donation will help make a difference. Thank you for your support!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Choose an amount</Label>
              <div className="grid grid-cols-3 gap-4">
                {[500, 1000, 2000, 5000, 10000, 25000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={amount === value.toString() ? "default" : "outline"}
                    className={amount === value.toString() ? "bg-primary hover:bg-primary/90" : ""}
                    onClick={() => handleAmountSelect(value.toString())}
                  >
                    ₹{value.toLocaleString()}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant={amount === "custom" ? "default" : "outline"}
                  className={amount === "custom" ? "bg-primary hover:bg-primary/90" : ""}
                  onClick={() => setAmount("custom")}
                  disabled={!customAmount}
                >
                  Custom
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isAnonymous}
                    disabled={isAnonymous}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={!isAnonymous}
                    disabled={isAnonymous}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="anonymous" className="text-sm font-normal">
                  Make my donation anonymous
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a message of support"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <Label htmlFor="netbanking">Net Banking</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : `Donate ${amount === "custom" ? `₹${Number.parseInt(customAmount || "0").toLocaleString()}` : amount ? `₹${Number.parseInt(amount).toLocaleString()}` : ""}`}
            </Button>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Donation Summary</CardTitle>
              <CardDescription>You're supporting {campaign.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 w-full mb-4">
                <Image
                  src={campaign.image || "/placeholder.svg?height=200&width=400"}
                  alt={campaign.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donation Amount</span>
                  <span className="font-medium">
                    {amount === "custom"
                      ? `₹${Number.parseInt(customAmount || "0").toLocaleString()}`
                      : amount
                        ? `₹${Number.parseInt(amount).toLocaleString()}`
                        : "₹0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">
                    {amount === "custom"
                      ? `₹${Number.parseInt(customAmount || "0").toLocaleString()}`
                      : amount
                        ? `₹${Number.parseInt(amount).toLocaleString()}`
                        : "₹0"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2">
              <p className="text-sm text-muted-foreground">
                Your donation will help {campaign.organizer.name} reach their fundraising goal.
              </p>
              <p className="text-sm text-muted-foreground">FundChain charges 0% platform fee for all donations.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

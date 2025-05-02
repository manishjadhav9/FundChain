"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react"

export default function CreateCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [campaignType, setCampaignType] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [milestones, setMilestones] = useState([{ title: "", description: "", amount: "" }])

  // Redirect to login if not authenticated
  if (!user) {
    router.push("/auth/login?redirect=/campaigns/create")
    return null
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", amount: "" }])
  }

  const handleRemoveMilestone = (index: number) => {
    const newMilestones = [...milestones]
    newMilestones.splice(index, 1)
    setMilestones(newMilestones)
  }

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    const newMilestones = [...milestones]
    newMilestones[index] = { ...newMilestones[index], [field]: value }
    setMilestones(newMilestones)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!title || !description || !campaignType || !targetAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate milestones
    const totalMilestoneAmount = milestones.reduce((sum, milestone) => {
      return sum + (Number.parseInt(milestone.amount) || 0)
    }, 0)

    if (totalMilestoneAmount !== Number.parseInt(targetAmount)) {
      toast({
        title: "Milestone amounts don't match",
        description: `The sum of milestone amounts (₹${totalMilestoneAmount.toLocaleString()}) must equal the target amount (₹${Number.parseInt(targetAmount).toLocaleString()})`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Campaign created successfully",
        description: "Your campaign has been submitted for verification",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Failed to create campaign",
        description: "There was an error creating your campaign. Please try again.",
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
        Back
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create a Campaign</h1>
        <p className="text-muted-foreground mb-8">Fill in the details below to start your fundraising campaign</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your campaign a clear, specific title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Campaign Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain your campaign, its purpose, and why people should donate"
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-type">Campaign Type *</Label>
                <Select value={campaignType} onValueChange={setCampaignType} required>
                  <SelectTrigger id="campaign-type">
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEDICAL">Medical Emergency</SelectItem>
                    <SelectItem value="RELIGIOUS">Religious Cause</SelectItem>
                    <SelectItem value="NGO">NGO Initiative</SelectItem>
                    <SelectItem value="GOVERNMENT">Government Project</SelectItem>
                    <SelectItem value="EDUCATION">Education Support</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-amount">Target Amount (₹) *</Label>
                <Input
                  id="target-amount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="Enter amount in INR"
                  min="1000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Campaign Image</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image")?.click()}
                  className="w-full h-32 flex flex-col items-center justify-center border-dashed"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 mb-2" />
                      <span>Upload Image</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG or GIF, max 5MB</span>
                    </>
                  )}
                </Button>
                <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Milestones</h2>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMilestone}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Break down your campaign into specific milestones. The total milestone amounts should equal your target
              amount.
            </p>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Milestone {index + 1}</h3>
                      {milestones.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMilestone(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`milestone-${index}-title`}>Title *</Label>
                        <Input
                          id={`milestone-${index}-title`}
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(index, "title", e.target.value)}
                          placeholder="e.g., Initial Medical Tests"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`milestone-${index}-description`}>Description *</Label>
                        <Textarea
                          id={`milestone-${index}-description`}
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(index, "description", e.target.value)}
                          placeholder="Describe what this milestone will achieve"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`milestone-${index}-amount`}>Amount (₹) *</Label>
                        <Input
                          id={`milestone-${index}-amount`}
                          type="number"
                          value={milestone.amount}
                          onChange={(e) => handleMilestoneChange(index, "amount", e.target.value)}
                          placeholder="Enter amount in INR"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Terms & Conditions</h2>

            <div className="flex items-start space-x-2">
              <input type="checkbox" id="terms" required className="mt-1 rounded border-gray-300" />
              <Label htmlFor="terms" className="text-sm font-normal">
                I confirm that all information provided is accurate and I agree to FundChain's{" "}
                <Link href="/terms" className="text-primary underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary underline">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <input type="checkbox" id="verification" required className="mt-1 rounded border-gray-300" />
              <Label htmlFor="verification" className="text-sm font-normal">
                I understand that my campaign will be reviewed by FundChain before it goes live, and I may be asked to
                provide additional verification documents.
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Creating Campaign..." : "Submit Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

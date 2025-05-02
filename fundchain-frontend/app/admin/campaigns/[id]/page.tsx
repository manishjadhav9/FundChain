"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { allCampaigns } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowLeft, Calendar, FileText, Shield, Users, XCircle } from "lucide-react"

export default function AdminCampaignDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [campaign, setCampaign] = useState(allCampaigns.find(c => c.id === params.id))
  const [adminNotes, setAdminNotes] = useState("")
  
  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/admin/campaigns/" + params.id)
    } else if (!isAdmin) {
      router.push("/dashboard")
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      })
    }
  }, [user, isAdmin, router, toast, params.id])
  
  if (!user || !isAdmin || !campaign) {
    return null
  }
  
  const percentRaised = Math.min(
    Math.round((campaign.amountRaised / campaign.targetAmount) * 100),
    100
  )
  
  const formattedDate = new Date(campaign.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  
  const handleVerifyCampaign = () => {
    setCampaign({ ...campaign, status: "VERIFIED" })
    
    toast({
      title: "Campaign Verified",
      description: "The campaign has been verified successfully",
    })
  }
  
  const handleCloseCampaign = () => {
    setCampaign({ ...campaign, status: "CLOSED" })
    
    toast({
      title: "Campaign Closed",
      description: "The campaign has been closed successfully",
    })
  }
  
  const handleSaveNotes = () => {
    toast({
      title: "Notes Saved",
      description: "Admin notes have been saved successfully",
    })
  }

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin Panel
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <Badge variant={campaign.status === "VERIFIED" ? "default" : "secondary"}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Campaign ID: {campaign.id}
          </p>
        </div>
        
        <div className="flex gap-3">
          {campaign.status === "OPEN" && (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleVerifyCampaign}
            >
              <Shield className="mr-2 h-4 w-4" />
              Verify Campaign
            </Button>
          )}
          
          {campaign.status === "VERIFIED" && (
            <Button 
              variant="destructive"
              onClick={handleCloseCampaign}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Close Campaign
            </Button>
          )}
          
          <Link href={`/campaigns/${campaign.id}`} target="_blank">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Public Page
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="relative rounded-lg overflow-hidden mb-6">
                <Image
                  src={campaign.image || "/placeholder.svg?height=400&width=800"}
                  alt={campaign.title}
                  width={800}
                  height={400}
                  className="w-full object-cover aspect-video"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Organizer</p>
                      <p className="text-sm text-muted-foreground">{campaign.organizer.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created On</p>
                      <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Campaign Type</p>
                      <p className="text-sm text-muted-foreground">{campaign.type}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Fundraising Progress</p>
                    <div className="flex justify-between text-sm">
                      <span>₹{campaign.amountRaised.toLocaleString()}</span>
                      <span className="text-muted-foreground">
                        of ₹{campaign.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={percentRaised} className="h-2 mt-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{percentRaised}% Raised</span>
                      <span>{campaign.donorsCount} Donors</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Verification Status</p>
                    <div className="flex items-center gap-2">
                      {campaign.status === "OPEN" ? (
                        <>
                          <Badge variant="secondary">Pending</Badge>
                          <span className="text-sm text-muted-foreground">Awaiting admin review</span>
                        </>
                      ) : campaign.status === "VERIFIED" ? (
                        <>
                          <Badge>Verified</Badge>
                          <span className="text-sm text-muted-foreground">Approved on {new Date().toLocaleDateString()}</span>
                        </>
                      ) : (
                        <>
                          <Badge variant="destructive">Closed</Badge>\
\

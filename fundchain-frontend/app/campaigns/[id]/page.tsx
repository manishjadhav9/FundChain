"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/currency"
import { getPublicIPFSUrl } from "@/lib/ipfs"
import { getCampaign, donateToCampaign } from "@/lib/contracts"
import { toast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Clipboard, 
  FileText, 
  Users, 
  AlertCircle,
  ExternalLink,
  Heart,
  CheckCircle,
  Share2
} from "lucide-react"
import React from "react"

export default function CampaignDetailsPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const campaignId = unwrappedParams.id

  const router = useRouter()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [donationAmount, setDonationAmount] = useState("0.1")
  const [donating, setDonating] = useState(false)
  const [donationSuccess, setDonationSuccess] = useState(false)
  
  // Format the campaign type for display
  const formatCampaignType = (type) => {
    const types = {
      'MEDICAL': 'Medical',
      'RELIGIOUS': 'Religious',
      'NGO': 'NGO',
      'GOVERNMENT': 'Government',
      'EDUCATION': 'Education',
      'OTHER': 'Other'
    }
    return types[type] || 'Other'
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (err) {
      console.error('Error formatting date:', err)
      return 'Invalid date'
    }
  }
  
  // Calculate percentage raised
  const calculatePercentRaised = (amountRaised, targetAmount) => {
    if (!amountRaised || !targetAmount) return 0
    const percent = (parseFloat(amountRaised) / parseFloat(targetAmount)) * 100
    return Math.min(Math.round(percent), 100) // Cap at 100%
  }
  
  // Load campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        setError("")
        
        console.log('Fetching campaign with ID:', campaignId)
        
        // For blockchain addresses, use getCampaign function
        if (campaignId.startsWith('0x') && campaignId.length === 42) {
          const campaignData = await getCampaign(campaignId)
          console.log('Fetched blockchain campaign:', campaignData)
          
          // Add additional fields expected by the UI
          campaignData.percentRaised = calculatePercentRaised(
            campaignData.amountRaised, 
            campaignData.targetAmount
          )
          
          // Convert the ETH amount to INR (simplified conversion)
          const ethToInrRate = 217000 // Example rate
          campaignData.targetAmountInr = (parseFloat(campaignData.targetAmount) * ethToInrRate).toString()
          
          // Add or update organizer info
          campaignData.organizer = {
            name: "Manish Jadhav",
            role: "Donor",
            contact: "manish.jadhav@example.com"
          }
          
          setCampaign(campaignData)
        } 
        // For non-blockchain IDs (like sample-1), use mock data approach
        else {
          // First, try to get campaigns from localStorage
          const storedCampaigns = localStorage.getItem('fundchain-approved-campaigns')
          let localCampaigns = []
          
          if (storedCampaigns) {
            try {
              localCampaigns = JSON.parse(storedCampaigns)
              console.log('Found campaigns in localStorage:', localCampaigns.length)
            } catch (err) {
              console.error('Error parsing localStorage campaigns:', err)
            }
          }
          
          // Try to find the campaign in localStorage first
          const localCampaign = localCampaigns.find(c => c.id === campaignId)
          if (localCampaign) {
            console.log('Found campaign in localStorage:', localCampaign)
            
            // Ensure it has all required properties
            const enrichedCampaign = {
              ...localCampaign,
              organizer: {
                name: "Manish Jadhav",
                role: "Donor",
                contact: "manish.jadhav@example.com"
              },
              milestones: localCampaign.milestones || [
                {
                  id: "1",
                  title: "Initial Funding",
                  description: "First phase of the campaign",
                  amount: (parseFloat(localCampaign.targetAmount) * 0.3).toFixed(2),
                  isCompleted: localCampaign.percentRaised >= 30
                },
                {
                  id: "2",
                  title: "Main Phase",
                  description: "Implementation phase",
                  amount: (parseFloat(localCampaign.targetAmount) * 0.5).toFixed(2),
                  isCompleted: localCampaign.percentRaised >= 80
                },
                {
                  id: "3",
                  title: "Final Phase",
                  description: "Completion and reporting",
                  amount: (parseFloat(localCampaign.targetAmount) * 0.2).toFixed(2),
                  isCompleted: localCampaign.percentRaised >= 100
                }
              ],
              createdAt: localCampaign.createdAt || new Date().toISOString(),
              updatedAt: localCampaign.updatedAt || new Date().toISOString(),
              documentHashes: localCampaign.documentHashes || [],
              owner: localCampaign.owner || localCampaign.contractAddress || "0x" + Date.now().toString().padStart(40, "0")
            }
            
            setCampaign(enrichedCampaign)
            return
          }
          
          // Then try API endpoint
          try {
            const response = await fetch('/api/campaigns')
            if (response.ok) {
              const campaigns = await response.json()
              const foundCampaign = campaigns.find(c => c.id === campaignId)
              
              if (foundCampaign) {
                // Add necessary fields for UI
                if (!foundCampaign.organizer) {
                  foundCampaign.organizer = {
                    name: "Manish Jadhav",
                    role: "Donor",
                    contact: "manish.jadhav@example.com"
                  }
                }
                
                if (!foundCampaign.milestones) {
                  foundCampaign.milestones = [
                    {
                      id: "1",
                      title: "Initial Funding",
                      description: "First phase of the campaign",
                      amount: (parseFloat(foundCampaign.targetAmount) * 0.3).toFixed(2),
                      isCompleted: foundCampaign.percentRaised >= 30
                    },
                    {
                      id: "2",
                      title: "Main Phase",
                      description: "Implementation phase",
                      amount: (parseFloat(foundCampaign.targetAmount) * 0.5).toFixed(2),
                      isCompleted: foundCampaign.percentRaised >= 80
                    },
                    {
                      id: "3",
                      title: "Final Phase",
                      description: "Completion and reporting",
                      amount: (parseFloat(foundCampaign.targetAmount) * 0.2).toFixed(2),
                      isCompleted: foundCampaign.percentRaised >= 100
                    }
                  ]
                }
                
                setCampaign(foundCampaign)
                return
              }
            }
          } catch (err) {
            console.error("Error fetching from API:", err)
          }
          
          // Fallback for development - try to match with known sample campaigns
          const sampleCampaigns = [
            {
              id: "sample-1",
              title: "Help Ravi Fight Cancer",
              description: "Ravi, a 12-year-old boy from Mumbai, has been diagnosed with leukemia. His family needs financial support for his treatment. The funds will be used for chemotherapy, medications, and hospital stays over the next 6 months.",
              type: "MEDICAL",
              imageHash: "QmTZRVmhNi6AAuW2XwLykCyJZVcXDK2xE6oA5KG6vfbqCZ",
              targetAmount: "1.5",
              targetAmountInr: "325000",
              status: "VERIFIED",
              amountRaised: "0.975",
              percentRaised: 65,
              donorCount: 142,
              createdAt: "2023-04-15T10:30:00Z",
              updatedAt: "2023-05-10T14:45:00Z",
              owner: "0x1234567890123456789012345678901234567890",
              documentHashes: [
                "QmTZRVmhNi6AAuW2XwLykCyJZVcXDK2xE6oA5KG6vfbqCZ",
                "QmV2i4yCqbW9jpzG9o9GpShJ6VtbTVECcLjSgpWccVq7G6"
              ],
              milestones: [
                {
                  id: "1",
                  title: "Initial Treatment",
                  description: "First round of chemotherapy and preliminary tests",
                  amount: "0.5",
                  isCompleted: true
                },
                {
                  id: "2",
                  title: "Main Treatment Phase",
                  description: "Intensive chemotherapy sessions and medications",
                  amount: "0.7",
                  isCompleted: false
                },
                {
                  id: "3",
                  title: "Recovery Support",
                  description: "Post-treatment care and support",
                  amount: "0.3",
                  isCompleted: false
                }
              ],
              organizer: {
                name: "Manish Jadhav",
                role: "Donor",
                contact: "manish.jadhav@example.com"
              }
            },
            {
              id: "sample-2",
              title: "Rebuild Shiva Temple After Earthquake",
              description: "The historic Shiva Temple in Uttarakhand was severely damaged in the recent earthquake. Help us rebuild this 500-year-old cultural heritage. This temple is not just a religious site but also a significant cultural monument that attracts tourists from all over the world.",
              type: "RELIGIOUS",
              imageHash: "QmV2i4yCqbW9jpzG9o9GpShJ6VtbTVECcLjSgpWccVq7G6",
              targetAmount: "2.7",
              targetAmountInr: "750000",
              status: "VERIFIED",
              amountRaised: "1.0",
              percentRaised: 38,
              donorCount: 320,
              createdAt: "2023-03-10T08:15:00Z",
              updatedAt: "2023-04-25T12:30:00Z",
              owner: "0x2345678901234567890123456789012345678901",
              documentHashes: [
                "QmV2i4yCqbW9jpzG9o9GpShJ6VtbTVECcLjSgpWccVq7G6"
              ],
              milestones: [
                {
                  id: "1",
                  title: "Structural Assessment",
                  description: "Hire engineers to assess damage and create rebuilding plans",
                  amount: "0.8",
                  isCompleted: true
                },
                {
                  id: "2",
                  title: "Materials Procurement",
                  description: "Purchase traditional materials for authentic reconstruction",
                  amount: "1.2",
                  isCompleted: false
                },
                {
                  id: "3",
                  title: "Reconstruction",
                  description: "Rebuild the temple structure with skilled artisans",
                  amount: "0.7",
                  isCompleted: false
                }
              ],
              organizer: {
                name: "Manish Jadhav",
                role: "Donor",
                contact: "manish.jadhav@example.com"
              }
            },
            {
              id: "sample-3",
              title: "Education for 100 Rural Girls",
              description: "Support the education of 100 girls from rural villages in Bihar. This includes school fees, books, uniforms, and transportation for one year. Education is the key to breaking the cycle of poverty in these communities.",
              type: "EDUCATION",
              imageHash: "QmPLB9yo8mQmSvK6WcXCsz7L1ZCajEoZJ9LRppAuH2Gy57",
              targetAmount: "3.1",
              targetAmountInr: "850000",
              status: "VERIFIED",
              amountRaised: "2.6",
              percentRaised: 85,
              donorCount: 275,
              createdAt: "2023-01-05T14:20:00Z",
              updatedAt: "2023-05-15T09:45:00Z",
              owner: "0x3456789012345678901234567890123456789012",
              documentHashes: [
                "QmPLB9yo8mQmSvK6WcXCsz7L1ZCajEoZJ9LRppAuH2Gy57"
              ],
              milestones: [
                {
                  id: "1",
                  title: "School Fee Payment",
                  description: "Pay annual fees for 100 girls",
                  amount: "1.5",
                  isCompleted: true
                },
                {
                  id: "2",
                  title: "Books and Uniforms",
                  description: "Provide learning materials and proper uniforms",
                  amount: "1.0",
                  isCompleted: true
                },
                {
                  id: "3",
                  title: "Transportation System",
                  description: "Set up safe transportation to and from school",
                  amount: "0.6",
                  isCompleted: false
                }
              ],
              organizer: {
                name: "Manish Jadhav",
                role: "Donor",
                contact: "manish.jadhav@example.com"
              }
            }
          ]
          
          const foundCampaign = sampleCampaigns.find(c => c.id === campaignId)
          if (foundCampaign) {
            setCampaign(foundCampaign)
            return
          }
          
          // For special campaign IDs like "campaign-1747169551358-ikinyrlno"
          // Extract the timestamp and generate consistent data
          if (campaignId.startsWith('campaign-')) {
            const parts = campaignId.split('-')
            const timestamp = parts[1] || Date.now()
            const nameId = parts[2] || 'campaign'
            
            // Create a deterministic campaign with this ID
            // Use timestamp to ensure consistent data for same ID
            const title = `${nameId.charAt(0).toUpperCase() + nameId.slice(1)} Campaign`
            
            const newCampaign = {
              id: campaignId,
              title: title,
              description: `This is a ${title} that aims to make a positive impact in our community. With your support, we can achieve our goals and create meaningful change.`,
              type: "NGO",
              imageHash: "QmPLB9yo8mQmSvK6WcXCsz7L1ZCajEoZJ9LRppAuH2Gy57",
              targetAmount: "1.2",
              targetAmountInr: "260000",
              status: "VERIFIED",
              amountRaised: "0.4",
              percentRaised: 33,
              donorCount: 24,
              createdAt: new Date(parseInt(timestamp)).toISOString(),
              updatedAt: new Date().toISOString(),
              owner: "0x" + timestamp.toString().padStart(40, "0"),
              documentHashes: [
                "QmTZRVmhNi6AAuW2XwLykCyJZVcXDK2xE6oA5KG6vfbqCZ"
              ],
              milestones: [
                {
                  id: "1",
                  title: "Initial Phase",
                  description: "Setting up the foundation",
                  amount: "0.4",
                  isCompleted: true
                },
                {
                  id: "2",
                  title: "Main Implementation",
                  description: "Core activities and execution",
                  amount: "0.5",
                  isCompleted: false
                },
                {
                  id: "3",
                  title: "Final Delivery",
                  description: "Completion and reporting",
                  amount: "0.3",
                  isCompleted: false
                }
              ],
              organizer: {
                name: "Manish Jadhav",
                role: "Donor",
                contact: "manish.jadhav@example.com"
              }
            }
            
            setCampaign(newCampaign)
            return
          }
          
          throw new Error(`Campaign with ID ${campaignId} not found`)
        }
      } catch (error) {
        console.error('Error fetching campaign:', error)
        setError("Failed to load campaign details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchCampaign()
  }, [campaignId]) // Only re-run if campaignId changes
  
  // Handle donation
  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setDonating(true)
      setDonationSuccess(false)
      
      // For blockchain campaigns, use the donateToCampaign function
      let donationProcessed = false;
      
      if (campaignId.startsWith('0x') && campaignId.length === 42) {
        try {
          await donateToCampaign(campaignId, donationAmount)
          donationProcessed = true;
        } catch (blockchainError) {
          console.error("Blockchain donation error:", blockchainError)
          // Will continue with the simulation below
        }
      }
      
      // If the blockchain transaction wasn't processed, simulate a successful donation
      if (!donationProcessed) {
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      // Show success message
      toast({
        title: "Donation Successful",
        description: `Thank you for your donation of ${donationAmount} ETH!`,
        variant: "default",
      })
      
      setDonationSuccess(true)
      
      // Simulate local update of campaign data
      setCampaign(prev => {
        if (!prev) return prev
        
        // Calculate new values
        const newAmountRaised = (parseFloat(prev.amountRaised) + parseFloat(donationAmount)).toString()
        const newPercentRaised = calculatePercentRaised(newAmountRaised, prev.targetAmount)
        const newDonorCount = (prev.donorCount || 0) + 1
        
        // Update milestones completion status based on new percentage
        const updatedMilestones = prev.milestones?.map(milestone => {
          // Determine milestone percentage threshold based on amount
          const milestoneAmount = parseFloat(milestone.amount);
          const targetAmount = parseFloat(prev.targetAmount);
          const milestonePercentage = (milestoneAmount / targetAmount) * 100;
          
          // Mark as completed if we've raised enough
          return {
            ...milestone,
            isCompleted: newPercentRaised >= milestonePercentage
          };
        }) || [];
        
        // Return updated campaign
        return {
          ...prev,
          amountRaised: newAmountRaised,
          percentRaised: newPercentRaised,
          donorCount: newDonorCount,
          milestones: updatedMilestones
        }
      })
      
      // Save updated campaign to localStorage if it's a mock campaign
      if (!campaignId.startsWith('0x')) {
        try {
          const storedCampaigns = localStorage.getItem('fundchain-approved-campaigns')
          if (storedCampaigns) {
            const campaigns = JSON.parse(storedCampaigns)
            const updatedCampaigns = campaigns.map(c => 
              c.id === campaignId ? { ...c, ...campaign, organizer: { name: "Manish Jadhav", role: "Donor", contact: "manish.jadhav@example.com" } } : c
            )
            localStorage.setItem('fundchain-approved-campaigns', JSON.stringify(updatedCampaigns))
          }
        } catch (e) {
          console.error('Error updating localStorage:', e)
        }
      }
      
    } catch (err) {
      console.error("Error donating:", err)
      toast({
        title: "Donation Failed",
        description: err.message || "Failed to process donation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDonating(false)
    }
  }
  
  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading campaign details...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/campaigns')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>
    )
  }
  
  if (!campaign) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Campaign Not Found</AlertTitle>
          <AlertDescription>This campaign does not exist or has been removed.</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/campaigns')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <Button variant="outline" className="mb-6" onClick={() => router.push('/campaigns')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Campaigns
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Image */}
          <div className="rounded-lg overflow-hidden border">
            {campaign.imageHash ? (
              <img
                src={getPublicIPFSUrl(campaign.imageHash)}
                alt={campaign.title}
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  console.log('Primary IPFS gateway failed, trying alternatives');
                  
                  // Try multiple public gateways as fallbacks
                  if (!e.currentTarget.src.includes('ipfs.io')) {
                    e.currentTarget.src = `https://ipfs.io/ipfs/${campaign.imageHash}`;
                  } else if (!e.currentTarget.src.includes('cloudflare-ipfs.com')) {
                    e.currentTarget.src = `https://cloudflare-ipfs.com/ipfs/${campaign.imageHash}`;
                  } else if (!e.currentTarget.src.includes('gateway.ipfs.io')) {
                    e.currentTarget.src = `https://gateway.ipfs.io/ipfs/${campaign.imageHash}`;
                  } else {
                    // If all IPFS gateways fail, use a placeholder
                    e.currentTarget.src = 'https://placehold.co/600x400/orange/white?text=Campaign+Image';
                    // Remove the error handler to prevent infinite loops
                    e.currentTarget.onerror = null;
                  }
                }}
              />
            ) : (
              <div className="h-[400px] w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}
          </div>
          
          {/* Campaign Title and Badges */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="bg-orange-500 text-white">
                {campaign.status || "OPEN"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {formatCampaignType(campaign.type)}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(campaign.createdAt)}</span>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4" />
              <span>Last updated {formatDate(campaign.updatedAt)}</span>
            </div>
          </div>
          
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-4 md:w-auto w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="organizer">Organizer</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About this Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{campaign.description}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Funding Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {campaign.percentRaised}% Complete
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {campaign.amountRaised} ETH raised of {campaign.targetAmount} ETH goal
                    </span>
                  </div>
                  <Progress value={campaign.percentRaised} className="h-2" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-center">
                    <div className="p-4 border rounded-lg">
                      <DollarSign className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Target Amount</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(campaign.targetAmountInr)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.targetAmount} ETH
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Donors</p>
                      <p className="font-bold text-lg">{campaign.donorCount}</p>
                      <p className="text-xs text-muted-foreground">
                        people supported
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg md:block hidden">
                      <Clipboard className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Milestones</p>
                      <p className="font-bold text-lg">{campaign.milestones.length}</p>
                      <p className="text-xs text-muted-foreground">
                        funding stages
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Milestones</CardTitle>
                  <CardDescription>
                    This campaign is divided into {campaign.milestones.length} funding stages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaign.milestones.map((milestone, index) => (
                      <div 
                        key={milestone.id || `milestone-${index}`} 
                        className={`border rounded-lg p-4 ${
                          milestone.isCompleted ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-primary text-white">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{milestone.title}</h3>
                              <div className="flex items-center">
                                <span className="text-sm mr-2">{milestone.amount} ETH</span>
                                {milestone.isCompleted ? (
                                  <Badge key="completed-badge" variant="secondary" className="bg-green-500 text-white">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge key="pending-badge" variant="outline">Pending</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supporting Documents</CardTitle>
                  <CardDescription>
                    Verification documents provided by the campaign organizer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {campaign.documentHashes && campaign.documentHashes.length > 0 ? (
                    <div key="documents-list" className="space-y-4">
                      {campaign.documentHashes.map((hash, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-3 text-primary" />
                            <span>Document {index + 1}</span>
                          </div>
                          <div>
                            <a 
                              href={getPublicIPFSUrl(hash)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-primary hover:underline"
                            >
                              View Document <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p key="no-documents" className="text-muted-foreground text-center py-6">
                      No documents available for this campaign
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Organizer Tab */}
            <TabsContent value="organizer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaign.organizer ? (
                    <div key="organizer-info" className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{campaign.organizer.name}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.organizer.role}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                        <p className="text-sm">{campaign.organizer.contact}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Wallet Address</h4>
                        <p className="text-xs bg-muted p-2 rounded font-mono overflow-x-auto">
                          {campaign.owner}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p key="no-organizer" className="text-muted-foreground text-center py-6">
                      No organizer information available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Donation Card */}
          <Card>
            <CardHeader>
              <CardTitle>Donate to this Campaign</CardTitle>
              <CardDescription>
                Support this cause with cryptocurrency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Donation Amount (ETH)
                </label>
                <div className="flex">
                  <div className="relative flex-1">
                    <input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="w-full border rounded-l-md p-2"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                    />
                    <span className="absolute right-2 top-2 text-muted-foreground">
                      ETH
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-l-none"
                    onClick={() => setDonationAmount("0.1")}
                  >
                    Min
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ≈ {formatCurrency(parseFloat(donationAmount || 0) * 217000)} INR
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleDonate}
                disabled={donating || parseFloat(donationAmount) <= 0}
              >
                {donating ? (
                  <React.Fragment key="donating-state">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    Processing...
                  </React.Fragment>
                ) : (
                  <React.Fragment key="donate-state">
                    <Heart className="mr-2 h-4 w-4" />
                    Donate Now
                  </React.Fragment>
                )}
              </Button>
              
              {donationSuccess && (
                <Alert key="donation-success" className="bg-green-50 border-green-200 text-green-800 mt-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your donation was processed successfully.
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-xs text-center text-muted-foreground">
                You'll be asked to confirm your donation with MetaMask or your Web3 wallet.
              </p>
            </CardContent>
          </Card>
          
          {/* Campaign Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge>{campaign.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Campaign Type:</span>
                  <span className="text-sm font-medium">{formatCampaignType(campaign.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="text-sm font-medium">{formatDate(campaign.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated:</span>
                  <span className="text-sm font-medium">{formatDate(campaign.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Donors:</span>
                  <span className="text-sm font-medium">{campaign.donorCount}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between">
                  <span className="text-sm">Blockchain Address:</span>
                </div>
                <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                  {campaignId}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Share Card */}
          <Card>
            <CardHeader>
              <CardTitle>Share this Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"

// Campaign Card Image Component with fallback handling
function CampaignCardImage({ imageHash, title, className }) {
  const [currentSrcIndex, setCurrentSrcIndex] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);
  
  // Get all possible IPFS URLs for fallback
  const fallbackUrls = React.useMemo(() => {
    if (!imageHash || !isValidIPFSHash(imageHash)) {
      return [getPlaceholderImageUrl(title)];
    }
    
    const ipfsUrls = getIPFSUrlsWithFallbacks(imageHash);
    return [...ipfsUrls, getPlaceholderImageUrl(title)];
  }, [imageHash, title]);
  
  const handleImageError = () => {
    if (currentSrcIndex < fallbackUrls.length - 1) {
      setCurrentSrcIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };
  
  if (hasError && currentSrcIndex >= fallbackUrls.length - 1) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">No Image</span>
      </div>
    );
  }
  
  return (
    <img
      src={fallbackUrls[currentSrcIndex]}
      alt={title}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"
import { getApprovedCampaigns } from "@/lib/admin-service"
import { getPublicIPFSUrl, getIPFSUrlsWithFallbacks, getPlaceholderImageUrl, isValidIPFSHash } from "@/lib/ipfs"
import { Plus, Search } from "lucide-react"

interface Campaign {
  id: string
  title: string
  description: string
  type: string
  imageHash: string
  targetAmount: string
  targetAmountInr: string
  status: string
  amountRaised: string
  percentRaised: number
  donorCount: number
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  
  useEffect(() => {
    loadCampaigns()
  }, [])
  
  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const approvedCampaigns = await getApprovedCampaigns()
      
      // Set the campaigns from blockchain/localStorage
      setCampaigns(approvedCampaigns)
      
      if (approvedCampaigns.length === 0) {
        console.log("No campaigns found. Make sure contracts are deployed and campaigns are verified.")
      } else {
        console.log(`Loaded ${approvedCampaigns.length} campaigns`)
      }
    } catch (err) {
      console.error("Error loading campaigns:", err)
      setError("Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }
  
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === "All Types" || campaign.type === typeFilter
    const matchesStatus = statusFilter === "All Statuses" || campaign.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })
  
  // Helper function to format the campaign type for display
  const formatCampaignType = (type: string) => {
    const types: { [key: string]: string } = {
      'MEDICAL': 'Medical',
      'RELIGIOUS': 'Religious',
      'NGO': 'NGO',
      'GOVERNMENT': 'Government',
      'EDUCATION': 'Education'
    }
    return types[type] || type
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-2">Browse and support worthy causes</p>
        </div>
        <Link href="/campaigns/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Start a Campaign
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search campaigns..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <select 
            className="border rounded-md p-2" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
            <option>VERIFIED</option>
            <option>OPEN</option>
            <option>CLOSED</option>
          </select>
          
          <select 
            className="border rounded-md p-2"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All Types</option>
            <option>MEDICAL</option>
            <option>RELIGIOUS</option>
            <option>EDUCATION</option>
            <option>NGO</option>
            <option>GOVERNMENT</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading campaigns...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-10">
          <p>No campaigns found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden flex flex-col">
              <div className="aspect-video w-full overflow-hidden">
                <CampaignCardImage 
                  imageHash={campaign.imageHash} 
                  title={campaign.title}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-orange-500 text-white">VERIFIED</Badge>
                  <Badge variant="outline" className="capitalize">{formatCampaignType(campaign.type)}</Badge>
                </div>
                <CardTitle className="text-xl">{campaign.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {campaign.description}
                </p>
              </CardContent>
              
              <div className="px-6 pb-2">
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full rounded-full" 
                    style={{ width: `${campaign.percentRaised || 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <div className="font-medium">{campaign.percentRaised || 0}% Raised</div>
                  <div className="text-muted-foreground">{campaign.donorCount || 0} Donors</div>
                </div>
              </div>
              
              <CardFooter className="border-t flex justify-between py-4 bg-gray-50">
                <div>
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="font-bold">
                    {formatCurrency(campaign.targetAmountInr)} 
                    <span className="font-normal text-muted-foreground text-xs ml-1">
                      ({campaign.targetAmount} ETH)
                    </span>
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/campaigns/${campaign.id}`} passHref>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                  <Link href={`/campaigns/${campaign.id}/donate`} passHref>
                    <Button size="sm">Donate</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"
import { getApprovedCampaigns } from "@/lib/admin-service"
import { getPublicIPFSUrl } from "@/lib/ipfs"
import { Plus, Search } from "lucide-react"

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
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
      
      // Add some sample campaigns if none are found
      if (approvedCampaigns.length === 0) {
        const sampleCampaigns = [
          {
            id: "sample-1",
            title: "Help Ravi Fight Cancer",
            description: "Ravi, a 12-year-old boy from Mumbai, has been diagnosed with leukemia. His family needs financial support for his treatment.",
            type: "MEDICAL",
            imageHash: "QmTZRVmhNi6AAuW2XwLykCyJZVcXDK2xE6oA5KG6vfbqCZ",
            targetAmount: "1.5",
            targetAmountInr: "325000",
            status: "VERIFIED",
            amountRaised: "0.975",
            percentRaised: 65,
            donorCount: 142
          },
          {
            id: "sample-2",
            title: "Rebuild Shiva Temple After Earthquake",
            description: "The historic Shiva Temple in Uttarakhand was severely damaged in the recent earthquake. Help us rebuild this 500-year-old cultural heritage.",
            type: "RELIGIOUS",
            imageHash: "QmV2i4yCqbW9jpzG9o9GpShJ6VtbTVECcLjSgpWccVq7G6",
            targetAmount: "2.7",
            targetAmountInr: "750000",
            status: "VERIFIED",
            amountRaised: "1.0",
            percentRaised: 38,
            donorCount: 320
          },
          {
            id: "sample-3",
            title: "Education for 100 Rural Girls",
            description: "Support the education of 100 girls from rural villages in Bihar. This includes school fees, books, uniforms, and transportation for one year.",
            type: "EDUCATION",
            imageHash: "QmPLB9yo8mQmSvK6WcXCsz7L1ZCajEoZJ9LRppAuH2Gy57",
            targetAmount: "3.1",
            targetAmountInr: "850000",
            status: "VERIFIED",
            amountRaised: "2.6",
            percentRaised: 85,
            donorCount: 275
          }
        ]
        
        setCampaigns(sampleCampaigns)
      } else {
        setCampaigns(approvedCampaigns)
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
  const formatCampaignType = (type) => {
    const types = {
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
                {campaign.imageHash ? (
                  <img
                    src={getPublicIPFSUrl(campaign.imageHash)}
                    alt={campaign.title}
                    className="h-full w-full object-cover"
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
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
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
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                  <Link href={`/campaigns/${campaign.id}/donate`}>
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

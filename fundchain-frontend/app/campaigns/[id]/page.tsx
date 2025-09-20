"use client"

import React, { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, ExternalLink } from "lucide-react"

export default function CampaignDetailsPage({ params }: { params: any }) {
  const unwrappedParams = use(params) as any
  const campaignId = unwrappedParams.id
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching campaign with ID:', campaignId)
        
        // Check localStorage for campaigns
        const approvedCampaigns = localStorage.getItem('fundchain-approved-campaigns');
        const pendingCampaigns = localStorage.getItem('fundchain-pending-campaigns');
        let allCampaigns: any[] = [];
        
        if (approvedCampaigns) {
          allCampaigns.push(...JSON.parse(approvedCampaigns));
        }
        if (pendingCampaigns) {
          allCampaigns.push(...JSON.parse(pendingCampaigns));
        }
        
        let foundCampaign = allCampaigns.find(c => 
          c.id === campaignId || c.contractAddress === campaignId
        );
        
        if (!foundCampaign) {
          // Try sample campaigns
          const { getApprovedCampaigns } = await import('@/lib/admin-service');
          const sampleCampaigns = await getApprovedCampaigns();
          foundCampaign = sampleCampaigns.find(c => c.id === campaignId);
        }
        
        if (!foundCampaign) {
          setError(`Campaign "${campaignId}" not found.`);
          return;
        }
        
        // Enrich campaign data
        const enrichedCampaign = {
          ...foundCampaign,
          organizer: foundCampaign.organizer || {
            name: "Campaign Organizer",
            role: "Organizer",
            contact: "contact@example.com"
          },
          documentHashes: foundCampaign.documentHashes || foundCampaign.documentCids || [],
          imageHash: foundCampaign.imageHash || foundCampaign.imageCid || 'QmX2DiQ53iJAgWDXRCDyibXtnxpyRDdV1EbogtPAH88Hnk'
        };
        
        setCampaign(enrichedCampaign);
        
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setError('Failed to load campaign details.');
      } finally {
        setLoading(false);
      }
    };
    
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <p>Campaign not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={() => router.back()} variant="ghost" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Campaigns
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-orange-500 text-white">VERIFIED</Badge>
                <Badge variant="outline" className="capitalize">{campaign.type}</Badge>
              </div>
              <CardTitle className="text-2xl">{campaign.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Campaign Image */}
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                <img
                  src={`http://127.0.0.1:8080/ipfs/${campaign.imageHash}`}
                  alt={campaign.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/600x400/f97316/ffffff?text=Campaign+Image';
                  }}
                />
              </div>
              
              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{campaign.percentRaised || 0}%</span>
                </div>
                <Progress value={campaign.percentRaised || 0} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{campaign.raisedAmountInr || 0} raised</span>
                  <span>₹{campaign.targetAmountInr} goal</span>
                </div>
              </div>
              
              <p className="text-muted-foreground">{campaign.description}</p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="organizer">Organizer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About this Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{campaign.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Supporting Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaign.documentHashes && campaign.documentHashes.length > 0 ? (
                    <div className="space-y-4">
                      {campaign.documentHashes.map((hash: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-3 text-primary" />
                            <span className="font-medium">Document {index + 1}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = `http://127.0.0.1:8080/ipfs/${hash}`;
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No documents uploaded yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="organizer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{campaign.organizer?.name}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.organizer?.role}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                      <p className="text-sm">{campaign.organizer?.contact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="secondary" className="bg-green-500 text-white">VERIFIED</Badge>
              </div>
              <div className="flex justify-between">
                <span>Campaign Type:</span>
                <span className="capitalize">{campaign.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Donors:</span>
                <span>{campaign.donorCount || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

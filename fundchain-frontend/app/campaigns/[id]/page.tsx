"use client"

import React, { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCampaign, donateToCampaign } from "@/lib/contracts"
import { processDonation, loadRazorpaySDK, convertINRToETH } from "@/lib/razorpay"
import { processDonationFallback } from "@/lib/razorpay-fallback"
import { processDonationDirect } from "@/lib/razorpay-direct"
import RazorpayScript from "@/components/razorpay-script"
import ChunkErrorBoundary, { useChunkErrorHandler } from "@/components/chunk-error-boundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, DollarSign, FileText, Users, ExternalLink, CheckCircle, AlertCircle, Heart, CreditCard } from "lucide-react"

function CampaignDetailsPageContent({ params }: { params: any }) {
  const unwrappedParams = use(params) as any
  const campaignId = unwrappedParams.id
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [donationAmount, setDonationAmount] = useState("")
  const [isDonating, setIsDonating] = useState(false)
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [razorpayError, setRazorpayError] = useState<string | null>(null)

  // Use chunk error handler
  useChunkErrorHandler()

  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "overview"

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

  // Handle Razorpay script loading
  const handleRazorpayLoad = () => {
    setRazorpayLoaded(true);
    setRazorpayError(null);
    console.log('✅ Razorpay loaded via Script component');
  };

  const handleRazorpayError = (error: Error) => {
    setRazorpayLoaded(false);
    setRazorpayError(error.message);
    console.error('❌ Razorpay loading error:', error.message);
  };

  const handleDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    const amountINR = parseFloat(donationAmount);

    // Validate minimum amount (₹1)
    if (amountINR < 1) {
      alert('Minimum donation amount is ₹1');
      return;
    }

    // Validate maximum amount (reasonable limit)
    if (amountINR > 1000000) {
      alert('Maximum donation amount is ₹10,00,000');
      return;
    }

    const ethAmount = convertINRToETH(amountINR);

    try {
      setIsDonating(true);

      console.log(`💰 Starting donation process for ₹${amountINR} (${ethAmount} ETH)`);
      console.log('Campaign details:', { id: campaign.id, title: campaign.title });

      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Donation can only be processed in browser environment');
      }

      // Check if Razorpay is loaded
      if (!razorpayLoaded) {
        throw new Error(
          razorpayError ||
          'Payment gateway is not ready. Please wait for it to load or disable your ad blocker.'
        );
      }

      console.log('🚀 Processing donation...');

      let result;

      // Use direct payment method as primary (bypasses server-side issues)
      try {
        console.log('💳 Using direct payment method (recommended)...');
        result = await processDonationDirect({
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          amountINR,
          donorName: 'Anonymous Donor',
          donorEmail: 'donor@example.com'
        });
      } catch (directError: any) {
        console.warn('⚠️ Direct payment failed, trying server-side method:', directError.message);

        try {
          // Fallback to server-side order creation
          result = await processDonation({
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amountINR,
            donorName: 'Anonymous Donor',
            donorEmail: 'donor@example.com'
          });
        } catch (serverError: any) {
          console.warn('⚠️ Server-side payment also failed, trying final fallback:', serverError.message);

          // Final fallback method
          result = await processDonationFallback({
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amountINR,
            donorName: 'Anonymous Donor',
            donorEmail: 'donor@example.com'
          });
        }
      }

      console.log('✅ Donation successful:', result);

      // Update campaign data locally
      setCampaign((prev: any) => ({
        ...prev,
        amountRaised: (parseFloat(prev.amountRaised || '0') + parseFloat(ethAmount)).toString(),
        raisedAmountInr: (parseFloat(prev.raisedAmountInr || '0') + amountINR).toString(),
        percentRaised: Math.min(
          Math.round(((parseFloat(prev.amountRaised || '0') + parseFloat(ethAmount)) / parseFloat(prev.targetAmount)) * 100),
          100
        ),
        donorCount: (prev.donorCount || 0) + 1
      }));

      // Show success message
      alert(`🎉 Thank you for your donation of ₹${amountINR}!\n\nTransaction Hash: ${result.transactionHash}\n\nYour contribution will help make a difference.`);

      // Reset form
      setDonationAmount('');
      setShowDonationForm(false);

    } catch (error: any) {
      console.error('❌ Donation failed:', error);

      let errorMessage = 'An unexpected error occurred';
      if (error.message) {
        errorMessage = error.message;
      }

      // Show user-friendly error message
      if (errorMessage.includes('cancelled')) {
        alert('Payment was cancelled. You can try again anytime.');
      } else if (errorMessage.includes('Razorpay')) {
        alert(`Payment gateway error: ${errorMessage}\n\nPlease check your internet connection and try again.`);
      } else {
        alert(`Donation failed: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      }
    } finally {
      setIsDonating(false);
    }
  };

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
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{campaign.donorCount || 0} donors</span>
                  <span>{campaign.percentRaised || 0}% funded</span>
                </div>
              </div>

              <p className="text-muted-foreground">{campaign.description}</p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="w-full">
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
          {/* Donation Card */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Support This Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showDonationForm ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Help make a difference with your contribution
                    </p>
                    <Button
                      onClick={() => setShowDonationForm(true)}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      size="lg"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Donate Now
                    </Button>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    💳 Secure payments via Razorpay
                    <br />
                    🔗 Registered on blockchain
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Donation Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="Enter amount in INR (min ₹1)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="1"
                      max="1000000"
                      step="1"
                    />
                    {donationAmount && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ {convertINRToETH(parseFloat(donationAmount))} ETH
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDonation}
                      disabled={isDonating || !donationAmount || !razorpayLoaded}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      {isDonating ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border border-current border-t-transparent rounded-full" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4 mr-2" />
                          Donate ₹{donationAmount || '0'}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDonationForm(false);
                        setDonationAmount('');
                      }}
                      disabled={isDonating}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>🔒 Your payment is secure and encrypted</p>
                    <p>📧 You'll receive a confirmation email</p>
                    <p>🔗 Transaction will be recorded on blockchain</p>
                    {razorpayError && (
                      <p className="text-red-500">
                        ⚠️ Payment gateway blocked. Please disable ad blocker.
                      </p>
                    )}
                    {!razorpayLoaded && !razorpayError && (
                      <p className="text-yellow-600">
                        🔄 Loading payment gateway...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Statistics */}
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
              <div className="flex justify-between">
                <span>Target Amount:</span>
                <span>₹{campaign.targetAmountInr}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Raised:</span>
                <span className="font-semibold text-green-600">
                  ₹{campaign.raisedAmountInr || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Razorpay Script Component */}
      <RazorpayScript
        onLoad={handleRazorpayLoad}
        onError={handleRazorpayError}
      />
    </div>
  );
}

// Wrap the component with error boundary
export default function CampaignDetailsPage({ params }: { params: any }) {
  return (
    <ChunkErrorBoundary>
      <CampaignDetailsPageContent params={params} />
    </ChunkErrorBoundary>
  )
}

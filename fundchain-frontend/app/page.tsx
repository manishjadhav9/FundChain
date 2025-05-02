import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Heart, Shield, Zap } from "lucide-react"
import Image from "next/image"
import { CampaignCard } from "@/components/campaign-card"
import { featuredCampaigns } from "@/lib/data"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 -z-10" />
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  The future of transparent, blockchain-powered crowdfunding
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  FundChain aims to be the single gateway for all types of fundraising — trusted, transparent, and
                  simple.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/campaigns">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Explore Campaigns <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/campaigns/create">
                  <Button size="lg" variant="outline">
                    Start Fundraising
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Image
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=500&h=400&auto=format&fit=crop&q=60"
                alt="People helping each other"
                width={500}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Core Features</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Built with Blockchain Verification + Web2 UX for the best experience
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Verified Campaigns</h3>
                <p className="text-muted-foreground">
                  All campaigns are manually verified to ensure legitimacy and transparency.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Blockchain Powered</h3>
                <p className="text-muted-foreground">
                  Smart contracts ensure immutable record-keeping and trustless campaign execution.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Heart className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Multiple Causes</h3>
                <p className="text-muted-foreground">
                  Support various causes from medical emergencies to education and religious initiatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Campaigns</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Join thousands of donors supporting these worthy causes
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <Link href="/campaigns">
              <Button size="lg">
                View All Campaigns <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Campaign Types */}
      <section className="py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Supported Campaign Types</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                FundChain supports a wide range of fundraising initiatives
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center p-6 bg-background rounded-lg border shadow-sm">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-bold mb-2">Medical Emergencies</h3>
              <p className="text-center text-muted-foreground">Fund life-saving treatments and healthcare needs</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-lg border shadow-sm">
              <div className="text-4xl mb-4">🛕</div>
              <h3 className="text-xl font-bold mb-2">Religious Causes</h3>
              <p className="text-center text-muted-foreground">Support Temples, Churches, Mosques</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-lg border shadow-sm">
              <div className="text-4xl mb-4">🫶</div>
              <h3 className="text-xl font-bold mb-2">NGO Initiatives</h3>
              <p className="text-center text-muted-foreground">Fund social impact programs</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-lg border shadow-sm">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold mb-2">Government Projects</h3>
              <p className="text-center text-muted-foreground">Donate to public welfare programs</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-lg border shadow-sm">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-2">Education Support</h3>
              <p className="text-center text-muted-foreground">Empower students through scholarships and learning</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-lg border shadow-sm">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">Start Your Own</h3>
              <p className="text-center text-muted-foreground">Create a campaign for your unique cause</p>
              <Link href="/campaigns/create" className="mt-4">
                <Button variant="outline" size="sm">
                  Start Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Make a Difference?</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Join thousands of donors and campaign creators on FundChain
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button size="lg" variant="outline">
                  Browse Campaigns
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

import { Metadata } from "next"
import { CommunityFeed } from "@/components/community/CommunityFeed"
import { CommunityHeader } from "@/components/community/CommunityHeader"

export const metadata: Metadata = {
  title: "Community",
  description: "Connect with donors and beneficiaries in our fundraising community.",
}

export default function CommunityPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <CommunityHeader />
      <CommunityFeed />
    </div>
  )
} 
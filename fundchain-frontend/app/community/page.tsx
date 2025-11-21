"use client"

import { CommunityFeed } from "@/components/community/CommunityFeed"
import { CommunityHeader } from "@/components/community/CommunityHeader"

export default function CommunityPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <CommunityHeader />
            <div className="mt-8">
                <CommunityFeed />
            </div>
        </div>
    )
}

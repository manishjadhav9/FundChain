"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { useState } from "react"

type Post = {
  id: string
  author: {
    name: string
    image: string
    role: string
  }
  content: string
  campaign?: {
    title: string
    link: string
  }
  likes: number
  comments: number
  timestamp: string
}

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: {
      name: "Sarah Johnson",
      image: "/avatars/sarah.jpg",
      role: "Campaign Creator"
    },
    content: "Thank you to everyone who supported our education campaign! We've reached 75% of our goal, and the impact is already visible in our community. Here's a quick update on how your donations are helping...",
    campaign: {
      title: "Education for All Initiative",
      link: "/campaigns/education-for-all"
    },
    likes: 24,
    comments: 5,
    timestamp: "2h ago"
  },
  {
    id: "2",
    author: {
      name: "Manish Jadhav",
      image: "/avatars/michael.jpg",
      role: "Donor"
    },
    content: "Just contributed to my third campaign this month! It's amazing to see how our community comes together to support meaningful causes. The transparency of blockchain makes it even better.",
    likes: 15,
    comments: 3,
    timestamp: "5h ago"
  }
]

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={post.author.image} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold">{post.author.name}</h4>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">{post.author.role}</span>
                </div>
                <p className="text-sm text-muted-foreground">{post.timestamp}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{post.content}</p>
            {post.campaign && (
              <a
                href={post.campaign.link}
                className="mt-4 block rounded-lg border bg-muted/50 p-4 hover:bg-muted"
              >
                <h5 className="font-semibold">{post.campaign.title}</h5>
                <p className="text-sm text-muted-foreground">View Campaign →</p>
              </a>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">
                <Heart className="mr-2 h-4 w-4" />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                {post.comments}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 
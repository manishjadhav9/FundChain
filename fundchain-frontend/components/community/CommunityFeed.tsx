"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Trash2, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

type Comment = {
  id: string
  author: {
    name: string
    image: string
    role: string
  }
  content: string
  timestamp: string
  replies: Comment[]
}

type Post = {
  id: string
  author: {
    name: string
    image: string
    role: string
  }
  content: string
  image?: string
  campaign?: {
    title: string
    link: string
  }
  likes: number
  isLiked: boolean
  comments: Comment[]
  timestamp: string
}

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: {
      name: "Sarah Johnson",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      role: "Campaign Creator"
    },
    content: "Thank you to everyone who supported our education campaign! We've reached 75% of our goal, and the impact is already visible in our community. Here's a quick update on how your donations are helping...",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=60",
    campaign: {
      title: "Education for All Initiative",
      link: "/campaigns/education-for-all"
    },
    likes: 24,
    isLiked: false,
    comments: [
      {
        id: "c1",
        author: {
          name: "Michael Chen",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
          role: "Donor"
        },
        content: "This is wonderful news! So happy to see the progress.",
        timestamp: "1h ago",
        replies: []
      }
    ],
    timestamp: "2h ago"
  },
  {
    id: "2",
    author: {
      name: "Manish Jadhav",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manish",
      role: "Donor"
    },
    content: "Just contributed to my third campaign this month! It's amazing to see how our community comes together to support meaningful causes. The transparency of blockchain makes it even better.",
    likes: 15,
    isLiked: true,
    comments: [],
    timestamp: "5h ago"
  },
  {
    id: "3",
    author: {
      name: "Green Earth NGO",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Green",
      role: "Organization"
    },
    content: "Our tree planting drive was a massive success! 500 saplings planted today. 🌳🌍 #GreenEarth #Sustainability",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60",
    likes: 89,
    isLiked: false,
    comments: [
      {
        id: "c2",
        author: {
          name: "Alice Smith",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
          role: "Volunteer"
        },
        content: "It was a great day! Can't wait for the next one.",
        timestamp: "30m ago",
        replies: [
          {
            id: "c3",
            author: {
              name: "Green Earth NGO",
              image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Green",
              role: "Organization"
            },
            content: "Thanks for joining us Alice!",
            timestamp: "15m ago",
            replies: []
          }
        ]
      }
    ],
    timestamp: "6h ago"
  }
]

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({})
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)

  useEffect(() => {
    // Load posts from localStorage
    const loadPosts = () => {
      try {
        const storedPosts = localStorage.getItem('fundchain-community-posts')
        let localPosts: Post[] = []
        if (storedPosts) {
          localPosts = JSON.parse(storedPosts)
        }
        // Merge local posts with mock posts (local posts first)
        setPosts([...localPosts, ...MOCK_POSTS])
      } catch (error) {
        console.error('Failed to load posts:', error)
        setPosts(MOCK_POSTS)
      }
    }

    loadPosts()

    // Listen for storage events to update feed in real-time
    window.addEventListener('storage', loadPosts)
    return () => window.removeEventListener('storage', loadPosts)
  }, [])

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        }
      }
      return post
    }))
  }

  const handleComment = (postId: string) => {
    const content = commentInputs[postId]
    if (!content?.trim()) return

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Date.now().toString(),
              author: {
                name: "You",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
                role: "User"
              },
              content: content,
              timestamp: "Just now",
              replies: []
            }
          ]
        }
      }
      return post
    }))
    setCommentInputs({ ...commentInputs, [postId]: "" })
  }

  const handleReply = (postId: string, commentId: string) => {
    const content = replyInputs[commentId]
    if (!content?.trim()) return

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [
                  ...comment.replies,
                  {
                    id: Date.now().toString(),
                    author: {
                      name: "You",
                      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
                      role: "User"
                    },
                    content: content,
                    timestamp: "Just now",
                    replies: []
                  }
                ]
              }
            }
            return comment
          })
        }
      }
      return post
    }))
    setReplyInputs({ ...replyInputs, [commentId]: "" })
    setActiveReplyId(null)
  }

  const handleDeleteComment = (postId: string, commentId: string, replyId?: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (replyId) {
          // Delete reply
          return {
            ...post,
            comments: post.comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: comment.replies.filter(reply => reply.id !== replyId)
                }
              }
              return comment
            })
          }
        } else {
          // Delete top-level comment
          return {
            ...post,
            comments: post.comments.filter(comment => comment.id !== commentId)
          }
        }
      }
      return post
    }))
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {posts.map((post) => (
        <Card key={post.id} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center space-y-0 p-4">
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={post.author.image} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold cursor-pointer hover:underline">{post.author.name}</p>
                <span className="text-xs text-muted-foreground">• {post.timestamp}</span>
              </div>
              <p className="text-xs text-muted-foreground">{post.author.role}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {post.image && (
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={post.image}
                  alt="Post content"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-4 space-y-3">
              <p className="text-sm leading-relaxed">{post.content}</p>
              {post.campaign && (
                <a
                  href={post.campaign.link}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium">{post.campaign.title}</h5>
                    <p className="text-xs text-muted-foreground">View Campaign →</p>
                  </div>
                </a>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col p-4 pt-0 gap-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-2 px-2", post.isLiked && "text-red-500 hover:text-red-600")}
                  onClick={() => handleLike(post.id)}
                >
                  <Heart className={cn("h-5 w-5", post.isLiked && "fill-current")} />
                  <span className="font-medium">{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{post.comments.reduce((acc, curr) => acc + 1 + curr.replies.length, 0)}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="w-full space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex gap-3 group">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.image} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button
                          className="text-xs text-muted-foreground hover:text-primary font-medium"
                          onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                        >
                          Reply
                        </button>
                        <button
                          className="text-xs text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteComment(post.id, comment.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 pl-11 group">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={reply.author.image} />
                        <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{reply.author.name}</span>
                          <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                        <button
                          className="text-xs text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteComment(post.id, comment.id, reply.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Reply Input */}
                  {activeReplyId === comment.id && (
                    <div className="flex gap-2 pl-11 pt-2">
                      <Input
                        placeholder={`Reply to ${comment.author.name}...`}
                        value={replyInputs[comment.id] || ""}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleReply(post.id, comment.id)
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReply(post.id, comment.id)}
                        disabled={!replyInputs[comment.id]?.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <div className="flex gap-3 items-center pt-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <Input
                  placeholder="Add a comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  className="pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleComment(post.id)
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => handleComment(post.id)}
                  disabled={!commentInputs[post.id]?.trim()}
                >
                  <Send className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 
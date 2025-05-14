"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Users } from "lucide-react"

export function CommunityHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Community</h2>
          <p className="text-sm text-muted-foreground">
            Connect with donors and beneficiaries, share stories, and make an impact together.
          </p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts..." className="pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="updates">Campaign Updates</SelectItem>
            <SelectItem value="stories">Success Stories</SelectItem>
            <SelectItem value="discussions">Discussions</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 
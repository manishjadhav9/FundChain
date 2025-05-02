"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { allCampaigns } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, FileText, Search, Shield, Users } from "lucide-react"

// Mock data for organizations pending verification
const pendingOrganizations = [
  {
    id: "org1",
    name: "Hope Foundation",
    type: "NGO",
    email: "contact@hopefoundation.org",
    phone: "+91 9876543210",
    address: "123 Main Street, Mumbai, Maharashtra",
    documents: [
      { name: "Registration Certificate", url: "#" },
      { name: "Tax Exemption Certificate", url: "#" },
      { name: "Bank Statement", url: "#" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-15T10:00:00Z",
  },
  {
    id: "org2",
    name: "Shiva Temple Trust",
    type: "RELIGIOUS",
    email: "info@shivatemple.org",
    phone: "+91 9876543211",
    address: "456 Temple Road, Varanasi, Uttar Pradesh",
    documents: [
      { name: "Trust Registration", url: "#" },
      { name: "Temple Ownership Proof", url: "#" },
      { name: "Bank Statement", url: "#" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-16T14:30:00Z",
  },
  {
    id: "org3",
    name: "Rural Education Initiative",
    type: "NGO",
    email: "contact@ruraledu.org",
    phone: "+91 9876543212",
    address: "789 Village Road, Patna, Bihar",
    documents: [
      { name: "NGO Registration", url: "#" },
      { name: "Project Proposal", url: "#" },
      { name: "Bank Statement", url: "#" },
    ],
    status: "PENDING",
    submittedAt: "2024-04-17T09:15:00Z",
  },
]

export default function AdminVerificationsPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [organizations, setOrganizations] = useState(pendingOrganizations)

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/admin/verifications")
    } else if (!isAdmin) {
      router.push("/dashboard")
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      })
    }
  }, [user, isAdmin, router, toast])

  if (!user || !isAdmin) {
    return null
  }

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || org.type === typeFilter

    return matchesSearch && matchesType
  })

  const handleVerifyOrganization = (id: string) => {
    setOrganizations(organizations.filter((org) => org.id !== id))
    toast({
      title: "Organization Verified",
      description: "The organization has been verified successfully",
    })
  }

  const handleRejectOrganization = (id: string) => {
    setOrganizations(organizations.filter((org) => org.id !== id))
    toast({
      title: "Organization Rejected",
      description: "The organization has been rejected",
      variant: "destructive",
    })
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Organization Verifications</h1>
          <p className="text-muted-foreground">Review and verify organization applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search organizations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="NGO">NGO</SelectItem>
            <SelectItem value="RELIGIOUS">Religious</SelectItem>
            <SelectItem value="GOVERNMENT">Government</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrganizations.map((org) => (
            <Card key={org.id}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">{org.name}</h3>
                      <Badge variant="secondary">{org.status}</Badge>
                      <Badge variant="outline">{org.type}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Email: {org.email}</p>
                      <p>Phone: {org.phone}</p>
                      <p>Address: {org.address}</p>
                      <p>Submitted: {new Date(org.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Documents</h4>
                      <div className="flex flex-wrap gap-2">
                        {org.documents.map((doc, index) => (
                          <Link key={index} href={doc.url}>
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              {doc.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 justify-center">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => handleVerifyOrganization(org.id)}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Verify Organization
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleRejectOrganization(org.id)}
                    >
                      Reject Application
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No pending verifications</CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  )
} 
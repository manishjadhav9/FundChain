export type Campaign = {
  id: string
  title: string
  description: string
  image: string | null
  targetAmount: number
  amountRaised: number
  donorsCount: number
  createdAt: string
  updatedAt: string
  status: "OPEN" | "VERIFIED" | "CLOSED"
  type: "MEDICAL" | "RELIGIOUS" | "NGO" | "GOVERNMENT" | "EDUCATION" | "OTHER"
  organizerId: string
  organizer: {
    name: string
    image: string | null
  }
  milestones: Milestone[]
}

export type Milestone = {
  id: string
  title: string
  description: string
  targetAmount: number
  isCompleted: boolean
  campaignId: string
}

export type Donation = {
  id: string
  amount: number
  createdAt: string
  campaignId: string
  userId: string
  campaign: {
    title: string
    image: string | null
  }
  transactionId: string
  status: "COMPLETED" | "PENDING" | "FAILED"
}

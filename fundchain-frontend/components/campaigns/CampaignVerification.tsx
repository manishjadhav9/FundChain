"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react"

type VerificationStep = {
  id: number
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "failed"
}

const initialSteps: VerificationStep[] = [
  {
    id: 1,
    title: "Document Verification",
    description: "Upload and verify required documents",
    status: "pending"
  },
  {
    id: 2,
    title: "Smart Contract Deployment",
    description: "Deploy campaign smart contract",
    status: "pending"
  },
  {
    id: 3,
    title: "Blockchain Verification",
    description: "Verify campaign on blockchain",
    status: "pending"
  }
]

export function CampaignVerification() {
  const [steps, setSteps] = useState<VerificationStep[]>(initialSteps)
  const [currentStep, setCurrentStep] = useState(0)
  const [verificationTx, setVerificationTx] = useState<string>("")

  const startVerification = async () => {
    // Simulate verification process
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: "in-progress" } : step
      ))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: "completed" } : step
      ))
    }
    
    // Set verification transaction hash
    setVerificationTx("0x1234...5678")
  }

  const getStepIcon = (status: VerificationStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <ShieldCheck className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Campaign Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="mt-1">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Progress value={(currentStep / (steps.length - 1)) * 100} />

        {verificationTx ? (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">Verification Complete!</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Transaction Hash: {verificationTx}
            </p>
          </div>
        ) : (
          <Button 
            onClick={startVerification}
            disabled={currentStep > 0}
            className="w-full"
          >
            Start Verification Process
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 
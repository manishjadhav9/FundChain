"use client"

import type React from "react"

import { createContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { getUserAvatar } from "@/lib/constants"

type User = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: "donor" | "ngo" | "admin"
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
  isNGO: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const isAdmin = user?.role === "admin"
  const isNGO = user?.role === "ngo"

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("fundchain-user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      
      // Only redirect on initial mount if on the root dashboard
      if (window.location.pathname === "/dashboard") {
        const redirectPath = parsedUser.role === "admin" 
          ? "/admin" 
          : parsedUser.role === "ngo" 
            ? "/dashboard/ngo" 
            : null
        
        if (redirectPath) {
          router.replace(redirectPath)
        }
      }
    }
  }, []) // Remove router dependency to prevent re-runs

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Dummy login credentials
      const dummyUsers = {
        "admin@fundchain.com": {
          id: "admin-1",
          name: "Admin User",
          email: "admin@fundchain.com",
          image: getUserAvatar("admin"),
          role: "admin",
        },
        "ngo@fundchain.com": {
          id: "ngo-1",
          name: "NGO User",
          email: "ngo@fundchain.com",
          image: getUserAvatar("ngo"),
          role: "ngo",
        },
        "donor@fundchain.com": {
          id: "donor-1",
          name: "Donor User",
          email: "donor@fundchain.com",
          image: getUserAvatar("donor"),
          role: "donor",
        },
      }

      const dummyUser = dummyUsers[email as keyof typeof dummyUsers]
      
      if (dummyUser && password === "password") {
        setUser(dummyUser)
        localStorage.setItem("fundchain-user", JSON.stringify(dummyUser))
        toast({
          title: "Login successful",
          description: `Welcome back, ${dummyUser.name}!`,
        })
        
        // Redirect based on user role
        const redirectPath = dummyUser.role === "admin" 
          ? "/admin" 
          : dummyUser.role === "ngo" 
            ? "/dashboard/ngo" 
            : "/dashboard"
        
        router.replace(redirectPath)
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      })
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("fundchain-user")
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, logout, isAdmin, isNGO }}>{children}</AuthContext.Provider>
}

export { AuthContext }

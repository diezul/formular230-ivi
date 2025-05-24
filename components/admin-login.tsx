"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyAdminPassword } from "@/app/actions"

interface AdminLoginProps {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log("Admin login attempt with password:", password)

    try {
      const isValid = await verifyAdminPassword(password)

      if (isValid) {
        console.log("Password correct, logging in...")
        localStorage.setItem("admin_authenticated", "true")
        onLogin()
      } else {
        setError("Parolă incorectă")
      }
    } catch (error) {
      console.error("Error verifying password:", error)
      setError("Eroare la verificarea parolei")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-800">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Parolă</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduceți parola"
                required
                disabled={isLoading}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={isLoading}>
              {isLoading ? "Se verifică..." : "Autentificare"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

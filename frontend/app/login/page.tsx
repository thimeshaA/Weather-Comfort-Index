"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaToken, setMfaToken] = useState<string | null>(null)
  const [oobCode, setOobCode] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [info, setInfo] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Call the login API endpoint
      const response = await fetch('/api/auth/login-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data?.mfaRequired) {
        // Start MFA flow: request Auth0 to email a verification code
        setMfaRequired(true)
        setMfaToken(data.mfaToken)
        setInfo("Sending verification code to your email...")
        try {
          const challengeResp = await fetch('/api/auth/mfa/challenge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mfaToken: data.mfaToken, userEmail: data.userEmail || email }),
          })
          const challengeData = await challengeResp.json()
          console.log('Challenge response:', challengeData)
          if (challengeResp.ok) {
            setOobCode(challengeData.oobCode || null)
            setInfo("Verification code sent. Please check your inbox.")
          } else {
            setError(`${challengeData.error || 'Failed to start MFA challenge'}: ${challengeData.details || ''}`)
            setInfo("")
          }
        } catch (err) {
          console.error('Challenge error:', err)
          setError('Failed to start MFA challenge: ' + String(err))
          setInfo("")
        }
      } else if (response.ok) {
        // Redirect to dashboard on success
        window.location.href = '/dashboard'
      } else {
        setError(data.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setIsLoading(true)
    try {
      const resp = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, oobCode, otp: otpCode }),
      })

      const data = await resp.json()
      if (resp.ok) {
        window.location.href = '/dashboard'
      } else {
        setError(data.error || 'Invalid or expired code')
      }
    } catch (err) {
      setError('An error occurred verifying the code.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendMfa = async () => {
    if (!mfaToken) return
    setError("")
    setInfo("Resending verification code...")
    try {
      const challengeResp = await fetch('/api/auth/mfa/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, userEmail: email }),
      })
      const challengeData = await challengeResp.json()
      if (challengeResp.ok) {
        setOobCode(challengeData.oobCode || null)
        setInfo("New code sent. Check your inbox and spam folder.")
      } else {
        setError(challengeData.error || 'Failed to resend code')
        setInfo("")
      }
    } catch (err) {
      setError('Failed to resend code')
      setInfo("")
    }
  }

  const handleCancelMfa = () => {
    setMfaRequired(false)
    setMfaToken(null)
    setOobCode(null)
    setOtpCode("")
    setError("")
    setInfo("")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <Image
              src="/logo-WCI.png"
              alt="WCI Logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground text-center">Weather Comfort Index</h1>
          <p className="text-muted-foreground text-center text-sm">
            Sign in to view real-time comfort ranking across cities
          </p>
        </div>

        {/* Login Form or MFA Step */}
        {!mfaRequired ? (
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
        ) : (
        <form onSubmit={handleVerifyMfa} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium">
              Enter the verification code sent to your email
            </Label>
            <div className="relative">
              <Input
                id="otp"
                type="text"
                placeholder="6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                disabled={isLoading}
                className="pl-3 h-12"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Info Message */}
          {info && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary">{info}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={handleResendMfa} className="text-primary underline underline-offset-4">
              Resend code
            </button>
            <button type="button" onClick={handleCancelMfa} className="text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Didn’t get the code? Check your spam folder or retry login.
          </p>
        </form>
        )}

      </div>
    </div>
  )
}

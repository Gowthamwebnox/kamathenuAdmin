"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
// import Link from "next/link"
// import {logo} from '../../../../public/assets/login_avatar.webp'
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axiosInstance from "@/app/utils/axiosInstance"
import { useUserStore } from "@/app/(stateManagement)/userStore"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const errorParam = searchParams.get("error") || ""
  const { data: session, status } = useSession()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(errorParam)
  const { user, setUser, clearUser } = useUserStore();
  useEffect(() => {
   
    if (status === "authenticated") {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")


      // const result = await signIn("credentials", {
      //   email,
      //   password,
      //   redirect: false,
      // })
      const result: any = await axiosInstance.post('/auth/login', {
        email,
        password,
      })
      if (result.status === 200) {
        {
          const userData = result.data;
        setUser({
            userId:userData.user.id,
            userToken:userData.Token,
            userName:userData.user.name,
            userEmail:userData.user.email,
          })
        }
        router.push(callbackUrl)
        router.refresh()
      } 
          }

  if (status === "loading") {
      return (
        <div className="flex min-h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )
    }

    if (status === "authenticated") {
      return null // Will redirect in useEffect
    }

    return (
      <div className="flex min-h-screen w-full">
        <div className="hidden w-1/3 flex-col p-10 text-white lg:flex"
          style={{
            backgroundImage: "url('/assets/login_background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
          <div className="flex h-full flex-col justify-center">
            <h1 className="text-4xl font-bold text-center " >Hi Welcome back</h1>
            <p className="mt-4 text-lg text-gray-200 text-center">Track your daily stats and stay ahead!</p>

            <div className="mt-8 flex justify-center">
              <Image
                src="/assets/login_avatar.webp"
                alt="Analytics illustration"
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-2/3">
          <div className="mb-8 text-center flex items-center ">
            <Image
              src="/assets/kamathenuLogo.png"
              alt="MakeItEasy.com"
              width={100}
              height={50}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold text-center text-gray-800" >Kamathenu</h1>

          </div>

          <div className="w-full max-w-md">
            <h2 className="mb-8 text-center text-2xl font-bold">Sign to your account</h2>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@gmail.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-14 rounded-full border-gray-200 px-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-600">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-14 rounded-full border-gray-200 px-6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    <span className="sr-only">Toggle password visibility</span>
                  </button>
                </div>
              </div>

              {/* <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-red-600 hover:text-red-800">
                Forgot Password
              </Link>
            </div> */}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-14 w-full rounded-full bg-blue-500 text-lg font-medium hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  export default function LoginPage() {
    return (
      <Suspense fallback={
        <div className="flex min-h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    )
  }

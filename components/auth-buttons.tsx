"use client"

import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { buttonVariants } from "@/components/ui/button"

export function AuthButtons() {
  return (
    <>
      <SignInButton mode="modal" className={buttonVariants({ variant: "outline" })}>
        Sign In
      </SignInButton>
      <SignUpButton mode="modal" className={buttonVariants({ variant: "default" })}>
        Sign Up
      </SignUpButton>
    </>
  )
}

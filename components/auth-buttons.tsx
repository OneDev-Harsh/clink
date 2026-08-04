"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AuthButtons() {
  return (
    <>
      <Button variant="outline" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    </>
  )
}

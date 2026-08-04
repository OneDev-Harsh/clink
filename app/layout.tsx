import { ClerkProvider, Show, UserButton } from "@clerk/nextjs"
import { Geist, Geist_Mono } from "next/font/google"
import { shadcn } from "@clerk/ui/themes"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { AuthButtons } from "@/components/auth-buttons"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <header className="flex items-center justify-end gap-2 p-4">
            <Show when="signed-out">
              <AuthButtons />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

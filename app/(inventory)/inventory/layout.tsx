import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./inventory.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "Inventory",
  description: "Med spa inventory",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Inventory", statusBarStyle: "default" },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
}

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}

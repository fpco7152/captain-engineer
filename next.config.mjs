/** @type {import('next').NextConfig} */
const supabaseHost = "epbpfkkktwwvblnzxenm.supabase.co"

const inventoryHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
]

if (process.env.NODE_ENV === "production") {
  inventoryHeaders.push({
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "media-src 'self' blob: mediastream:",
      "font-src 'self' data:",
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  })
}

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    if (process.env.INVENTORY_ONLY !== "1") return []
    // On the inventory deployment, every other page sends visitors to the sign-in screen.
    return [
      { source: "/", destination: "/inventory", permanent: false },
      { source: "/:path((?!inventory|_next/).*)", destination: "/inventory", permanent: false },
    ]
  },
  async headers() {
    return [{ source: "/inventory/:path*", headers: inventoryHeaders }]
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      'https://npifftnpuajpkgnysexo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      '',
    NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL:
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      'http://localhost:3000/auth/callback',
  },
}

export default nextConfig

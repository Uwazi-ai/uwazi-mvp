import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono, Oswald } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

// Using Oswald as a temporary display font until the custom Axis Extrabold font is uploaded
// To use the custom font, upload "Axis Extrabold.otf" to /app/fonts/ and uncomment the localFont import
const axisDisplay = Oswald({
  subsets: ['latin'],
  variable: '--font-axis',
  display: 'swap',
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'UWAZI - Understand What\'s Shaping Your Community',
  description: 'UWAZI helps you understand legislation, policy, and civic issues in plain English. Track bills, ask questions, and stay informed about what matters to your community.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} ${axisDisplay.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

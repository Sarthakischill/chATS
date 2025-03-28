import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume',
  description: 'AI-powered resume analysis and optimization tool',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
    other: {
      rel: 'mask-icon',
      url: '/favicon.svg',
      color: '#F97316',
    },
  },
  manifest: '/manifest.json',
  themeColor: '#F97316',
  viewport: 'width=device-width, initial-scale=1',
} 
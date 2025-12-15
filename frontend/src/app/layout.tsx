import { CurrencyProvider } from '@/context/CurrencyContext'
import { LanguageProvider } from '@/context/LanguageContext'
import '@/styles/tailwind.css'
import { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import 'rc-slider/assets/index.css'
import ThemeProvider from './theme-provider'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://dailyguest.online'),
  title: {
    template: '%s - DailyGuest',
    default: 'DailyGuest - Rezervări apartamente Cluj-Napoca, Baia Mare, Oradea',
  },
  description: 'Rezervă apartamente de vacanță în Cluj-Napoca, Baia Mare și Oradea. Prețuri accesibile, rezervare rapidă și sigură. Peste 50 de apartamente disponibile.',
  keywords: ['rezervari apartamente', 'cazare Cluj-Napoca', 'apartamente Baia Mare', 'cazare Oradea', 'inchiriere apartamente Romania', 'booking apartamente', 'cazare ieftina Cluj', 'apartamente vacanta'],
  authors: [{ name: 'DailyGuest' }],
  icons: {
    icon: '/logos.svg',
    shortcut: '/logos.svg',
    apple: '/logos.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://dailyguest.online',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={poppins.className} suppressHydrationWarning>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <LanguageProvider>
          <CurrencyProvider>
            <ThemeProvider>
              <div>{children}</div>
            </ThemeProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

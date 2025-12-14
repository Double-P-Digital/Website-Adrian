'use client'

import Logo from '@/shared/Logo'
import { useT } from '@/hooks/useT'

import type { JSX } from 'react'

const navigation: {
  // solutions: { name: string; href: string }[]
  // support: { name: string; href: string }[]
  company: { name: string; href: string }[]
  legal: { name: string; href: string }[]
} = {
  // solutions: [
  //   { name: 'Marketing', href: '#' },
  //   { name: 'Analytics', href: '#' },
  //   { name: 'Automation', href: '#' },
  //   { name: 'Commerce', href: '#' },
  // ],
  // support: [
  //   { name: 'Submit ticket', href: '#' },
  //   { name: 'Documentation', href: '#' },
  //   { name: 'Guides', href: '#' },
  // ],
  company: [
    { name: 'About', href: '/about' },
    // { name: 'Blog', href: '#' },
    // { name: 'Jobs', href: '#' },
    // { name: 'Press', href: '#' },
  ],
  legal: [
    { name: 'Terms and conditions', href: '/terms' },
    // { name: 'Privacy policy', href: '#' },
    // { name: 'License', href: '#' },
    // { name: 'Insights', href: '#' },
  ],
}

export default function Footer2() {
  const T = useT()
  
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-700">
      <div className="container py-8 lg:py-10">
        {/* Desktop: Single row layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Logo and description */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Logo className="w-16 shrink-0" />
            <p className="hidden text-sm text-gray-600 lg:block dark:text-neutral-400">
              {T.Footer['Making the world a better place']}
            </p>
          </div>
          
          {/* Links - labels on top, links below */}
          <div className="flex gap-12">
            {/* Company column */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-500">{T.Footer.Company}</span>
              {navigation.company.map((item) => (
                <a key={item.name} href={item.href} className="text-sm text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white">
                  {T.Footer[item.name as keyof typeof T.Footer] || item.name}
                </a>
              ))}
            </div>
            {/* Legal column */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-500">{T.Footer.Legal}</span>
              {navigation.legal.map((item) => (
                <a key={item.name} href={item.href} className="text-sm text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white">
                  {T.Footer[item.name as keyof typeof T.Footer] || item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-6 border-t border-gray-200 pt-6 lg:mt-8 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 lg:text-left dark:text-neutral-500">
            {T.Footer.Copyright} {T.Footer['All rights reserved']}
          </p>
        </div>
      </div>
    </footer>
  )
}

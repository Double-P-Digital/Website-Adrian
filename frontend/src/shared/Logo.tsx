import Link from 'next/link'
import React from 'react'
import LogoSvg from './LogoSvg'

interface LogoProps {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = 'w-28 sm:w-40' }) => {
  return (
    <Link href="/" className={`inline-block text-primary-600 focus:ring-0 focus:outline-hidden ${className}`}>
      <LogoSvg />
    </Link>
  )
}

export default Logo

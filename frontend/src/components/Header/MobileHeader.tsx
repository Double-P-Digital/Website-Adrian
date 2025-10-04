import Logo from '@/shared/Logo'

const MobileHeader = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm lg:hidden dark:bg-neutral-900">
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo on the left */}
          <div className="shrink-0">
            <Logo />
          </div>
          
          {/* Search icon/button on the right */}
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Search
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileHeader

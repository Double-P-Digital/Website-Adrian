import Logo from '@/shared/Logo'

const MobileHeader = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm lg:hidden dark:bg-neutral-900 pb-2">
      <div className="container">
        <div className="flex h-24 items-center justify-between gap-4">
          <div className="shrink-0" style={{ height: '90px' }}>
            <Logo className="h-full w-auto" />
          </div>
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Search
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileHeader

import { Suspense } from 'react'
import PayDoneClient from './PayDoneClient'

const Page = () => {
  return (
    <Suspense fallback={
      <main className="container mt-10 mb-24 sm:mt-16 lg:mb-32">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-12 px-0 sm:rounded-2xl sm:p-6 xl:p-8">
          <div className="animate-pulse">
            <div className="h-12 w-64 rounded bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="mt-6 h-48 w-full rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        </div>
      </main>
    }>
      <PayDoneClient initialTranslations={null} />
    </Suspense>
  )
}

export default Page

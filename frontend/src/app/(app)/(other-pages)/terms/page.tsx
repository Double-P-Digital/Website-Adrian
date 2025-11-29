'use client'

import BgGlassmorphism from '@/components/BgGlassmorphism'
import { useT } from '@/hooks/useT'

const TermsPage = () => {
  const T = useT()
  return (
    <div className="relative overflow-hidden">
      <BgGlassmorphism />

      <div className="container flex flex-col gap-y-8 py-16 lg:gap-y-12 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white lg:text-4xl">
            {T.termsPage.title}
          </h1>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
            {T.termsPage['Last updated']}: <span suppressHydrationWarning>{new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>

          <div className="mt-12 space-y-8 text-neutral-700 dark:text-neutral-300">
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">{T.termsPage['1. Introduction']}</h2>
              <p className="mt-4 leading-relaxed">
                {T.termsPage['Introduction text']}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">{T.termsPage['2. Data Storage and Personal Information']}</h2>
              <p className="mt-4 leading-relaxed">
                <strong>{T.termsPage['2.1 Collection of Personal Data']}</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                {T.termsPage['Collection text']}
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>{T.termsPage['Name and contact information']}</li>
                <li>{T.termsPage['Payment information']}</li>
                <li>{T.termsPage['Booking and reservation details']}</li>
                <li>{T.termsPage['Travel preferences and requirements']}</li>
                <li>{T.termsPage['Communication records and correspondence']}</li>
              </ul>

              <p className="mt-6 leading-relaxed">
                <strong>{T.termsPage['2.2 Purpose of Data Storage']}</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                {T.termsPage['Purpose text']}
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>{T.termsPage['To process and manage your bookings']}</li>
                <li>{T.termsPage['To communicate with you']}</li>
                <li>{T.termsPage['To provide customer support']}</li>
                <li>{T.termsPage['To comply with legal obligations']}</li>
                <li>{T.termsPage['To improve our services']}</li>
              </ul>

              <p className="mt-6 leading-relaxed">
                <strong>{T.termsPage['2.3 Data Security']}</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                {T.termsPage['Security text']}
              </p>

              <p className="mt-6 leading-relaxed">
                <strong>{T.termsPage['2.4 Data Retention']}</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                {T.termsPage['Retention text']}
              </p>

              <p className="mt-6 leading-relaxed">
                <strong>{T.termsPage['2.5 Your Rights']}</strong>
              </p>
              <p className="mt-2 leading-relaxed">
                {T.termsPage['Rights text']}
              </p>
              <ul className="mt-4 ml-6 list-disc space-y-2">
                <li>{T.termsPage['Access your personal data']}</li>
                <li>{T.termsPage['Request correction']}</li>
                <li>{T.termsPage['Request deletion']}</li>
                <li>{T.termsPage['Object to processing']}</li>
                <li>{T.termsPage['Request restriction']}</li>
                <li>{T.termsPage['Data portability']}</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                {T.termsPage['Rights contact text']}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">{T.termsPage['3. Use of Services']}</h2>
              <p className="mt-4 leading-relaxed">
                {T.termsPage['Use of Services text']}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">{T.termsPage['4. Booking and Reservations']}</h2>
              <p className="mt-4 leading-relaxed">
                {T.termsPage['Booking text']}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">{T.termsPage['5. Limitation of Liability']}</h2>
              <p className="mt-4 leading-relaxed">
                {T.termsPage['Liability text']}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">{T.termsPage['6. Changes to Terms']}</h2>
              <p className="mt-4 leading-relaxed">
                {T.termsPage['Changes text']}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">{T.termsPage['7. Contact Information']}</h2>
              <p className="mt-4 leading-relaxed">
                {T.termsPage['Contact text']}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage






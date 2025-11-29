import BackgroundSection from '@/components/BackgroundSection'
import BgGlassmorphism from '@/components/BgGlassmorphism'
import { Metadata } from 'next'
import SectionHero from './SectionHero'
import SectionMission from './SectionMission'
import SectionValues from './SectionValues'
import SectionHowItWorks from './SectionHowItWorks'
import SectionStatistic from './SectionStatistic'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Our apartment booking platform provides a simple and secure experience for finding and booking the perfect accommodations.',
}

const PageAbout = () => {
  return (
    <div className="relative overflow-hidden">
      {/* ======== BG GLASS ======== */}
      <BgGlassmorphism />

      <div className="container flex flex-col gap-y-16 py-16 lg:gap-y-28 lg:py-28">
        <SectionHero />

        <SectionMission />

        <div className="relative py-20">
          <BackgroundSection />
        </div>

        <SectionValues />

        <SectionHowItWorks />

        <SectionStatistic />
      </div>
    </div>
  )
}

export default PageAbout
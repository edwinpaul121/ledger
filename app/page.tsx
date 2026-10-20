import HeroSection from "@/components/landing/HeroSection";
import TrendingSection from "@/components/landing/TrendingSection";
import SocialSection from "@/components/landing/SocialSection";
import CuratedListsSection from "@/components/landing/CuratedListsSection";
import StatsSection from "@/components/landing/StatsSection";
import CtaSection from "@/components/landing/CtaSection";
import SiteFooter from "@/components/landing/SiteFooter";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TrendingSection />
      <SocialSection />
      <CuratedListsSection />
      <StatsSection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}

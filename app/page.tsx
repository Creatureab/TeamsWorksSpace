import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import HomeHero from "@/components/home/HomeHero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-800 transition-colors duration-300 dark:bg-[#141121] dark:text-slate-200">
      <HomeHeader />
      <HomeHero />
      <HomeFooter />
    </div>
  );
}

import PackagesHero from "./HeroSection";
import PackagesGrid from "./PackagesGrid";
import ToolStaticDesign from "./StatSection";
import TestimonialsSection from "./TestimonialsSection";
import LicensingOptions from "../../components/LicensingOptions";

export default function (){
    return <div>
        <PackagesGrid />
        <PackagesHero />
        <LicensingOptions exclude="One-Time License" />
        <ToolStaticDesign />
        <TestimonialsSection />
    </div>
}
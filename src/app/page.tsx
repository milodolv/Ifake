import { LandingHeader } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <Hero />
    </div>
  );
}

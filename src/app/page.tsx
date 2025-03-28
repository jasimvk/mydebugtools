import Hero from './components/Hero';
import Features from './components/Features';
import WhyUse from './components/WhyUse';
import ToolsPreview from './components/ToolsPreview';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <WhyUse />
      <ToolsPreview />
    </main>
  );
}

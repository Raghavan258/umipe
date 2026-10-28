import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WhyUmipeSection from './components/WhyUmipeSection';
import WorkflowSection from './components/WorkflowSection';
import CoreInnovationSection from './components/CoreInnovationSection';
import AIModelsSection from './components/AIModelsSection';
import WhyExistingModelsSection from './components/WhyExistingModelsSection';
import ValidationRoadmapSection from './components/ValidationRoadmapSection';
import BenchmarkSection from './components/BenchmarkSection';
import SystemArchitectureSection from './components/SystemArchitectureSection';
import ModalitiesSection from './components/ModalitiesSection';
import UploadSection from './components/UploadSection';
import FeaturesSection from './components/FeaturesSection';
import FutureRoadmapSection from './components/FutureRoadmapSection';
import MetricsSection from './components/MetricsSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen font-sans text-navy-900 antialiased">
      {/* Skip to main content */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                   z-[100] px-4 py-2 bg-medblue-500 text-white text-sm rounded-lg font-medium"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Why UMIPE Exists — problem statement */}
        <WhyUmipeSection />

        {/* 3. How UMIPE Works — 10-step pipeline */}
        <WorkflowSection />

        {/* 4. Core Innovation — traditional vs UMIPE comparison */}
        <CoreInnovationSection />

        {/* 5. System Architecture — engineering diagram */}
        <SystemArchitectureSection />

        {/* 6. Supported AI Models */}
        <AIModelsSection />

        {/* 7. Why Existing AI Models? */}
        <WhyExistingModelsSection />

        {/* 8. Validation Roadmap */}
        <ValidationRoadmapSection />

        {/* 9. Benchmarking Framework */}
        <BenchmarkSection />

        {/* 10. Supported Modalities */}
        <ModalitiesSection />

        {/* 11. Upload Interface */}
        <UploadSection />

        {/* 12. Medical AI Pipeline features */}
        <FeaturesSection />

        {/* 13. Future Research Roadmap */}
        <FutureRoadmapSection />

        {/* 14. Animated metrics dashboard */}
        <MetricsSection />
      </main>

      <Footer />
    </div>
  );
}

export default App;

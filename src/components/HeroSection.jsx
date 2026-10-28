import { Upload, ChevronDown, CheckCircle2 } from 'lucide-react';
import MedicalIllustration from './MedicalIllustration';

const HERO_BADGES = [
  'X-Ray Prototype',
  'CT Planned',
  'NORMAL vs PNEUMONIA',
  'MobileNetV3-Small Baseline',
  'Research Platform',
];

const HeroSection = () => (
  <section
    id="hero"
    className="relative min-h-screen flex flex-col items-center pt-16 overflow-hidden bg-white"
    aria-labelledby="hero-heading"
  >
    {/* Background grid */}
    <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none" aria-hidden="true" />

    {/* Subtle radial gradient */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse 70% 60% at 70% 50%, rgba(14,165,233,0.07) 0%, transparent 70%)' }}
      aria-hidden="true"
    />

    <div className="section-container relative z-10 w-full flex-1 flex flex-col">
      {/* Main hero grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 lg:py-24 flex-1">

        {/* ── Left: copy ── */}
        <div className="flex flex-col gap-6 max-w-xl animate-fade-up">

          {/* Pre-title badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full
                             bg-medblue-50 text-medblue-600 border border-medblue-200 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-medblue-500 animate-pulse-slow" />
              Medical AI Research Platform
            </span>
          </div>

          {/* Primary heading */}
          <div className="flex flex-col gap-1">
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 leading-tight tracking-tight"
            >
              <span className="block">Metadata-Aware Medical Image Preprocessing Pipeline</span>
            </h1>
            <p className="text-base font-medium text-medblue-600 tracking-widest uppercase mt-3">
              Current prototype: chest X-ray classification
            </p>
          </div>

          {/* Value proposition headline */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-navy-800 leading-tight">
            Standardizing Medical Images<br />
            <span className="text-medblue-500">for Reliable AI Inference</span>
          </h2>

          {/* Subheading */}
          <p className="text-base text-slate-500 leading-relaxed max-w-lg">
            A research prototype for chest X-ray preprocessing and a two-class NORMAL versus PNEUMONIA baseline. CT and other modalities are planned. This is not a clinical diagnostic device.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap gap-3 mt-2">
            <a href="#upload" className="btn-primary">
              <Upload size={16} aria-hidden="true" />
              Upload Medical Scan
            </a>
            <a href="#architecture" className="btn-secondary">
              Explore Architecture
              <ChevronDown size={16} aria-hidden="true" />
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-slate-100">
            {[
              { label: 'Active Modality', value: 'X-ray' },
              { label: 'Classes', value: '2' },
              { label: 'Baseline', value: 'MobileNetV3-Small' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-semibold text-navy-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: illustration ── */}
        <div
          className="relative flex items-center justify-center animate-fade-in"
          style={{ animationDelay: '200ms' }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 rounded-full border border-medblue-200 opacity-40 animate-pulse-slow" />
            <div className="absolute w-96 h-96 rounded-full border border-medblue-100 opacity-25" />
          </div>
          <div className="relative w-full max-w-lg glass rounded-2xl shadow-card-hover p-3 animate-float">
            <MedicalIllustration />
          </div>
        </div>
      </div>

      {/* ── Badge strip ── */}
      <div className="w-full pb-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="flex flex-wrap justify-center gap-3">
          {HERO_BADGES.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full
                         bg-white border border-slate-200 text-slate-600 shadow-sm
                         hover:border-medblue-200 hover:text-medblue-700 hover:bg-medblue-50
                         transition-all duration-200"
            >
              <CheckCircle2 size={11} className="text-emerald-500" aria-hidden="true" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
      <ChevronDown size={14} className="text-slate-400 animate-bounce" aria-hidden="true" />
    </div>
  </section>
);

export default HeroSection;

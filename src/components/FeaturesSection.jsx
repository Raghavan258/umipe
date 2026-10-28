import { Layers, GitBranch, BrainCircuit, FlaskConical } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const FEATURES = [
  {
    id: 'preprocessing',
    icon: Layers,
    title: 'Intelligent Preprocessing',
    description:
      'Automatically standardizes geometry, intensity, orientation and metadata while preserving clinically meaningful information throughout the entire preprocessing chain.',
    accent: 'from-medblue-500 to-medblue-600',
    bg: 'bg-medblue-50',
    iconColor: 'text-medblue-600',
  },
  {
    id: 'routing',
    icon: GitBranch,
    title: 'Automatic Modality Routing',
    description:
      'The prototype accepts chest X-ray PNG, JPEG, and DICOM files. Automatic CT routing is a planned feature.',
    accent: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    id: 'ai',
    icon: BrainCircuit,
    title: 'Pretrained Medical AI Integration',
    description:
      'Phase 1 fine-tunes an ImageNet MobileNetV3-Small for NORMAL versus PNEUMONIA. DenseNet-121, nnU-Net, MONAI, and TorchXRayVision are not wired up.',
    accent: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    id: 'research',
    icon: FlaskConical,
    title: 'Research-grade Benchmarking',
    description:
      'Designed to isolate and benchmark the impact of preprocessing strategies using identical AI models — enabling reproducible, publication-ready clinical research.',
    accent: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
];

const FeatureCard = ({ feature, index }) => {
  const Icon = feature.icon;
  return (
    <div
      className={`reveal reveal-delay-${Math.min(index + 1, 4)}
                  group relative flex flex-col gap-5 p-7 rounded-2xl bg-white border border-slate-100
                  shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300`}
    >
      <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center
                       group-hover:scale-110 transition-transform duration-200`}>
        <Icon size={22} className={feature.iconColor} aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-navy-900 tracking-tight leading-snug">{feature.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
      </div>
      <div
        className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${feature.accent}
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        aria-hidden="true"
      />
    </div>
  );
};

const FeaturesSection = () => {
  const ref = useReveal();
  return (
    <section
      id="features"
      className="py-24 bg-white"
      aria-labelledby="features-heading"
      ref={ref}
    >
      <div className="section-container">
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            Architecture Pillars
          </p>
          <h2 id="features-heading" className="section-title mb-3">
            Medical AI Pipeline
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            MetaPrep AI bridges intelligent modality-aware preprocessing with pretrained AI models —
            delivering a complete, reproducible medical imaging inference pipeline.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

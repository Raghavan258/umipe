import { X, CheckCircle2, ArrowDown } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const TRADITIONAL = {
  title: 'Traditional Pipeline',
  label: 'Without MetaPrep AI',
  steps: ['Resize', 'Normalize', 'CNN', 'Prediction'],
  stepColors: ['bg-slate-100 text-slate-600 border-slate-200',
               'bg-slate-100 text-slate-600 border-slate-200',
               'bg-slate-100 text-slate-600 border-slate-200',
               'bg-slate-100 text-slate-700 border-slate-300 font-semibold'],
  problems: [
    'Loss of spatial detail and resolution',
    'Context blindness across patches',
    'Scanner variability unaddressed',
    'Different hospital protocols ignored',
    'Non-reproducible preprocessing steps',
  ],
  accent: 'border-red-200',
  headerBg: 'bg-red-50',
  headerText: 'text-red-600',
  badge: 'bg-red-100 text-red-700 border-red-200',
};

const UMIPE_PIPELINE = {
  title: 'MetaPrep AI Pipeline',
  label: 'With MetaPrep AI',
  steps: [
    'Geometry Standardization',
    'Intensity Standardization',
    'Intelligent Patch Generation',
    'Metadata Fusion',
    'Pretrained CNN',
    'Inference Report',
  ],
  stepColors: [
    'bg-medblue-50 text-medblue-700 border-medblue-200',
    'bg-medblue-50 text-medblue-700 border-medblue-200',
    'bg-sky-50 text-sky-700 border-sky-200',
    'bg-indigo-50 text-indigo-700 border-indigo-200',
    'bg-teal-50 text-teal-700 border-teal-200',
    'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
  ],
  advantages: [
    'Preserves anatomical resolution',
    'Maintains full spatial context',
    'Handles scanner variability',
    'Metadata-aware processing',
    'Research-ready reproducible output',
  ],
  accent: 'border-medblue-300',
  headerBg: 'bg-medblue-50',
  headerText: 'text-medblue-700',
  badge: 'bg-medblue-100 text-medblue-700 border-medblue-200',
  highlight: true,
};

const PipelineColumn = ({ data, isHighlight }) => (
  <div
    className={`relative flex flex-col rounded-2xl border-2 bg-white shadow-card overflow-hidden
                transition-all duration-300
                ${isHighlight ? `${data.accent} shadow-glow-cyan hover:shadow-card-hover` : `${data.accent} hover:shadow-card`}`}
  >
    {/* Header */}
    <div className={`px-6 py-5 ${data.headerBg} border-b ${data.accent}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold uppercase tracking-widest ${data.headerText}`}>{data.label}</span>
        {isHighlight && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${data.badge}`}>
            Proposed Research Architecture
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-navy-900">{data.title}</h3>
    </div>

    {/* Pipeline steps */}
    <div className="px-6 py-5 flex flex-col gap-0">
      {data.steps.map((step, i) => (
        <div key={step} className="flex flex-col items-center">
          <div className={`w-full text-center text-xs font-medium py-2 px-3 rounded-lg border ${data.stepColors[i]}`}>
            {step}
          </div>
          {i < data.steps.length - 1 && (
            <div className="flex flex-col items-center py-1" aria-hidden="true">
              <div className={`w-px h-3 ${isHighlight ? 'bg-medblue-200' : 'bg-slate-200'}`} />
              <ArrowDown size={10} className={isHighlight ? 'text-medblue-400' : 'text-slate-300'} />
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Outcomes */}
    <div className="px-6 pb-6 flex flex-col gap-2 mt-auto border-t border-slate-100 pt-5">
      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${data.headerText}`}>
        {isHighlight ? 'Advantages' : 'Problems'}
      </p>
      {(data.advantages || data.problems).map((item) => (
        <div key={item} className="flex items-start gap-2">
          {isHighlight
            ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            : <X size={13} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          }
          <span className="text-xs text-slate-600 leading-snug">{item}</span>
        </div>
      ))}
    </div>
  </div>
);

const CoreInnovationSection = () => {
  const ref = useReveal();
  return (
    <section
      id="core-innovation"
      className="py-24 bg-surface"
      aria-labelledby="innovation-heading"
      ref={ref}
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            Proposed Architecture
          </p>
          <h2 id="innovation-heading" className="section-title mb-3">
            Proposed Standardization Pipeline
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            The preprocessing stage is the most critical — and most often overlooked — component
            in medical AI. MetaPrep AI focuses on optimizing this architecture.
          </p>
        </div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto reveal reveal-delay-1">
          <PipelineColumn data={TRADITIONAL} isHighlight={false} />
          <PipelineColumn data={UMIPE_PIPELINE} isHighlight={true} />
        </div>

        {/* Insight note */}
        <div className="mt-10 max-w-3xl mx-auto text-center reveal reveal-delay-2">
          <p className="text-sm text-slate-500 leading-relaxed">
            MetaPrep AI isolates preprocessing as the primary research contribution by evaluating
            identical pretrained medical AI models with different preprocessing strategies.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CoreInnovationSection;

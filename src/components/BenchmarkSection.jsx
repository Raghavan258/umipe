import { BarChart3, ArrowDown, Clock, Info } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const METRICS = [
  { id: 'accuracy',      label: 'Accuracy',       icon: '◎' },
  { id: 'sensitivity',   label: 'Sensitivity',     icon: '◈' },
  { id: 'specificity',   label: 'Specificity',     icon: '◇' },
  { id: 'inference',     label: 'Inference Time',  icon: '⏱' },
  { id: 'dice',          label: 'Dice Score',      icon: '◆' },
  { id: 'auc',           label: 'AUC',             icon: '▲' },
];

const PLACEHOLDER = 'Validation Pending';

const PipelineBox = ({ label, sub, isHighlight }) => (
  <div className={`px-4 py-3 rounded-xl border text-center
                   ${isHighlight
                     ? 'bg-medblue-50 border-medblue-200 text-medblue-700'
                     : 'bg-slate-50 border-slate-200 text-slate-600'
                   }`}>
    <p className="text-xs font-bold">{label}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

const ComparisonColumn = ({ title, badge, pipelineSteps, isHighlight }) => (
  <div className={`flex flex-col rounded-2xl border-2 bg-white overflow-hidden shadow-card
                   ${isHighlight ? 'border-medblue-300 shadow-glow-cyan' : 'border-slate-200'}`}>
    {/* Header */}
    <div className={`px-6 py-4 border-b ${isHighlight ? 'bg-medblue-50 border-medblue-200' : 'bg-slate-50 border-slate-200'}`}>
      <span className={`text-xs font-semibold uppercase tracking-wider ${isHighlight ? 'text-medblue-600' : 'text-slate-500'}`}>
        {badge}
      </span>
      <h3 className="text-sm font-bold text-navy-900 mt-0.5">{title}</h3>
    </div>

    {/* Pipeline */}
    <div className="px-6 py-5 flex flex-col gap-0">
      {pipelineSteps.map((step, i) => (
        <div key={step} className="flex flex-col items-center">
          <PipelineBox label={step} isHighlight={isHighlight && i > 0} />
          {i < pipelineSteps.length - 1 && (
            <ArrowDown size={12} className={`my-1 ${isHighlight ? 'text-medblue-300' : 'text-slate-300'}`} aria-hidden="true" />
          )}
        </div>
      ))}
    </div>

    {/* Metrics */}
    <div className="px-6 pb-6 border-t border-slate-100 pt-4 flex flex-col gap-2">
      {METRICS.map((m) => (
        <div key={m.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
          <span className="text-xs font-medium text-slate-600">{m.label}</span>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200
                           px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock size={9} aria-hidden="true" />
            Validation Pending
          </span>
        </div>
      ))}
    </div>
  </div>
);

const BenchmarkSection = () => {
  const ref = useReveal();
  return (
    <section
      id="benchmarks"
      className="py-24 bg-surface"
      aria-labelledby="benchmark-heading"
      ref={ref}
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            Evaluation Framework
          </p>
          <h2 id="benchmark-heading" className="section-title mb-3">
            Benchmarking Framework
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            MetaPrep AI is designed to compare different preprocessing strategies using the <em>same</em> pretrained AI model —
            isolating the impact of preprocessing on model performance.
          </p>
        </div>

        {/* Concept explanation banner */}
        <div className="reveal reveal-delay-1 mb-10 max-w-3xl mx-auto flex items-start gap-3
                        p-5 rounded-xl bg-white border border-medblue-100 shadow-sm">
          <Info size={18} className="text-medblue-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-navy-900">Benchmark Design:</strong> The same pretrained model
            receives inputs processed by different preprocessing strategies. Only preprocessing changes.
            The neural network remains identical. This ensures a scientifically fair comparison and
            allows any observed performance improvement to be attributed to preprocessing alone.
          </p>
        </div>

        {/* Comparison columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto reveal reveal-delay-2">
          <ComparisonColumn
            title="Generic Preprocessing"
            badge="Baseline"
            pipelineSteps={['Resize', 'Normalize', 'DenseNet-121', 'Accuracy Metric']}
            isHighlight={false}
          />
          <ComparisonColumn
            title="MetaPrep AI Preprocessing"
            badge="Experimental"
            pipelineSteps={['Geometry Std.', 'Intensity Std.', 'Patch Gen.', 'Metadata Fusion', 'Same DenseNet-121', 'Accuracy Metric']}
            isHighlight={true}
          />
        </div>

        {/* Disclaimer */}
        <div className="mt-10 reveal reveal-delay-3 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <Clock size={13} className="text-amber-600 shrink-0" aria-hidden="true" />
            <p className="text-xs text-amber-700 font-medium">
              All benchmark metrics display <strong>"Validation Pending"</strong> — no performance data is fabricated.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenchmarkSection;

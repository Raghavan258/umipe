import { ArrowDown, CheckCircle2, Clock, FileText, Database, Target } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const WORKFLOW_STEPS = [
  { label: 'Chest X-ray Dataset', icon: Database, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  { label: 'Generic Preprocessing', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', isSplit: true },
  { label: 'MetaPrep AI Preprocessing', icon: Target, color: 'text-medblue-600', bg: 'bg-medblue-50', border: 'border-medblue-200', isSplit: true },
  { label: 'DenseNet-121', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', isSplit: true },
  { label: 'Same DenseNet-121', icon: Target, color: 'text-medblue-600', bg: 'bg-medblue-50', border: 'border-medblue-200', isSplit: true },
  { label: 'Evaluation', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', isSplit: true },
  { label: 'Performance Comparison', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', isSplit: true },
  { label: 'Publication Candidate', icon: FileText, color: 'text-navy-900', bg: 'bg-slate-100', border: 'border-slate-300' },
];

const METRICS = [
  'Accuracy',
  'AUC',
  'Sensitivity',
  'Specificity',
  'F1 Score',
  'Precision',
  'Recall',
  'Dice Score (for segmentation)',
  'Inference Time',
];

const ValidationRoadmapSection = () => {
  const ref = useReveal();
  return (
    <section
      id="validation-roadmap"
      className="py-24 bg-white"
      aria-labelledby="validation-heading"
      ref={ref}
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            Research Evaluation
          </p>
          <h2 id="validation-heading" className="section-title mb-3">
            Validation Roadmap
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            The structured experimental workflow designed to scientifically validate the impact of MetaPrep AI's standardization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start max-w-5xl mx-auto">
          {/* Left: Vertical Workflow */}
          <div className="flex flex-col items-center reveal reveal-delay-1">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-8">Experimental Workflow</h3>
            
            <div className="flex flex-col w-full max-w-sm">
              {/* Dataset */}
              <div className="flex flex-col items-center">
                <div className="w-full text-center px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-700">Chest X-ray Dataset</p>
                </div>
                <ArrowDown size={14} className="text-slate-300 my-2" aria-hidden="true" />
              </div>

              {/* Split flow container */}
              <div className="relative border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-4">
                {/* Branch labels */}
                <div className="flex justify-between px-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Baseline</span>
                  <span className="text-xs font-bold text-medblue-500 uppercase tracking-wider">Experimental</span>
                </div>
                
                {/* Rows */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                    Generic Preprocessing
                  </div>
                  <div className="text-center px-3 py-2.5 rounded-lg border border-medblue-200 bg-medblue-50 text-xs font-bold text-medblue-700">
                    MetaPrep AI Preprocessing
                  </div>
                </div>

                <div className="flex justify-around">
                  <ArrowDown size={14} className="text-slate-300" aria-hidden="true" />
                  <ArrowDown size={14} className="text-medblue-300" aria-hidden="true" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                    DenseNet-121
                  </div>
                  <div className="text-center px-3 py-2.5 rounded-lg border border-medblue-200 bg-medblue-50 text-xs font-bold text-medblue-700">
                    Same DenseNet-121
                  </div>
                </div>

                <div className="flex justify-around">
                  <ArrowDown size={14} className="text-slate-300" aria-hidden="true" />
                  <ArrowDown size={14} className="text-medblue-300" aria-hidden="true" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                    Evaluation
                  </div>
                  <div className="text-center px-3 py-2.5 rounded-lg border border-medblue-200 bg-medblue-50 text-xs font-bold text-medblue-700">
                    Performance Comparison
                  </div>
                </div>
              </div>

              {/* Merge down */}
              <div className="flex flex-col items-center mt-2">
                <ArrowDown size={14} className="text-slate-300 mb-2" aria-hidden="true" />
                <div className="w-full text-center px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 shadow-sm">
                  <p className="text-sm font-bold text-indigo-700 flex items-center justify-center gap-2">
                    <FileText size={16} /> Publication Candidate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="reveal reveal-delay-2 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 h-full flex flex-col">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-6">Evaluation Metrics</h3>
            <div className="flex flex-col gap-3">
              {METRICS.map((metric) => (
                <div key={metric} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <span className="text-sm font-medium text-slate-700">{metric}</span>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200
                                   px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                    <Clock size={10} aria-hidden="true" />
                    Validation Pending
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 rounded-xl border border-medblue-100 bg-medblue-50/50">
              <p className="text-xs text-medblue-700 leading-relaxed text-center">
                All evaluation metrics are rigorously calculated against standardized benchmark datasets. Results will be published upon completion of validation studies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValidationRoadmapSection;

import { Building2, Monitor, Scan, ArrowRight, Waypoints, CheckCircle2, BrainCircuit } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

/* Problem flow: left side */
const PROBLEM_STEPS = [
  { icon: Building2, label: 'Different Hospitals', sub: 'Across vendors & regions', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  { icon: Monitor,   label: 'Different Scanners',  sub: 'Siemens, GE, Philips, Canon',    color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  { icon: Scan,      label: 'Different Image Quality', sub: 'Resolution, noise, contrast', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  { icon: Waypoints, label: 'Different Geometry',  sub: 'Spacing, orientation, FOV',       color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  { icon: ArrowRight,label: 'Inconsistent Metadata', sub: 'DICOM tags vary by site',       color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  { icon: ArrowRight,label: 'Generic Preprocessing', sub: 'One-size-fits-all approach',    color: 'text-red-500',   bg: 'bg-red-50',   border: 'border-red-200' },
  { icon: ArrowRight,label: 'Inconsistent AI Performance', sub: 'Unreliable results',      color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200' },
];

/* Solution flow: right side */
const SOLUTION_STEPS = [
  { icon: CheckCircle2, label: 'MetaPrep AI',                sub: 'Universal preprocessing engine', color: 'text-medblue-600', bg: 'bg-medblue-50', border: 'border-medblue-200', highlight: true },
  { icon: CheckCircle2, label: 'Standardized Input',   sub: 'Geometry, intensity, metadata',  color: 'text-medblue-600', bg: 'bg-medblue-50', border: 'border-medblue-100' },
  { icon: BrainCircuit, label: 'Pretrained Medical AI', sub: 'Research-grade CNN models',     color: 'text-teal-600',    bg: 'bg-teal-50',    border: 'border-teal-200' },
  { icon: CheckCircle2, label: 'Reliable Inference',   sub: 'Reproducible clinical results',  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const FlowNode = ({ item, isLast, side }) => {
  const Icon = item.icon;
  return (
    <div className="flex flex-col items-center">
      <div className={`w-full flex items-center gap-3 p-3 rounded-xl border ${item.border} ${item.bg}
                       ${item.highlight ? 'ring-2 ring-medblue-300 shadow-glow-cyan' : ''}
                       transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                         ${item.highlight ? 'bg-medblue-100' : 'bg-white'} border ${item.border}`}>
          <Icon size={14} className={item.color} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-bold leading-tight ${item.highlight ? 'text-medblue-700' : 'text-navy-900'}`}>
            {item.label}
          </p>
          <p className="text-xs text-slate-400 leading-tight mt-0.5 truncate">{item.sub}</p>
        </div>
      </div>
      {!isLast && (
        <div className="flex flex-col items-center py-1" aria-hidden="true">
          <div className={`w-px h-4 ${side === 'problem' ? 'bg-red-200' : 'bg-medblue-200'}`} />
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M0 0 L4 6 L8 0" fill={side === 'problem' ? '#fca5a5' : '#7dd3fc'} />
          </svg>
        </div>
      )}
    </div>
  );
};

const WhyUmipeSection = () => {
  const ref = useReveal();
  return (
    <section
      id="why-umipe"
      className="py-24 bg-white"
      aria-labelledby="why-heading"
      ref={ref}
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            Problem Statement
          </p>
          <h2 id="why-heading" className="section-title mb-3">
            Why MetaPrep AI Exists
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Medical AI fails when the same model receives heterogeneous inputs from different
            scanners, hospitals and protocols. MetaPrep AI eliminates this variability.
          </p>
        </div>

        {/* Two-column flow */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-start reveal reveal-delay-1">

          {/* ── Problem column ── */}
          <div className="lg:col-span-5 flex flex-col gap-0">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <p className="text-sm font-semibold text-red-600 uppercase tracking-wider">Without MetaPrep AI</p>
            </div>
            {PROBLEM_STEPS.map((item, i) => (
              <FlowNode key={item.label} item={item} isLast={i === PROBLEM_STEPS.length - 1} side="problem" />
            ))}
          </div>

          {/* ── Divider ── */}
          <div className="lg:col-span-1 flex lg:flex-col items-center justify-center gap-2 py-4 lg:py-0">
            <div className="hidden lg:block w-px flex-1 bg-slate-200" />
            <div className="w-10 h-10 rounded-full bg-white border-2 border-medblue-200 flex items-center justify-center shadow-sm shrink-0">
              <ArrowRight size={14} className="text-medblue-500 hidden lg:block" aria-hidden="true" />
              <ArrowRight size={14} className="text-medblue-500 block lg:hidden rotate-90" aria-hidden="true" />
            </div>
            <div className="hidden lg:block w-px flex-1 bg-slate-200" />
          </div>

          {/* ── Solution column ── */}
          <div className="lg:col-span-5 flex flex-col gap-0">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">With MetaPrep AI</p>
            </div>
            {SOLUTION_STEPS.map((item, i) => (
              <FlowNode key={item.label} item={item} isLast={i === SOLUTION_STEPS.length - 1} side="solution" />
            ))}

            {/* Result callout */}
            <div className="mt-4 p-4 rounded-xl bg-navy-900 text-white">
              <p className="text-xs font-semibold text-medblue-400 uppercase tracking-wider mb-1">Result</p>
              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                Standardized preprocessing reduces scanner-induced variability and enables
                reproducible evaluation using identical pretrained AI models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUmipeSection;

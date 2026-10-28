import { CheckCircle2, Clock, Milestone } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const PHASES = [
  {
    id: 1,
    title: 'Phase 1',
    status: 'Active Development',
    isActive: true,
    items: ['Chest X-ray baseline', 'MobileNetV3-Small', 'CT still planned'],
    color: 'text-medblue-600',
    bg: 'bg-medblue-50',
    border: 'border-medblue-200',
    dot: 'bg-medblue-500',
    icon: <CheckCircle2 size={12} className="text-white" />
  },
  {
    id: 2,
    title: 'Phase 2',
    status: 'Research Planned',
    isActive: false,
    items: ['MRI', 'Ultrasound'],
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    dot: 'bg-slate-300',
    icon: <Clock size={12} className="text-white" />
  },
  {
    id: 3,
    title: 'Phase 3',
    status: 'Future Expansion',
    isActive: false,
    items: ['Endoscopy', 'PET', 'Mammography'],
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-200',
    icon: <Milestone size={12} className="text-white" />
  }
];

const FutureRoadmapSection = () => {
  const ref = useReveal();
  return (
    <section
      id="future-roadmap"
      className="py-24 bg-surface"
      aria-labelledby="roadmap-heading"
      ref={ref}
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            Expansion Plan
          </p>
          <h2 id="roadmap-heading" className="section-title mb-3">
            Future Research Roadmap
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            MetaPrep AI is continuously evolving to support additional medical imaging modalities and integration with novel AI architectures.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Horizontal connecting line (hidden on mobile) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative z-10">
            {PHASES.map((phase, index) => (
              <div 
                key={phase.id} 
                className={`reveal reveal-delay-${index + 1} flex flex-col items-center`}
              >
                {/* Node marker (hidden on mobile, positioned on the line) */}
                <div className="hidden md:flex mb-6 w-8 h-8 rounded-full border-4 border-white shadow-sm items-center justify-center bg-slate-300 transition-colors"
                     style={{ backgroundColor: phase.isActive ? '#0EA5E9' : (phase.id === 2 ? '#94a3b8' : '#cbd5e1') }}>
                  {phase.icon}
                </div>

                {/* Card */}
                <div className={`w-full max-w-xs flex flex-col p-6 rounded-2xl bg-white border ${phase.isActive ? 'border-medblue-200 shadow-md' : 'border-slate-200 shadow-sm'} transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-navy-900">{phase.title}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${phase.bg} ${phase.color} ${phase.border} border`}>
                      {phase.status}
                    </span>
                  </div>
                  
                  <ul className="flex flex-col gap-2.5">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${phase.isActive ? 'bg-medblue-400' : 'bg-slate-300'}`} />
                        <span className={`text-sm ${phase.isActive ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FutureRoadmapSection;

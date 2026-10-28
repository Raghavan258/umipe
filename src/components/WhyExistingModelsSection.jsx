import { HelpCircle, BrainCircuit } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const WhyExistingModelsSection = () => {
  const ref = useReveal();
  return (
    <section
      id="why-existing-models"
      className="py-16 bg-surface"
      aria-labelledby="why-existing-heading"
      ref={ref}
    >
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <div className="reveal p-8 md:p-10 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 rounded-2xl bg-medblue-50 border border-medblue-100 flex items-center justify-center shrink-0">
              <HelpCircle size={32} className="text-medblue-600" aria-hidden="true" />
            </div>
            
            <div className="flex flex-col gap-4">
              <h2 id="why-existing-heading" className="text-2xl font-bold text-navy-900 tracking-tight">
                Why Existing AI Models?
              </h2>
              
              <div className="space-y-4 text-base text-slate-600 leading-relaxed">
                <p>
                  MetaPrep AI intentionally uses established pretrained medical AI models instead of developing a new architecture.
                </p>
                <p>
                  This isolates preprocessing as the experimental variable, enabling fair benchmarking where performance improvements can be attributed to preprocessing quality rather than changes in neural network design.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 w-fit">
                <BrainCircuit size={16} className="text-slate-500 shrink-0" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pretrained Networks as Fixed Variables
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyExistingModelsSection;

import { CheckCircle2, Clock, ChevronRight, FlaskConical } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const MODALITIES = [
  {
    id: 'ct',
    title: 'CT Scan',
    acronym: 'CT',
    status: 'research',
    description: 'Planned. CT preprocessing and CT model inference are not part of the current prototype.',
    pipeline: ['DICOM', 'CT Preprocessing', 'Pretrained CT AI', 'Inference'],
    aiModel: 'nnU-Net / MedicalNet / MONAI',
    inputFormat: 'DICOM (.dcm), NIfTI',
    outputFormat: 'Inference report + JSON',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="13" stroke="#0EA5E9" strokeWidth="1.5" strokeOpacity="0.4" />
        <ellipse cx="16" cy="16" rx="9" ry="5.5" fill="none" stroke="#0EA5E9" strokeWidth="1.2" />
        <ellipse cx="16" cy="16" rx="9" ry="5.5" fill="none" stroke="#0EA5E9" strokeWidth="1.2" transform="rotate(60 16 16)" />
        <ellipse cx="16" cy="16" rx="9" ry="5.5" fill="none" stroke="#0EA5E9" strokeWidth="1.2" transform="rotate(120 16 16)" />
        <circle cx="16" cy="16" r="2.5" fill="#0EA5E9" fillOpacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'xray',
    title: 'X-Ray',
    acronym: 'XR',
    status: 'available',
    description: 'Prototype path for chest X-rays. The baseline classifies NORMAL versus PNEUMONIA and is not a diagnostic device.',
    pipeline: ['DICOM or JPEG', 'Resize + ImageNet norm', 'MobileNetV3-Small', 'Softmax scores'],
    aiModel: 'MobileNetV3-Small baseline',
    inputFormat: 'DICOM, PNG, JPEG',
    outputFormat: 'Multi-label report + JSON',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="6" y="4" width="20" height="24" rx="3" stroke="#0EA5E9" strokeWidth="1.5" />
        <path d="M12 14 Q16 10 20 14 Q16 18 12 14Z" fill="#0EA5E9" fillOpacity="0.2" stroke="#0EA5E9" strokeWidth="1" />
        <path d="M10 20 Q16 17 22 20" stroke="#0EA5E9" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.5" />
        <line x1="16" y1="4" x2="16" y2="28" stroke="#0EA5E9" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    id: 'mri',
    title: 'MRI',
    acronym: 'MR',
    status: 'research',
    description: 'Advanced soft tissue imaging using magnetic resonance technology for precise structural analysis.',
    pipeline: ['MRI Preprocessing', 'Pretrained MRI AI'],
    aiModel: 'SwinUNETR (Planned)',
    inputFormat: 'DICOM, NIfTI',
    outputFormat: 'TBD',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="11" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.5" />
        <path d="M 8 16 Q 12 10 16 16 Q 20 22 24 16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.5" />
        <path d="M 8 12 Q 12 8 16 12 Q 20 16 24 12" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.3" />
      </svg>
    ),
  },
  {
    id: 'ultrasound',
    title: 'Ultrasound',
    acronym: 'US',
    status: 'research',
    description: 'Real-time acoustic imaging for dynamic clinical assessment and organ motion analysis.',
    pipeline: ['US Preprocessing', 'Pretrained US AI'],
    aiModel: 'Vision Transformer (Planned)',
    inputFormat: 'DICOM, Video',
    outputFormat: 'TBD',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M8 26 Q16 12 24 26" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.5" />
        <path d="M11 23 Q16 13 21 23" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeOpacity="0.4" />
        <path d="M13.5 20 Q16 14 18.5 20" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.35" />
        <line x1="16" y1="6" x2="16" y2="12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'endoscopy',
    title: 'Endoscopy',
    acronym: 'EN',
    status: 'research',
    description: 'Optical visualization pipeline for gastrointestinal and minimally invasive procedures.',
    pipeline: ['Endo Preprocessing', 'Pretrained Endo AI'],
    aiModel: 'SAM2 Medical (Planned)',
    inputFormat: 'Video frames, PNG',
    outputFormat: 'TBD',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="8" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="16" cy="16" r="4" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeOpacity="0.4" />
        <circle cx="16" cy="16" r="1.5" fill="#94a3b8" fillOpacity="0.35" />
        <path d="M24 8 Q28 6 28 4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
      </svg>
    ),
  },
];

const PipelineFlow = ({ steps, available }) => (
  <div className="flex flex-wrap items-center gap-1 mt-auto pt-3 border-t border-slate-50">
    {steps.map((step, i) => (
      <div key={step} className="flex items-center gap-1">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                          ${available
                            ? i === steps.length - 1
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-medblue-50 text-medblue-700 border border-medblue-100'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
          {step}
        </span>
        {i < steps.length - 1 && (
          <ChevronRight size={9} className={available ? 'text-slate-300' : 'text-slate-200'} aria-hidden="true" />
        )}
      </div>
    ))}
  </div>
);

const ModalityCard = ({ modality, index }) => {
  const isAvailable = modality.status === 'available';
  const isResearch = modality.status === 'research';

  return (
    <div
      className={`reveal reveal-delay-${Math.min(index + 1, 5)}
                  group relative flex flex-col gap-4 p-6 rounded-2xl border bg-white
                  shadow-card transition-all duration-300
                  ${isAvailable
                    ? 'border-slate-100 hover:shadow-card-hover hover:-translate-y-1 cursor-default'
                    : 'border-slate-100 opacity-70 cursor-not-allowed'
                  }`}
      aria-label={`${modality.title} – ${isAvailable ? 'Available' : 'Research in Progress'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                         ${isAvailable ? 'bg-medblue-50' : 'bg-slate-50'}`}>
          {modality.icon}
        </div>
        {isAvailable ? (
          <span className="badge-available"><CheckCircle2 size={10} aria-hidden="true" /> Available</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
                           bg-indigo-50 text-indigo-600 border border-indigo-200">
            <FlaskConical size={10} aria-hidden="true" /> Research in Progress
          </span>
        )}
      </div>

      {/* Title + description */}
      <div>
        <h3 className={`text-lg font-bold tracking-tight ${isAvailable ? 'text-navy-900' : 'text-slate-400'}`}>
          {modality.title}
        </h3>
        <p className={`text-sm mt-1.5 leading-relaxed ${isAvailable ? 'text-slate-500' : 'text-slate-400'}`}>
          {modality.description}
        </p>
      </div>

      {/* Technical specs (available only) */}
      {isAvailable && (
        <div className="flex flex-col gap-1.5 text-xs">
          {[
            { k: 'AI Model', v: modality.aiModel },
            { k: 'Input', v: modality.inputFormat },
            { k: 'Output', v: modality.outputFormat },
          ].map(({ k, v }) => (
            <div key={k} className="flex gap-2">
              <span className="text-slate-400 font-medium shrink-0 w-16">{k}</span>
              <span className="text-navy-800 font-medium">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline flow */}
      <PipelineFlow steps={modality.pipeline} available={isAvailable} />

      {/* Disabled overlay */}
      {!isAvailable && (
        <div className="absolute inset-0 rounded-2xl bg-white/30 pointer-events-none" aria-hidden="true" />
      )}
    </div>
  );
};

const ModalitiesSection = () => {
  const ref = useReveal();
  return (
    <section
      id="modalities"
      className="py-24 bg-surface"
      aria-labelledby="modalities-heading"
      ref={ref}
    >
      <div className="section-container">
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            Imaging Modalities
          </p>
          <h2 id="modalities-heading" className="section-title mb-3">
            Supported Modalities
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Chest X-ray is the active prototype. CT, MRI, and the remaining modalities are research-stage plans.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {MODALITIES.map((modality, index) => (
            <ModalityCard key={modality.id} modality={modality} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModalitiesSection;

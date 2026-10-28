import {
  Upload, Cpu, ShieldCheck, FileText, Ruler,
  SlidersHorizontal, Grid3X3, Database, BrainCircuit, ClipboardList,
} from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const WORKFLOW_STEPS = [
  {
    id: 1, icon: Upload,
    label: 'Upload Scan',
    description: 'DICOM or X-ray file ingested via drag-and-drop. No modality selection required.',
    color: 'text-medblue-500', bg: 'bg-medblue-50', border: 'border-medblue-100',
  },
  {
    id: 2, icon: Cpu,
    label: 'Automatic Modality Detection',
    description: 'Planned for later modalities. The prototype treats an uploaded chest X-ray as the X-ray path.',
    color: 'text-medblue-600', bg: 'bg-medblue-50', border: 'border-medblue-100',
  },
  {
    id: 3, icon: ShieldCheck,
    label: 'DICOM Validation',
    description: 'File integrity, DICOM tag completeness and format compliance verified before processing.',
    color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100',
  },
  {
    id: 4, icon: FileText,
    label: 'Metadata Extraction',
    description: 'Patient orientation, pixel spacing, window level and acquisition parameters parsed from DICOM headers.',
    color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100',
  },
  {
    id: 5, icon: Ruler,
    label: 'Geometry Standardization',
    description: 'Planned geometry step. The baseline resizes chest X-rays to 224×224.',
    color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100',
  },
  {
    id: 6, icon: SlidersHorizontal,
    label: 'Intensity Standardization',
    description: 'JPEG and PNG use 0–1 scaling plus ImageNet mean and standard deviation. DICOM uses rescale and window metadata when present.',
    color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100',
  },
  {
    id: 7, icon: Grid3X3,
    label: 'Intelligent Patch Generation',
    description: 'Large medical images divided into configurable overlapping patches while preserving anatomical resolution and minimizing information loss.',
    color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100',
  },
  {
    id: 8, icon: Database,
    label: 'Metadata Fusion',
    description: 'Extracts spatial coordinates, acquisition parameters and imaging metadata to provide contextual information for downstream AI inference.',
    color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100',
  },
  {
    id: 9, icon: BrainCircuit,
    label: 'Pretrained Medical AI',
    description: 'The baseline is an ImageNet MobileNetV3-Small fine-tuned on this dataset. Other medical models are planned.',
    color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200',
    highlight: true,
  },
  {
    id: 10, icon: ClipboardList,
    label: 'AI-assisted Inference Report',
    description: 'The API returns the predicted class and uncalibrated softmax probabilities, plus a preprocessing preview.',
    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
    highlight: true,
  },
];

const StepCard = ({ step, index }) => {
  const Icon = step.icon;
  return (
    <div className={`reveal reveal-delay-${Math.min(index + 1, 5)} flex flex-col`}
      style={{ transitionDelay: `${index * 60}ms` }}>
      <div
        className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl bg-white border ${step.border}
                    shadow-card hover:shadow-card-hover hover:-translate-y-1
                    transition-all duration-300 h-full text-center
                    ${step.highlight ? 'ring-1 ring-teal-200' : ''}`}
      >
        <span className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-white border border-slate-200
                         text-xs font-bold text-slate-500 flex items-center justify-center shadow-sm">
          {index + 1}
        </span>
        <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center shrink-0
                         group-hover:scale-110 transition-transform duration-200`}>
          <Icon size={18} className={step.color} aria-hidden="true" />
        </div>
        <p className="text-xs font-bold text-navy-900 leading-snug">{step.label}</p>
        <p className="text-xs text-slate-400 leading-snug hidden sm:block">{step.description}</p>
      </div>
    </div>
  );
};

const WorkflowSection = () => {
  const ref = useReveal();
  return (
    <section
      id="how-it-works"
      className="py-24 bg-surface"
      aria-labelledby="workflow-heading"
      ref={ref}
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            End-to-End Pipeline
          </p>
          <h2 id="workflow-heading" className="section-title mb-3">
            How MetaPrep AI Works
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            The diagram is the research design. The running prototype covers chest X-ray upload, resize,
            ImageNet normalization, and a two-class MobileNetV3-Small score.
          </p>
        </div>

        {/* Grid: 2 cols sm, 5 cols xl → 10 steps fills 2 rows of 5 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {WORKFLOW_STEPS.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>

        {/* Connector arrows row 1 (steps 1–5) */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-4 mt-1" aria-hidden="true">
          {WORKFLOW_STEPS.slice(0, 4).map((step) => (
            <div key={step.id} className="flex justify-end pr-1">
              <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                <path d="M0 4 L16 4 M12 1 L16 4 L12 7" stroke="#CBD5E1" strokeWidth="1.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
          <div />
        </div>

        {/* Pipeline note */}
        <div className="mt-10 reveal reveal-delay-4 flex justify-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white border border-medblue-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse-slow" />
            <p className="text-sm text-slate-600">
              Active path: chest X-ray baseline · Other stages in this diagram are planned · Not a clinical device
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;

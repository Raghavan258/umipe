import { BrainCircuit, CheckCircle2, Clock, Info } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const MODEL_CATEGORIES = [
  {
    title: 'Classification',
    models: [
      {
        id: 'mobilenetv3',
        modality: 'Chest X-Ray',
        name: 'MobileNetV3-Small',
        library: 'torchvision ImageNet',
        architecture: 'MobileNetV3-Small, two-class head',
        primaryUse: 'Research baseline: NORMAL vs PNEUMONIA',
        framework: 'PyTorch',
        status: 'available',
        tags: ['Phase 1 baseline', 'Fine-tuned', 'Not clinical'],
        color: 'text-medblue-600', bg: 'bg-medblue-50', border: 'border-medblue-200',
        modalityBadge: 'bg-medblue-100 text-medblue-700',
      },
      {
        id: 'densenet121',
        modality: 'Chest X-Ray',
        name: 'DenseNet-121',
        library: 'TorchXRayVision',
        architecture: 'Densely Connected CNN',
        primaryUse: 'Multi-label chest pathology detection',
        framework: 'PyTorch',
        status: 'planned',
        tags: ['14-class', 'CheXpert', 'NIH ChestX-ray14'],
        color: 'text-medblue-600', bg: 'bg-medblue-50', border: 'border-medblue-200',
        modalityBadge: 'bg-medblue-100 text-medblue-700',
      },
      {
        id: 'chexnet',
        modality: 'Chest X-Ray',
        name: 'CheXNet',
        library: 'Stanford ML Group',
        architecture: '121-layer DenseNet',
        primaryUse: 'Pneumonia detection from chest X-rays',
        framework: 'PyTorch',
        status: 'planned',
        tags: ['Pneumonia', 'Stanford', 'NIH dataset'],
        color: 'text-medblue-600', bg: 'bg-medblue-50', border: 'border-medblue-200',
        modalityBadge: 'bg-medblue-100 text-medblue-700',
      },
      {
        id: 'torchxray',
        modality: 'Chest X-Ray',
        name: 'TorchXRayVision',
        library: 'mlmed/torchxrayvision',
        architecture: 'ResNet / DenseNet variants',
        primaryUse: 'Generalised chest X-ray pathology',
        framework: 'PyTorch',
        status: 'planned',
        tags: ['Open-source', 'Pretrained', 'Multi-dataset'],
        color: 'text-medblue-600', bg: 'bg-medblue-50', border: 'border-medblue-200',
        modalityBadge: 'bg-medblue-100 text-medblue-700',
      }
    ]
  },
  {
    title: 'Segmentation',
    models: [
      {
        id: 'nnunet',
        modality: 'CT Scan',
        name: 'nnU-Net',
        library: 'MIC-DKFZ',
        architecture: 'Self-configuring U-Net',
        primaryUse: 'Volumetric medical image segmentation',
        framework: 'PyTorch',
        status: 'planned',
        tags: ['Segmentation', 'MICCAI winner', 'Auto-config'],
        color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200',
        modalityBadge: 'bg-sky-100 text-sky-700',
      }
    ]
  },
  {
    title: 'Medical AI Framework',
    models: [
      {
        id: 'monai',
        modality: 'CT Scan',
        name: 'MONAI',
        library: 'Project MONAI',
        architecture: 'Framework (U-Net, ViT, SegResNet)',
        primaryUse: 'Medical image segmentation and classification',
        framework: 'PyTorch',
        status: 'planned',
        tags: ['NVIDIA', 'King\'s College London', 'Clinical AI'],
        color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200',
        modalityBadge: 'bg-sky-100 text-sky-700',
      }
    ]
  },
  {
    title: 'Future Architectures',
    models: [
      {
        id: 'swinunetr',
        modality: 'Future',
        name: 'SwinUNETR',
        library: 'MONAI / NVIDIA',
        architecture: 'Swin Transformer + U-Net',
        primaryUse: 'High-resolution volumetric segmentation',
        framework: 'PyTorch',
        status: 'planned',
        tags: ['Vision Transformer', 'BraTS winner', 'NVIDIA Clara'],
        color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200',
        modalityBadge: 'bg-slate-100 text-slate-500',
      },
      {
        id: 'sam2',
        modality: 'Future',
        name: 'SAM2 Medical',
        library: 'Meta AI (adapted)',
        architecture: 'Segment Anything Model v2',
        primaryUse: 'Zero-shot medical image segmentation',
        framework: 'PyTorch',
        status: 'planned',
        tags: ['Foundation model', 'Zero-shot', 'Multi-modal'],
        color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200',
        modalityBadge: 'bg-slate-100 text-slate-500',
      },
      {
        id: 'vit-med',
        modality: 'Future',
        name: 'Vision Transformers',
        library: 'Various',
        architecture: 'ViT / Hybrid ViT',
        primaryUse: 'Global attention-based medical image analysis',
        framework: 'PyTorch / JAX',
        status: 'planned',
        tags: ['Attention', 'Self-supervised', 'DINO'],
        color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200',
        modalityBadge: 'bg-slate-100 text-slate-500',
      }
    ]
  }
];

const ModelCard = ({ model, index }) => {
  const isAvailable = model.status === 'available';
  return (
    <div
      className={`reveal reveal-delay-${Math.min(index + 1, 5)}
                  group relative flex flex-col gap-4 p-5 rounded-2xl bg-white border
                  shadow-card transition-all duration-300
                  ${isAvailable
                    ? `${model.border} hover:shadow-card-hover hover:-translate-y-1`
                    : 'border-slate-200 opacity-70'
                  }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl ${model.bg} flex items-center justify-center shrink-0`}>
          <BrainCircuit size={18} className={model.color} aria-hidden="true" />
        </div>
        {isAvailable ? (
          <span className="badge-available text-xs">
            <CheckCircle2 size={9} aria-hidden="true" /> Available
          </span>
        ) : (
          <span className="badge-soon text-xs">
            <Clock size={9} aria-hidden="true" /> Planned
          </span>
        )}
      </div>

      {/* Modality badge */}
      <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${model.modalityBadge}`}>
        {model.modality}
      </span>

      {/* Name */}
      <div>
        <h3 className={`text-base font-bold tracking-tight ${isAvailable ? 'text-navy-900' : 'text-slate-400'}`}>
          {model.name}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{model.library}</p>
      </div>

      {/* Details table */}
      <div className="flex flex-col gap-1.5 text-xs">
        {[
          { k: 'Architecture', v: model.architecture },
          { k: 'Primary Use', v: model.primaryUse },
          { k: 'Framework', v: model.framework },
        ].map(({ k, v }) => (
          <div key={k} className="flex gap-2">
            <span className="text-slate-400 font-medium shrink-0 w-24">{k}</span>
            <span className={`${isAvailable ? 'text-navy-800' : 'text-slate-400'} font-medium`}>{v}</span>
          </div>
        ))}
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-slate-50">
        {model.tags.map((tag) => (
          <span key={tag}
            className={`text-xs px-2 py-0.5 rounded-full
                        ${isAvailable ? `${model.bg} ${model.color} border ${model.border}` : 'bg-slate-100 text-slate-400'}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* Disabled overlay */}
      {!isAvailable && (
        <div className="absolute inset-0 rounded-2xl bg-white/40 pointer-events-none" aria-hidden="true" />
      )}
    </div>
  );
};

const AIModelsSection = () => {
  const ref = useReveal();
  return (
    <section
      id="ai-models"
      className="py-24 bg-white"
      aria-labelledby="models-heading"
      ref={ref}
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            AI Integration
          </p>
          <h2 id="models-heading" className="section-title mb-3">
            Supported AI Models
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            The running baseline is a fine-tuned MobileNetV3-Small that separates NORMAL and PNEUMONIA chest X-rays.
            The other models on this page are planned research targets, not loaded checkpoints.
          </p>
        </div>

        {MODEL_CATEGORIES.map((category, idx) => (
          <div key={category.title} className="mb-12 last:mb-0">
            <h3 className="text-lg font-bold text-navy-800 mb-6 pb-2 border-b border-slate-100 reveal">
              {category.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.models.map((model, index) => (
                <ModelCard key={model.id} model={model} index={index} />
              ))}
            </div>
            {category.title === 'Medical AI Framework' && (
              <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 reveal">
                <Info size={14} className="text-medblue-500 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  <strong>Note:</strong> MONAI is a medical imaging framework containing multiple architectures
                  rather than a single pretrained model.
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Note */}
        <div className="mt-10 reveal reveal-delay-3 max-w-xl mx-auto text-center">
          <p className="text-xs text-slate-400 leading-relaxed">
            Probabilities from the baseline are uncalibrated softmax scores. They are not a clinical diagnosis
            and have not been validated for hospital use.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIModelsSection;

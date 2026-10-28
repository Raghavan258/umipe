import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, FileImage, AlertCircle, X, Loader2,
  CheckCircle2, ChevronRight, ClipboardList,
  Activity, Clock, Layers, Hash, Download, FileDown, FlaskConical,
  User, Calendar, Stethoscope, Cpu, Image as ImageIcon,
  ChevronDown, Sparkles,
} from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import { parseDicom, renderDicomPreview } from '../utils/dicomUtils';

const API_URL = import.meta.env.VITE_UMIPE_API_URL || 'http://localhost:8000';

const STEP_LABELS = {
  raw_input: 'Raw Input',
  grayscale: 'Grayscale',
  resized: 'Resized (224×224)',
  denoised: 'Denoised',
  clahe_enhanced: 'CLAHE Enhanced',
  normalized: 'Normalized',
};

const parseStandardImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const metadata = {
          patientId: 'Anonymous',
          patientName: file.name.replace(/\.[^/.]+$/, ''),
          patientSex: 'Not Specified',
          patientAge: 'Not Specified',
          modality: 'DX',
          modalityType: 'XRAY',
          modalityLabel: 'Digital X-ray (Standard Image)',
          studyDate: file.lastModified ? new Date(file.lastModified).toISOString().slice(0, 10) : 'Not Available',
          manufacturer: 'Direct Image Upload',
          institutionName: 'Imported File',
          columns: img.width,
          rows: img.height,
          pixelSpacing: 'Not Available',
          bitsAllocated: 8,
          photometricInterpretation: 'RGB / Grayscale',
          viewPosition: 'PA / AP',
          bodyPartExamined: 'CHEST',
          kVp: null,
          tubeCurrent: null,
          exposure: null,
        };
        resolve({ metadata, imageElement: img });
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

/* ─── Dynamic Pipeline Steps ─── */
const UPLOAD_STEPS = [
  'Uploading File',
  'Reading DICOM',
  'Validating Structure',
  'Extracting Metadata',
  'Generating Preview',
  'Pipeline Ready',
];

const FUTURE_STEPS_CT = [
  'HU Conversion',
  'Windowing',
  'Intensity Normalization',
  'Isotropic Resampling',
  'Patch Generation',
  'Metadata-aware Fusion',
  'AI Ready Tensor',
];

const FUTURE_STEPS_XRAY = [
  'Intensity Normalization',
  'Contrast Enhancement',
  'Patch Generation',
  'Metadata-aware Fusion',
  'AI Ready Tensor',
];

/* ─── Sub-component: processing animation ─── */
const ProcessingState = ({ currentStepIndex }) => (
  <div className="flex flex-col items-center gap-5 py-2">
    <div className="relative">
      <Loader2 size={36} className="text-medblue-500 animate-spin" aria-label="Processing scan" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-medblue-400 animate-pulse-slow" />
      </div>
    </div>
    <div className="text-center">
      <p className="font-semibold text-navy-900 mb-1">Processing Pipeline…</p>
      <p className="text-xs text-slate-400">MetaPrep AI is preparing your scan</p>
    </div>
    {/* Live step tracker */}
    <div className="w-full max-w-xs space-y-1.5">
      {UPLOAD_STEPS.map((step, i) => {
        const done = i < currentStepIndex;
        const active = i === currentStepIndex;
        return (
          <div
            key={step}
            className={`flex items-center gap-2.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-300
                        ${done ? 'text-emerald-700 bg-emerald-50' : active ? 'text-medblue-700 bg-medblue-50' : 'text-slate-400 bg-slate-50'}`}
          >
            {done ? (
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
            ) : active ? (
              <Loader2 size={12} className="text-medblue-500 animate-spin shrink-0" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-slate-300 shrink-0" />
            )}
            <span className={`font-medium ${done ? '' : active ? '' : 'opacity-50'}`}>{step}</span>
          </div>
        );
      })}
    </div>
  </div>
);

/* ─── Sub-component: metadata result panel ─── */
const MetadataResult = ({ file, metadata, pixelData, imageElement, predictionResult, onReset }) => {
  const canvasRef = useRef(null);
  const [showPreprocessing, setShowPreprocessing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      if (pixelData && metadata) {
        renderDicomPreview(canvasRef.current, pixelData, metadata);
      } else if (imageElement && metadata) {
        const canvas = canvasRef.current;
        canvas.width = metadata.columns || imageElement.width;
        canvas.height = metadata.rows || imageElement.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageElement, 0, 0);
      }
    }
  }, [pixelData, imageElement, metadata]);

  const sizeLabel = file.size > 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${(file.size / 1024).toFixed(0)} KB`;

  const isCT = metadata.modalityType === 'CT';
  const isXRay = metadata.modalityType === 'XRAY';
  const futureSteps = isCT ? FUTURE_STEPS_CT : (isXRay ? FUTURE_STEPS_XRAY : []);
  
  const displayVal = (val) => val ? val : 'Not Available';

  return (
    <div className="flex flex-col gap-4">
      {/* File pill */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <FileImage size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium text-slate-600 truncate">{file.name}</span>
          <span className="text-xs text-slate-400 shrink-0">{sizeLabel}</span>
        </div>
        <button
          onClick={onReset}
          className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          aria-label="Remove file and reset"
        >
          <X size={13} />
        </button>
      </div>

      {/* ── Detected Modality ── */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-medblue-50 border border-medblue-100">
        <div>
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-wider mb-0.5">Detected Modality</p>
          <p className="text-base font-bold text-navy-900">{metadata.modalityLabel}</p>
        </div>
        <CheckCircle2 size={22} className="text-medblue-500" aria-hidden="true" />
      </div>

      {/* ── Processing Status ── */}
      <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Processing Status</p>
        <div className="space-y-1.5 grid grid-cols-2">
          {['Uploaded', 'Parsed', 'Metadata Extracted', 'Pipeline Ready'].map((step) => (
            <div key={step} className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" aria-hidden="true" />
              <span className="text-slate-700 font-medium">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Metadata Extraction ── */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={16} className="text-medblue-500" aria-hidden="true" />
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-wider">Metadata</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Patient Info */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><User size={12}/> Patient Information</p>
            <div className="space-y-1">
              <p className="text-xs"><span className="text-slate-500">ID:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.patientId)}</span></p>
              <p className="text-xs"><span className="text-slate-500">Name:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.patientName)}</span></p>
              <p className="text-xs"><span className="text-slate-500">Age:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.patientAge)}</span></p>
              <p className="text-xs"><span className="text-slate-500">Sex:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.patientSex)}</span></p>
            </div>
          </div>
          {/* Study Info */}
          <div>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar size={12}/> Study Information</p>
             <div className="space-y-1">
              <p className="text-xs"><span className="text-slate-500">Date:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.studyDate)}</span></p>
              <p className="text-xs"><span className="text-slate-500">Institution:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.institutionName)}</span></p>
              <p className="text-xs"><span className="text-slate-500">Manufacturer:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.manufacturer)}</span></p>
              <p className="text-xs"><span className="text-slate-500">Modality:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.modality)}</span></p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
           {/* Image Info */}
           <div>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><ImageIcon size={12}/> Image Information</p>
             <div className="space-y-1">
              <p className="text-xs"><span className="text-slate-500">Dimensions:</span> <span className="font-semibold text-navy-900">{metadata.columns ? `${metadata.columns} × ${metadata.rows}` : 'Not Available'}</span></p>
              <p className="text-xs"><span className="text-slate-500">Spacing:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.pixelSpacing)}</span></p>
              <p className="text-xs"><span className="text-slate-500">Bits:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.bitsAllocated)} bit</span></p>
              <p className="text-xs"><span className="text-slate-500">Photometric:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.photometricInterpretation)}</span></p>
            </div>
          </div>
          {/* Specific Info */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Activity size={12}/> {isCT ? 'CT Details' : 'X-Ray Details'}</p>
            {isCT && (
              <div className="space-y-1">
                <p className="text-xs"><span className="text-slate-500">Thickness:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.sliceThickness)}</span></p>
                <p className="text-xs"><span className="text-slate-500">Rescale:</span> <span className="font-semibold text-navy-900">{metadata.rescaleSlope ? `${metadata.rescaleSlope} / ${metadata.rescaleIntercept}` : 'Not Available'}</span></p>
                <p className="text-xs"><span className="text-slate-500">Window:</span> <span className="font-semibold text-navy-900">{metadata.windowCenter ? `W:${metadata.windowWidth} C:${metadata.windowCenter}` : 'Not Available'}</span></p>
              </div>
            )}
            {isXRay && (
               <div className="space-y-1">
                <p className="text-xs"><span className="text-slate-500">Position:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.viewPosition)}</span></p>
                <p className="text-xs"><span className="text-slate-500">Body Part:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.bodyPartExamined)}</span></p>
                <p className="text-xs"><span className="text-slate-500">kVp / mA:</span> <span className="font-semibold text-navy-900">{metadata.kVp ? `${metadata.kVp}kVp` : ''} {metadata.tubeCurrent ? `/ ${metadata.tubeCurrent}mA` : ''}</span></p>
                <p className="text-xs"><span className="text-slate-500">Exposure:</span> <span className="font-semibold text-navy-900">{displayVal(metadata.exposure)}</span></p>
              </div>
            )}
            {!isCT && !isXRay && (
               <p className="text-xs italic text-slate-400">Modality specific data not displayed for {metadata.modalityType}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Image Preview ── */}
      {(pixelData || imageElement) && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col items-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 w-full text-left">
              {pixelData ? 'DICOM Image Preview' : 'Image Preview'}
            </p>
            <div className="bg-black w-full flex items-center justify-center rounded-lg overflow-hidden relative" style={{ minHeight: '200px', maxHeight: '300px' }}>
                <canvas ref={canvasRef} className="max-w-full max-h-[300px] object-contain" />
                <div className="absolute top-2 left-2 text-[10px] text-white/70 font-mono drop-shadow-md">
                    {metadata.modalityLabel}
                </div>
            </div>
        </div>
      )}

      {/* ── Future Processing Modules ── */}
      {futureSteps.length > 0 && (
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100">
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={15} className="text-teal-600" aria-hidden="true" />
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Future Processing Modules</p>
              <span className="ml-auto text-[10px] text-teal-600 font-medium bg-teal-100/50 px-2 py-0.5 rounded-full border border-teal-200">
                Under Development
              </span>
            </div>
            <div className="space-y-2 pl-1">
              {futureSteps.map((step) => (
                <div key={step} className="flex items-center gap-2.5 text-sm">
                  <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white shadow-sm flex-shrink-0" />
                  <span className="text-slate-600">{step}</span>
                </div>
              ))}
            </div>
            
            {/* Future AI Prediction & Results Section */}
             <div className="mt-4 pt-4 border-t border-teal-200/50">
                {(() => {
                  const modelLoaded = predictionResult?.prediction?.model_loaded ?? predictionResult?.model_loaded ?? false;
                  const predictionsList = predictionResult?.prediction?.predictions || predictionResult?.predictions || [];
                  const preprocessingSteps = predictionResult?.preprocessing_steps || [];

                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={12} className="text-medblue-500" aria-hidden="true" />
                          AI Pathology Predictions
                        </p>
                        {predictionResult && !modelLoaded && (
                          <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                            {predictionResult.model_message || 'Checkpoint unavailable. No prediction was produced.'}
                          </span>
                        )}
                      </div>

                      {predictionResult && modelLoaded && (
                        <p className="mb-2 text-[11px] leading-relaxed text-slate-500">
                          Predicted class: {predictionResult.predicted_class || 'Unavailable'}.
                          These percentages are uncalibrated softmax scores from a research baseline, not a clinical diagnosis.
                        </p>
                      )}

                      {predictionResult ? (
                        <div className="space-y-2.5 bg-white/80 p-3.5 rounded-xl border border-slate-200 shadow-sm">
                          {([...predictionsList])
                            .sort((a, b) => b.probability - a.probability)
                            .map((item, idx) => {
                              const pct = Math.round(item.probability * 100);
                              const displayPct = (item.probability * 100).toFixed(1);
                              return (
                                <div key={item.label || idx} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-navy-900">{item.label}</span>
                                    <span className="font-mono text-xs font-bold text-medblue-700 bg-medblue-50 px-2 py-0.5 rounded border border-medblue-100">
                                      {modelLoaded ? `${displayPct}%` : 'N/A'}
                                    </span>
                                  </div>
                                  {modelLoaded && (
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                      <div
                                        className="bg-gradient-to-r from-medblue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-4 bg-white/50 rounded-lg border border-dashed border-teal-200">
                          <p className="text-sm font-medium text-slate-400 italic">Backend integration required</p>
                        </div>
                      )}

                      {/* Collapsible Preprocessing Steps */}
                      {preprocessingSteps.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-teal-200/50">
                          <button
                            onClick={() => setShowPreprocessing((prev) => !prev)}
                            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-medblue-600 transition-colors py-1"
                            type="button"
                          >
                            <span className="flex items-center gap-1.5">
                              <FlaskConical size={14} className="text-medblue-500" aria-hidden="true" />
                              View Preprocessing Steps ({preprocessingSteps.length})
                            </span>
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${showPreprocessing ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {showPreprocessing && (
                            <div className="mt-3 overflow-x-auto pb-2 flex gap-3">
                              {preprocessingSteps.map((stepObj, idx) => {
                                const label = STEP_LABELS[stepObj.step] || stepObj.step.replace(/_/g, ' ');
                                return (
                                  <div
                                    key={stepObj.step || idx}
                                    className="flex-shrink-0 w-36 bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col items-center shadow-sm"
                                  >
                                    <div className="w-full h-28 bg-black rounded overflow-hidden flex items-center justify-center mb-1.5">
                                      <img
                                        src={`data:image/png;base64,${stepObj.image_base64}`}
                                        alt={label}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-300 truncate w-full text-center">
                                      {label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
             </div>
          </div>
      )}

      {/* ── Research Disclaimer ── */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-amber-600 font-bold" style={{ fontSize: '10px' }}>!</span>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800 mb-1">Research Demonstration</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              This pipeline is a UI prototype simulating modality-aware DICOM parsing and metadata extraction. 
              Actual voxel preprocessing and AI inference will be handled by the upcoming backend architecture.
            </p>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="btn-secondary w-full justify-center text-sm mt-1"
        aria-label="Upload another scan"
      >
        Upload Another Scan
        <ChevronRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
};

/* ─── Main Upload Section ─── */
const UploadSection = () => {
  const ref = useReveal();
  const fileInputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [metadata, setMetadata] = useState(null);
  const [pixelData, setPixelData] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setUploadedFile(file);
    setCurrentStepIndex(0);
    setErrorMessage('');
    setPredictionResult(null);
    setImageElement(null);

    const name = file.name.toLowerCase();
    const isDicom = name.endsWith('.dcm') || name.endsWith('.dicom');
    const isStandardImage = name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png');

    if (!isDicom && !isStandardImage) {
      setErrorMessage('Please upload a valid DICOM (.dcm) or X-ray image (.jpg, .jpeg, .png).');
      setStatus('error');
      return;
    }

    setStatus('processing');

    try {
        // Step 0: Uploading
        setCurrentStepIndex(0);
        await new Promise(r => setTimeout(r, 400));
        
        // Step 1: Reading File / DICOM
        setCurrentStepIndex(1);
        let parsedMetadata, parsedPixelData, parsedImageElement;
        try {
          if (isDicom) {
            const parsed = await parseDicom(file);
            parsedMetadata = parsed.metadata;
            parsedPixelData = parsed.pixelData;
          } else {
            const parsed = await parseStandardImage(file);
            parsedMetadata = parsed.metadata;
            parsedImageElement = parsed.imageElement;
          }
        } catch (dErr) {
          setErrorMessage('Unable to parse file or extract image data. The file may be corrupted.');
          setStatus('error');
          return;
        }
        
        if (parsedMetadata.modalityType !== 'CT' && parsedMetadata.modalityType !== 'XRAY') {
             setErrorMessage('This modality is not yet supported. Current prototype supports CT and X-ray.');
             setStatus('error');
             return;
        }
        
        // Step 2: Validating Structure
        setCurrentStepIndex(2);
        await new Promise(r => setTimeout(r, 300));
        
        // Step 3: Extracting Metadata
        setCurrentStepIndex(3);
        setMetadata(parsedMetadata);
        setPixelData(parsedPixelData || null);
        setImageElement(parsedImageElement || null);
        await new Promise(r => setTimeout(r, 400));
        
        // Step 4: Generating Preview
        setCurrentStepIndex(4);
        await new Promise(r => setTimeout(r, 600));
        
        // Step 5: Pipeline Ready / Inference
        setCurrentStepIndex(5);
        if (parsedMetadata.modalityType === 'XRAY') {
          try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_URL}/api/predict/xray`, {
              method: 'POST',
              body: formData,
            });

            if (!res.ok) {
              throw new Error(`Backend error: ${res.status}`);
            }

            const data = await res.json();
            setPredictionResult(data);
          } catch (apiErr) {
            setErrorMessage('Could not reach the analysis backend. Please try again.');
            setStatus('error');
            return;
          }
        } else {
          // CT endpoint not implemented yet
          await new Promise(r => setTimeout(r, 500));
          setPredictionResult(null);
        }
        
        setStatus('done');

    } catch(err) {
        setErrorMessage('Could not reach the analysis backend. Please try again.');
        setStatus('error');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleInputChange = useCallback((e) => {
    handleFile(e.target.files[0]);
  }, [handleFile]);

  const handleReset = useCallback(() => {
    setUploadedFile(null);
    setStatus('idle');
    setCurrentStepIndex(0);
    setMetadata(null);
    setPixelData(null);
    setImageElement(null);
    setPredictionResult(null);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const isDroppable = status === 'idle' || status === 'error';

  return (
    <section
      id="upload"
      className="py-24 bg-white"
      aria-labelledby="upload-heading"
      ref={ref}
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            Medical AI Pipeline Interface
          </p>
          <h2 id="upload-heading" className="section-title mb-3">
            Upload Medical Scan
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Upload a DICOM scan below. MetaPrep AI automatically extracts metadata, detects modality, and prepares the processing pipeline.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 reveal reveal-delay-1">

            {/* ── Left: pipeline overview ── */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                What MetaPrep AI does
              </p>
              {[
                { step: '01', text: 'Reads DICOM securely in browser' },
                { step: '02', text: 'Detects imaging modality' },
                { step: '03', text: 'Extracts critical metadata' },
                { step: '04', text: 'Generates image preview' },
                { step: '05', text: 'Routes to backend AI pipeline (Future)' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-medblue-50 border border-medblue-200
                                   text-medblue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                    {step.replace('0', '')}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
                </div>
              ))}

              {/* Supported formats */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Supported Formats
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['DICOM (.dcm)', 'JPEG (.jpg, .jpeg)', 'PNG (.png)'].map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5
                                             rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      {f}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {['MRI', 'Ultrasound', 'Endoscopy'].map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                                             rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      {f} — soon
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: upload / result card ── */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">

                {/* Drop zone — shown when idle or error */}
                {(status === 'idle' || status === 'error') && (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Drag and drop area for medical scan upload"
                    className={`relative flex flex-col items-center justify-center gap-4 p-10 text-center
                                border-2 border-dashed rounded-xl m-4 cursor-pointer transition-all duration-300
                                ${dragOver
                                  ? 'border-medblue-400 bg-medblue-50 scale-[0.99]'
                                  : status === 'error'
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-slate-200 bg-surface hover:border-medblue-300 hover:bg-medblue-50'
                                }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => isDroppable && fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && isDroppable && fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 grid-pattern opacity-40 rounded-xl pointer-events-none" aria-hidden="true" />

                    {status === 'error' ? (
                      <>
                        <AlertCircle size={36} className="text-red-400" aria-label="Upload error" />
                        <div>
                          <p className="font-semibold text-navy-900">Upload Failed</p>
                          <p className="text-sm text-red-400 mt-1">{errorMessage}</p>
                        </div>
                        <button onClick={handleReset} className="text-xs text-medblue-500 font-medium underline">
                          Try again
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-medblue-50 border border-medblue-100
                                        flex items-center justify-center shadow-sm">
                          <Upload size={24} className="text-medblue-500" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900 text-base mb-1">
                            Drag & Drop Medical Scan
                          </p>
                          <p className="text-sm text-slate-400">
                            DICOM, JPEG, or PNG X-ray files
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Processing state */}
                {status === 'processing' && (
                  <div className="p-6">
                    <ProcessingState currentStepIndex={currentStepIndex} />
                  </div>
                )}

                {/* Done — inference result */}
                {status === 'done' && metadata && (
                  <div className="p-5">
                    <MetadataResult
                      file={uploadedFile}
                      metadata={metadata}
                      pixelData={pixelData}
                      imageElement={imageElement}
                      predictionResult={predictionResult}
                      onReset={handleReset}
                    />
                  </div>
                )}

                {/* Hidden input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept=".dcm,.dicom,.jpg,.jpeg,.png"
                  onChange={handleInputChange}
                  aria-label="Medical scan file input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;

import { useReveal } from '../hooks/useReveal';

/* A professional SVG pipeline diagram */
const ArchDiagram = () => (
  <svg
    viewBox="0 0 860 540"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
    role="img"
    aria-label="MetaPrep AI system architecture diagram showing the full pipeline from hospital scanner to research report"
  >
    <defs>
      <pattern id="arch-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0EA5E9" strokeWidth="0.3" strokeOpacity="0.15" />
      </pattern>
      <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#0EA5E9" fillOpacity="0.6" />
      </marker>
      <marker id="arrow-teal" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#14B8A6" fillOpacity="0.7" />
      </marker>
      <marker id="arrow-emerald" viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" fillOpacity="0.7" />
      </marker>
      <filter id="box-shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
      </filter>
    </defs>

    {/* Background */}
    <rect width="860" height="540" fill="#F8FAFC" rx="16" />
    <rect width="860" height="540" fill="url(#arch-grid)" rx="16" />

    {/* ─── INPUT COLUMN ─── */}
    {/* Hospital */}
    <rect x="30" y="80" width="130" height="48" rx="10" fill="white" stroke="#CBD5E1" strokeWidth="1.2" filter="url(#box-shadow)" />
    <text x="95" y="99" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#0F172A">Hospital</text>
    <text x="95" y="113" textAnchor="middle" fontFamily="Inter" fontSize="8.5" fill="#64748b">Clinical environment</text>

    {/* Scanner */}
    <rect x="30" y="165" width="130" height="48" rx="10" fill="white" stroke="#CBD5E1" strokeWidth="1.2" filter="url(#box-shadow)" />
    <text x="95" y="184" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#0F172A">Medical Scanner</text>
    <text x="95" y="198" textAnchor="middle" fontFamily="Inter" fontSize="8.5" fill="#64748b">CT / X-Ray / MRI</text>

    {/* DICOM/PNG */}
    <rect x="30" y="250" width="130" height="48" rx="10" fill="#EAF4FF" stroke="#0EA5E9" strokeWidth="1.2" filter="url(#box-shadow)" />
    <text x="95" y="269" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#0284c7">DICOM / PNG</text>
    <text x="95" y="283" textAnchor="middle" fontFamily="Inter" fontSize="8.5" fill="#64748b">Raw imaging data</text>

    {/* Arrows: input column */}
    <line x1="95" y1="128" x2="95" y2="162" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow-blue)" />
    <line x1="95" y1="213" x2="95" y2="247" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow-blue)" />
    <line x1="160" y1="274" x2="202" y2="274" stroke="#0EA5E9" strokeWidth="1.5" markerEnd="url(#arrow-blue)" />

    {/* ─── UMIPE BOX ─── */}
    <rect x="200" y="40" width="310" height="460" rx="14" fill="#EAF4FF" stroke="#0EA5E9" strokeWidth="1.5" filter="url(#box-shadow)" />
    <rect x="200" y="40" width="310" height="38" rx="14" fill="#0EA5E9" />
    <rect x="200" y="64" width="310" height="14" fill="#0EA5E9" />
    <text x="355" y="64" textAnchor="middle" fontFamily="Inter" fontSize="12" fontWeight="800" fill="white" letterSpacing="1">METAPREP AI ENGINE</text>

    {/* Pipeline stages inside UMIPE box */}
    {[
      ['Automatic Modality Detection', '8.5', '#0F172A', 'white', '#e2eaf3'],
      ['DICOM Validation', '8.5', '#0F172A', 'white', '#e2eaf3'],
      ['Metadata Extraction', '8.5', '#0F172A', 'white', '#e2eaf3'],
      ['Geometry Standardization', '8.5', '#0F172A', 'white', '#e2eaf3'],
      ['Intensity Standardization', '8.5', '#0F172A', 'white', '#e2eaf3'],
      ['Intelligent Patch Generation', '8.5', '#0F172A', 'white', '#e2eaf3'],
      ['Metadata Fusion', '8.5', '#14B8A6', '#f0fdfb', '#99f6e4'],
    ].map(([label, fs, textColor, bg, stroke], i) => (
      <g key={label}>
        <rect x="218" y={92 + i * 53} width="274" height="34" rx="8"
          fill={bg} stroke={stroke} strokeWidth="1" />
        <text x="355" y={112 + i * 53} textAnchor="middle"
          fontFamily="Inter" fontSize={parseFloat(fs)} fontWeight="600" fill={textColor}>
          {label}
        </text>
        {i < 6 && (
          <line x1="355" y1={126 + i * 53} x2="355" y2={139 + i * 53}
            stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arrow-blue)" />
        )}
      </g>
    ))}

    {/* Arrow out of UMIPE to Pretrained AI */}
    <line x1="510" y1="274" x2="545" y2="274" stroke="#14B8A6" strokeWidth="1.8" markerEnd="url(#arrow-teal)" />

    {/* ─── PRETRAINED AI COLUMN ─── */}
    <rect x="545" y="248" width="145" height="52" rx="10"
      fill="#f0fdfb" stroke="#14B8A6" strokeWidth="1.5" filter="url(#box-shadow)" />
    <text x="617" y="268" textAnchor="middle" fontFamily="Inter" fontSize="9.5" fontWeight="800" fill="#0d9488">Pretrained</text>
    <text x="617" y="281" textAnchor="middle" fontFamily="Inter" fontSize="9.5" fontWeight="800" fill="#0d9488">Medical AI CNN</text>
    <text x="617" y="293" textAnchor="middle" fontFamily="Inter" fontSize="7.5" fill="#64748b">MobileNetV3-Small baseline</text>

    {/* Arrow: AI → Inference */}
    <line x1="617" y1="300" x2="617" y2="334" stroke="#14B8A6" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />

    {/* Clinical Inference */}
    <rect x="545" y="334" width="145" height="48" rx="10"
      fill="#f0fdf4" stroke="#10b981" strokeWidth="1.5" filter="url(#box-shadow)" />
    <text x="617" y="354" textAnchor="middle" fontFamily="Inter" fontSize="9.5" fontWeight="700" fill="#059669">Clinical Inference</text>
    <text x="617" y="367" textAnchor="middle" fontFamily="Inter" fontSize="8" fill="#64748b">Prediction + Confidence</text>
    <text x="617" y="378" textAnchor="middle" fontFamily="Inter" fontSize="8" fill="#64748b">Score</text>

    {/* Arrow: Inference → Report */}
    <line x1="617" y1="382" x2="617" y2="416" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow-emerald)" />

    {/* Research Report */}
    <rect x="545" y="416" width="145" height="48" rx="10"
      fill="#fff7ed" stroke="#fb923c" strokeWidth="1.5" filter="url(#box-shadow)" />
    <text x="617" y="436" textAnchor="middle" fontFamily="Inter" fontSize="9.5" fontWeight="700" fill="#c2410c">Research Report</text>
    <text x="617" y="449" textAnchor="middle" fontFamily="Inter" fontSize="8" fill="#64748b">JSON + PDF export</text>
    <text x="617" y="460" textAnchor="middle" fontFamily="Inter" fontSize="8" fill="#64748b">Technical summary</text>

    {/* ─── LABELS / BADGES ─── */}
    {/* Input label */}
    <rect x="30" y="44" width="130" height="22" rx="6" fill="#F8FAFC" stroke="#e2e8f0" strokeWidth="1" />
    <text x="95" y="59" textAnchor="middle" fontFamily="Inter" fontSize="8.5" fontWeight="600" fill="#64748b" letterSpacing="0.5">INPUT SOURCES</text>

    {/* Output label */}
    <rect x="545" y="44" width="145" height="22" rx="6" fill="#F8FAFC" stroke="#e2e8f0" strokeWidth="1" />
    <text x="617" y="59" textAnchor="middle" fontFamily="Inter" fontSize="8.5" fontWeight="600" fill="#64748b" letterSpacing="0.5">AI INFERENCE OUTPUT</text>

    {/* Live dot animation hint */}
    <circle cx="617" cy="226" r="5" fill="#14B8A6" fillOpacity="0.6">
      <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
      <animate attributeName="fill-opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
    </circle>

    {/* Legend */}
    <rect x="710" y="80" width="130" height="110" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
    <text x="718" y="97" fontFamily="Inter" fontSize="7.5" fontWeight="700" fill="#64748b" letterSpacing="0.5">LEGEND</text>
    {[
      ['#0EA5E9', 'MetaPrep AI Stage'],
      ['#14B8A6', 'AI Model'],
      ['#10b981', 'Inference'],
      ['#fb923c', 'Report Output'],
    ].map(([color, label], i) => (
      <g key={label}>
        <circle cx="722" cy={112 + i * 18} r="4" fill={color} />
        <text x="732" y={116 + i * 18} fontFamily="Inter" fontSize="8" fill="#64748b">{label}</text>
      </g>
    ))}
  </svg>
);

const SystemArchitectureSection = () => {
  const ref = useReveal();
  return (
    <section
      id="architecture"
      className="py-24 bg-white"
      aria-labelledby="arch-heading"
      ref={ref}
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-14 reveal">
          <p className="text-xs font-semibold text-medblue-500 uppercase tracking-widest mb-3">
            Engineering Diagram
          </p>
          <h2 id="arch-heading" className="section-title mb-3">
            System Architecture
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            From hospital scanner to research report — a complete view of how MetaPrep AI
            integrates medical imaging data with pretrained AI inference.
          </p>
        </div>

        {/* Diagram */}
        <div className="reveal reveal-delay-1 rounded-2xl border border-slate-200 shadow-card overflow-hidden bg-surface p-4">
          <ArchDiagram />
        </div>

        {/* Stage labels */}
        <div className="mt-8 reveal reveal-delay-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Data Ingestion', desc: 'Hospital → DICOM/PNG', color: 'border-slate-300 text-slate-600' },
            { label: 'Preprocessing', desc: '7-stage MetaPrep AI pipeline', color: 'border-medblue-300 text-medblue-700' },
            { label: 'AI Inference', desc: 'Pretrained CNN models', color: 'border-teal-300 text-teal-700' },
            { label: 'Report Generation', desc: 'JSON + PDF output', color: 'border-orange-300 text-orange-700' },
          ].map(({ label, desc, color }) => (
            <div key={label} className={`p-3 rounded-xl border bg-white text-center ${color}`}>
              <p className="text-xs font-bold">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SystemArchitectureSection;

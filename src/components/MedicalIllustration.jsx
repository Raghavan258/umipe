// MetaPrep AI SVG Illustration - Medical Imaging Hero Visual
// Renders a clinical-grade medical imaging visualization with CT layers,
// DICOM grid, neural network connections, and animated scan line.

const MedicalIllustration = () => (
  <svg
    viewBox="0 0 520 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    aria-label="MetaPrep AI medical imaging illustration showing CT scan layers and AI neural connections"
    role="img"
  >
    <defs>
      {/* Grid pattern */}
      <pattern id="grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#0EA5E9" strokeWidth="0.4" strokeOpacity="0.25" />
      </pattern>

      {/* Glow filter for accents */}
      <filter id="glow-blue" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-teal" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Radial gradient for scan glow */}
      <radialGradient id="scanGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
      </radialGradient>

      {/* Linear gradient for CT slice depth */}
      <linearGradient id="sliceGrad1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EAF4FF" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#bde0ff" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id="sliceGrad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#dbeeff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#a8d4f5" stopOpacity="0.5" />
      </linearGradient>

      {/* Clip for rounded rectangle */}
      <clipPath id="roundClip">
        <rect x="60" y="40" width="400" height="400" rx="20" />
      </clipPath>
    </defs>

    {/* Background grid */}
    <rect x="60" y="40" width="400" height="400" rx="20" fill="#EAF4FF" fillOpacity="0.45" />
    <rect x="60" y="40" width="400" height="400" rx="20" fill="url(#grid)" />

    {/* Outer glow circle */}
    <circle cx="260" cy="235" r="160" fill="url(#scanGlow)" />

    {/* ─── CT Scan Slices (isometric stack) ─── */}

    {/* Bottom slice */}
    <g opacity="0.55">
      <ellipse cx="260" cy="305" rx="110" ry="28" fill="#c8e6fa" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.6" />
    </g>

    {/* Mid-bottom slice */}
    <g opacity="0.65">
      <ellipse cx="260" cy="285" rx="115" ry="30" fill="url(#sliceGrad2)" stroke="#0EA5E9" strokeWidth="0.9" strokeOpacity="0.7" />
      {/* Internal anatomy lines */}
      <ellipse cx="260" cy="285" rx="55" ry="14" fill="none" stroke="#0EA5E9" strokeWidth="0.6" strokeOpacity="0.5" />
      <ellipse cx="240" cy="283" rx="18" ry="9" fill="none" stroke="#14B8A6" strokeWidth="0.7" strokeOpacity="0.6" />
      <ellipse cx="282" cy="283" rx="18" ry="9" fill="none" stroke="#14B8A6" strokeWidth="0.7" strokeOpacity="0.6" />
    </g>

    {/* Mid slice */}
    <g opacity="0.78">
      <ellipse cx="260" cy="262" rx="120" ry="32" fill="url(#sliceGrad1)" stroke="#0EA5E9" strokeWidth="1.1" strokeOpacity="0.8" />
      <ellipse cx="260" cy="262" rx="60" ry="16" fill="none" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.5" />
      <ellipse cx="237" cy="259" rx="22" ry="11" fill="#a8d8f8" fillOpacity="0.7" stroke="#14B8A6" strokeWidth="0.9" strokeOpacity="0.7" />
      <ellipse cx="283" cy="259" rx="22" ry="11" fill="#a8d8f8" fillOpacity="0.7" stroke="#14B8A6" strokeWidth="0.9" strokeOpacity="0.7" />
      {/* Spine artifact */}
      <ellipse cx="260" cy="267" rx="8" ry="6" fill="#d0eeff" stroke="#0EA5E9" strokeWidth="0.8" />
    </g>

    {/* Top primary slice */}
    <g opacity="0.95">
      <ellipse cx="260" cy="236" rx="125" ry="34" fill="white" fillOpacity="0.92" stroke="#0EA5E9" strokeWidth="1.5" filter="url(#glow-blue)" />
      {/* Lung fields */}
      <ellipse cx="233" cy="232" rx="28" ry="18" fill="#ddf0ff" stroke="#0EA5E9" strokeWidth="1" strokeOpacity="0.6" />
      <ellipse cx="287" cy="232" rx="28" ry="18" fill="#ddf0ff" stroke="#0EA5E9" strokeWidth="1" strokeOpacity="0.6" />
      {/* Mediastinum */}
      <ellipse cx="260" cy="238" rx="14" ry="12" fill="#c6e8fb" stroke="#0284c7" strokeWidth="0.9" />
      {/* Vessel details */}
      <circle cx="260" cy="232" r="4" fill="#0EA5E9" fillOpacity="0.5" />
      <circle cx="260" cy="244" r="3" fill="#14B8A6" fillOpacity="0.5" />
      {/* Rib suggestions */}
      <path d="M 148 228 Q 180 210 210 220" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
      <path d="M 372 228 Q 340 210 310 220" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
    </g>

    {/* ─── Animated scan line ─── */}
    <line
      x1="135" y1="236" x2="385" y2="236"
      stroke="#0EA5E9" strokeWidth="1.5" strokeOpacity="0.7"
      strokeDasharray="4 3"
    >
      <animate attributeName="y1" values="202;270;202" dur="3.5s" repeatCount="indefinite" />
      <animate attributeName="y2" values="202;270;202" dur="3.5s" repeatCount="indefinite" />
      <animate attributeName="stroke-opacity" values="0.8;0.3;0.8" dur="3.5s" repeatCount="indefinite" />
    </line>

    {/* Scan line glow band */}
    <rect x="135" y="228" width="250" height="8" fill="#0EA5E9" fillOpacity="0.08" rx="2">
      <animate attributeName="y" values="198;262;198" dur="3.5s" repeatCount="indefinite" />
      <animate attributeName="fill-opacity" values="0.12;0.04;0.12" dur="3.5s" repeatCount="indefinite" />
    </rect>

    {/* ─── DICOM metadata tag panel ─── */}
    <g transform="translate(70, 55)">
      <rect width="140" height="78" rx="8" fill="white" fillOpacity="0.82" stroke="#e2eaf3" strokeWidth="1" />
      <text x="10" y="18" fontFamily="Inter, monospace" fontSize="7" fill="#0EA5E9" fontWeight="600" letterSpacing="1">DICOM METADATA</text>
      <line x1="10" y1="22" x2="130" y2="22" stroke="#e2eaf3" strokeWidth="0.8" />
      {[
        ['Modality', 'CT'],
        ['SliceThickness', '1.25 mm'],
        ['KVP', '120'],
        ['WindowCenter', '40 HU'],
        ['Rows × Cols', '512 × 512'],
      ].map(([k, v], i) => (
        <g key={k}>
          <text x="10" y={34 + i * 10} fontFamily="Inter, monospace" fontSize="6.2" fill="#64748b">{k}</text>
          <text x="95" y={34 + i * 10} fontFamily="Inter, monospace" fontSize="6.2" fill="#0F172A" fontWeight="600">{v}</text>
        </g>
      ))}
    </g>

    {/* ─── Pixel intensity heatmap strip ─── */}
    <g transform="translate(310, 55)">
      <rect width="148" height="38" rx="7" fill="white" fillOpacity="0.82" stroke="#e2eaf3" strokeWidth="1" />
      <text x="8" y="12" fontFamily="Inter, monospace" fontSize="6.5" fill="#0EA5E9" fontWeight="600" letterSpacing="0.8">HU INTENSITY</text>
      {[
        '#0F172A', '#1e3a5f', '#1d4ed8', '#0EA5E9', '#38bdf8',
        '#7dd3fc', '#bae6fd', '#e0f2fe', '#f0f9ff', '#ffffff'
      ].map((c, i) => (
        <rect key={i} x={8 + i * 13.2} y="17" width="12" height="14" rx="2" fill={c} opacity="0.85" />
      ))}
      <text x="8" y="36" fontFamily="monospace" fontSize="5.5" fill="#64748b">-1000 HU</text>
      <text x="108" y="36" fontFamily="monospace" fontSize="5.5" fill="#64748b">+3000 HU</text>
    </g>

    {/* ─── AI neural network layer (right side) ─── */}
    {/* Input nodes */}
    {[0, 1, 2, 3].map((i) => (
      <circle key={`in-${i}`} cx="390" cy={135 + i * 28} r="6" fill="#EAF4FF" stroke="#0EA5E9" strokeWidth="1.2" />
    ))}

    {/* Hidden nodes */}
    {[0, 1, 2].map((i) => (
      <circle key={`h-${i}`} cx="430" cy={149 + i * 30} r="6" fill="#dff0fe" stroke="#0284c7" strokeWidth="1.2">
        <animate attributeName="fill-opacity" values="0.7;1;0.7" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
      </circle>
    ))}

    {/* Output node */}
    <circle cx="466" cy="179" r="7" fill="#14B8A6" fillOpacity="0.8" stroke="#0d9488" strokeWidth="1.4" filter="url(#glow-teal)">
      <animate attributeName="r" values="6.5;8;6.5" dur="2s" repeatCount="indefinite" />
    </circle>

    {/* Connection lines input→hidden */}
    {[0, 1, 2, 3].flatMap((i) =>
      [0, 1, 2].map((j) => (
        <line key={`conn-${i}-${j}`}
          x1="396" y1={135 + i * 28}
          x2="424" y2={149 + j * 30}
          stroke="#0EA5E9" strokeWidth="0.5" strokeOpacity="0.35"
        />
      ))
    )}

    {/* Connection lines hidden→output */}
    {[0, 1, 2].map((i) => (
      <line key={`out-${i}`}
        x1="436" y1={149 + i * 30}
        x2="459" y2="179"
        stroke="#14B8A6" strokeWidth="0.6" strokeOpacity="0.4"
      />
    ))}

    {/* Neural label */}
    <text x="378" y="124" fontFamily="Inter, monospace" fontSize="6.5" fill="#0EA5E9" fontWeight="600" letterSpacing="0.6" opacity="0.8">CNN</text>
    <text x="454" y="197" fontFamily="Inter, monospace" fontSize="6" fill="#14B8A6" fontWeight="600" opacity="0.85">OUTPUT</text>

    {/* ─── Measurement rulers ─── */}
    {/* Horizontal ruler */}
    <line x1="137" y1="362" x2="383" y2="362" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.4" />
    <line x1="137" y1="357" x2="137" y2="367" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.4" />
    <line x1="383" y1="357" x2="383" y2="367" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.4" />
    <text x="220" y="373" fontFamily="monospace" fontSize="6" fill="#64748b" opacity="0.8">512 px</text>

    {/* ─── Processing status badge ─── */}
    <g transform="translate(390, 345)">
      <rect width="78" height="28" rx="14" fill="#14B8A6" fillOpacity="0.15" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="14" cy="14" r="3.5" fill="#14B8A6">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <text x="22" y="18" fontFamily="Inter, sans-serif" fontSize="7.5" fill="#0d9488" fontWeight="600">READY</text>
    </g>
  </svg>
);

export default MedicalIllustration;

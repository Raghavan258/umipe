import { ExternalLink } from 'lucide-react';

const LinkedinIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const FOOTER_LINKS = {
  Pipeline: [
    'Modality Detection',
    'DICOM Validation',
    'Geometry Standardization',
    'Intensity Standardization',
    'Intelligent Patch Generation',
    'Metadata Fusion',
    'Medical AI Integration',
  ],
  Platform: [
    { label: 'Architecture', href: '#architecture' },
    { label: 'Documentation', href: '#' },
    { label: 'Research', href: '#benchmarks' },
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'Roadmap', href: '#' },
  ],
  CurrentFocus: [
    'CT preprocessing',
    'Chest X-ray preprocessing',
    'Metadata-aware preprocessing',
    'Publication-oriented benchmarking',
  ],
};

const Footer = () => (
  <footer className="bg-navy-900 text-white" role="contentinfo">
    <div className="section-container py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="md:col-span-1 flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M4 5 L4 13 Q4 14 5 14 L8 14 Q11 14 11 11 Q11 9 9 9 Q11 9 11 7 Q11 5 8 5 Z"
                  stroke="#0EA5E9" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                <path d="M13 5 L13 14" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">MetaPrep AI</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300 mb-1">Metadata-Aware Pipeline</p>
            <p className="text-xs text-slate-500">Research-driven Medical AI Infrastructure</p>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Standardizing heterogeneous medical imaging for reliable, reproducible AI inference.
          </p>
          <div className="flex items-center gap-3">
            {[
              { href: 'https://github.com', label: 'MetaPrep AI on GitHub', Icon: GithubIcon },
              { href: 'https://linkedin.com', label: 'MetaPrep AI on LinkedIn', Icon: LinkedinIcon },
            ].map(({ href, label, Icon }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center
                           text-slate-400 hover:text-white hover:bg-white/15 transition-all duration-200">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-5 tracking-wide">Pipeline</h3>
          <ul className="flex flex-col gap-2.5" role="list">
            {FOOTER_LINKS.Pipeline.map((item) => (
              <li key={item}>
                <span className="text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-default">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-5 tracking-wide">Platform</h3>
          <ul className="flex flex-col gap-2.5" role="list">
            {FOOTER_LINKS.Platform.map(({ label, href }) => (
              <li key={label}>
                <a href={href}
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1">
                  {label}
                  {href.startsWith('http') && <ExternalLink size={10} className="text-slate-600" />}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Current Focus + Disclaimer */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-5 tracking-wide">Current Focus</h3>
          <ul className="flex flex-col gap-2.5 mb-6" role="list">
            {FOOTER_LINKS.CurrentFocus.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-medblue-500 mt-1.5" />
                <span className="text-sm text-slate-300 leading-tight">{item}</span>
              </li>
            ))}
          </ul>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Disclaimer:</strong> MetaPrep AI is intended for research and
              engineering validation. AI-generated outputs are not a substitute for professional
              clinical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/10">
      <div className="section-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} MetaPrep AI · Metadata-Aware Medical Image Preprocessing Pipeline
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <a href="#architecture" className="hover:text-slate-400 transition-colors">Architecture</a>
          <a href="#benchmarks" className="hover:text-slate-400 transition-colors">Benchmarks</a>
          <a href="#ai-models" className="hover:text-slate-400 transition-colors">AI Models</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

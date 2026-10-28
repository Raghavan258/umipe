import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Why MetaPrep AI', href: '#why-umipe' },
  { label: 'Pipeline',     href: '#how-it-works' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'AI Models',    href: '#ai-models' },
  { label: 'Modalities',   href: '#modalities' },
  { label: 'Upload',       href: '#upload' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm'
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <div className="section-container">
        <nav className="flex items-center justify-between h-16" aria-label="Main navigation">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2.5 group" aria-label="MetaPrep AI home">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center
                            group-hover:bg-medblue-600 transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M4 5 L4 13 Q4 14 5 14 L8 14 Q11 14 11 11 Q11 9 9 9 Q11 9 11 7 Q11 5 8 5 Z"
                  stroke="#0EA5E9" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                <path d="M13 5 L13 14" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-navy-900 text-lg tracking-tight">MetaPrep AI</span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-6" role="list">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} className="nav-link text-xs font-semibold uppercase tracking-wider">{label}</a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="#upload" className="btn-primary text-sm py-2 px-5">Upload Scan</a>
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div id="mobile-menu" className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md pb-4">
            <ul className="flex flex-col gap-1 pt-2" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="block px-4 py-2.5 text-sm font-medium text-slate-700
                               hover:bg-medblue-50 hover:text-navy-900 rounded-lg transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >{label}</a>
                </li>
              ))}
            </ul>
            <div className="px-4 pt-3">
              <a href="#upload" className="btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>
                Upload Scan
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

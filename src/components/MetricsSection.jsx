import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../hooks/useReveal';

const METRICS = [
  { label: 'Active Modality', value: 1, suffix: '', decimals: 0, color: 'text-medblue-400' },
  { label: 'Baseline Classes', value: 2, suffix: '', decimals: 0, color: 'text-medblue-400' },
  { label: 'Baseline Model', value: 1, suffix: '', decimals: 0, color: 'text-teal-400' },
  { label: 'Planned Modalities', value: null, suffix: 'CT+', decimals: 0, color: 'text-teal-400' },
  { label: 'Research Prototype', value: null, suffix: 'Yes', decimals: 0, color: 'text-emerald-400' },
];

const useCounter = (target, duration = 1800, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === null) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const MetricItem = ({ metric, animate }) => {
  const count = useCounter(metric.value, 1800, animate);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className={`text-5xl font-black tracking-tight ${metric.color}`}>
        {metric.value === null
          ? metric.suffix
          : `${count}${metric.suffix}`
        }
      </span>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider leading-tight max-w-24">
        {metric.label}
      </span>
    </div>
  );
};

const MetricsSection = () => {
  const ref = useReveal();
  const sectionRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="py-16 bg-navy-900"
      aria-label="Platform metrics"
      ref={(el) => { ref.current = el; sectionRef.current = el; }}
    >
      <div className="section-container">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 reveal">
          {METRICS.map((m) => (
            <MetricItem key={m.label} metric={m} animate={animate} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;

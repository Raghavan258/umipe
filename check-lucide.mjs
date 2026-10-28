import * as l from 'lucide-react';
const needed = [
  'Hospital','Building2','Scan','Stethoscope','BarChart3','BarChart',
  'TrendingUp','ArrowRight','ArrowDown','Target','Users','Monitor',
  'Database','Server','Code2','Globe','BookOpen','Award','Microscope',
  'FlaskConical','BrainCircuit','ClipboardList','ShieldCheck','FileText',
  'Layers','GitBranch','Activity','Clock','Hash','ChevronRight',
  'ChevronDown','Cpu','Ruler','SlidersHorizontal','Grid3X3','Network',
  'CheckCircle2','AlertCircle','Upload','FileImage','X','Loader2',
  'Download','FileDown','Share2','ExternalLink','Info','Zap','Shield',
  'Tag','Box','ArrowDownRight','MoveRight','Workflow','Route',
  'Settings2','Binary','ScanLine','RadioTower','Waypoints',
];
const missing = needed.filter(n => !l[n]);
console.log('Missing:', missing.join(', ') || 'None');
console.log('Total checked:', needed.length);

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/SystemArchitectureSection.jsx',
  'src/components/ValidationRoadmapSection.jsx',
  'src/components/WhyExistingModelsSection.jsx',
  'src/components/FutureRoadmapSection.jsx',
  'src/components/FeaturesSection.jsx',
  'src/components/BenchmarkSection.jsx',
  'src/components/AIModelsSection.jsx',
  'src/components/CoreInnovationSection.jsx',
  'src/components/MedicalIllustration.jsx',
  'src/components/Navbar.jsx'
];

const replacements = [
  { from: 'UMIPE PREPROCESSING ENGINE', to: 'METAPREP AI ENGINE' },
  { from: 'UMIPE Stage', to: 'MetaPrep AI Stage' },
  { from: 'how UMIPE', to: 'how MetaPrep AI' },
  { from: '7-stage UMIPE pipeline', to: '7-stage MetaPrep AI pipeline' },
  { from: 'UMIPE Preprocessing', to: 'MetaPrep AI Preprocessing' },
  { from: 'UMIPE\'s', to: 'MetaPrep AI\'s' },
  { from: 'UMIPE intentionally', to: 'MetaPrep AI intentionally' },
  { from: 'UMIPE is continuously', to: 'MetaPrep AI is continuously' },
  { from: 'UMIPE bridges', to: 'MetaPrep AI bridges' },
  { from: 'UMIPE is designed', to: 'MetaPrep AI is designed' },
  { from: 'UMIPE integrates', to: 'MetaPrep AI integrates' },
  { from: 'UMIPE does not retrain', to: 'MetaPrep AI does not retrain' },
  { from: 'Without UMIPE', to: 'Without MetaPrep AI' },
  { from: 'UMIPE Pipeline', to: 'MetaPrep AI Pipeline' },
  { from: 'With UMIPE', to: 'With MetaPrep AI' },
  { from: 'UMIPE focuses', to: 'MetaPrep AI focuses' },
  { from: 'UMIPE isolates', to: 'MetaPrep AI isolates' },
  { from: 'aria-label="UMIPE', to: 'aria-label="MetaPrep AI' },
  { from: 'UMIPE SVG', to: 'MetaPrep AI SVG' },
  { from: 'UMIPE home', to: 'MetaPrep AI home' },
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    replacements.forEach(rep => {
      if (content.includes(rep.from)) {
        content = content.split(rep.from).join(rep.to);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});

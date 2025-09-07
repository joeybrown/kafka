#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const diagramsSrcDir = './diagrams';
const diagramsDistDir = './dist/diagrams';
const diagramsSrcOutputDir = './src/diagrams';

// Ensure dist directories exist
if (!fs.existsSync(diagramsDistDir)) {
  fs.mkdirSync(diagramsDistDir, { recursive: true });
}
if (!fs.existsSync(diagramsSrcOutputDir)) {
  fs.mkdirSync(diagramsSrcOutputDir, { recursive: true });
}

// Find all .mmd files in the src directory
const files = fs.readdirSync(diagramsSrcDir)
  .filter(file => file.endsWith('.mmd'))
  .map(file => path.basename(file, '.mmd'));

console.log(`Found ${files.length} diagram(s) to build:`);
files.forEach(file => console.log(`  - ${file}`));

// Build each diagram
files.forEach(file => {
  const inputFile = path.join(diagramsSrcDir, `${file}.mmd`);
  const outputFile = path.join(diagramsDistDir, `${file}.svg`);
  
  console.log(`Building ${file}...`);
  
  try {
    execSync(`yarn mmdc -i "${inputFile}" -o "${outputFile}" -w 500 -b transparent`, { stdio: 'inherit' });
    
    // Post-process the SVG to make it responsive
    let svgContent = fs.readFileSync(outputFile, 'utf8');
    
    // Update SVG to match container size exactly
    svgContent = svgContent.replace(/style="max-width: [^"]*"/, 'style="max-width: 500px; width: 500px; height: 300px;"');
    svgContent = svgContent.replace(/width="100%"/, 'width="500" height="300"');
    
    // Write the processed SVG
    fs.writeFileSync(outputFile, svgContent);
    
    // Copy SVG to src/diagrams for serving
    const srcSvgPath = path.join(diagramsSrcOutputDir, `${file}.svg`);
    fs.copyFileSync(outputFile, srcSvgPath);
    
    console.log(`✅ ${file}.svg generated`);
  } catch (error) {
    console.error(`❌ Failed to build ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('🎉 All diagrams built successfully!');

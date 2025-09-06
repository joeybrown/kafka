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
    execSync(`npx mmdc -i "${inputFile}" -o "${outputFile}" -w 1200 -H 800 -b transparent`, { stdio: 'inherit' });
    
    // Post-process SVG to remove only the problematic sizing attributes
    let svgContent = fs.readFileSync(outputFile, 'utf8');
    // Only remove the specific max-width style that conflicts with CSS
    svgContent = svgContent.replace(/style="max-width: [^"]*"/g, '');
    // Remove width and height from the root SVG element only
    svgContent = svgContent.replace(/<svg[^>]*width="[^"]*"[^>]*>/g, (match) => {
      return match.replace(/width="[^"]*"/g, '');
    });
    svgContent = svgContent.replace(/<svg[^>]*height="[^"]*"[^>]*>/g, (match) => {
      return match.replace(/height="[^"]*"/g, '');
    });
    fs.writeFileSync(outputFile, svgContent);
    
    // Copy SVG to src/diagrams for serving
    const srcSvgPath = path.join(diagramsSrcOutputDir, `${file}.svg`);
    fs.copyFileSync(outputFile, srcSvgPath);
    
    console.log(`✅ ${file}.svg generated and cleaned`);
  } catch (error) {
    console.error(`❌ Failed to build ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('🎉 All diagrams built successfully!');

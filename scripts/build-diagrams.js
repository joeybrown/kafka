#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

const diagramsSrcDir = './diagrams';
const diagramsDistDir = './dist/diagrams';
const diagramsSrcOutputDir = './src/diagrams';
const sizingConfigPath = './diagrams/sizing.yml';

// Load sizing configuration
let sizingConfig = {};
try {
  const configFile = fs.readFileSync(sizingConfigPath, 'utf8');
  sizingConfig = yaml.load(configFile);
} catch (error) {
  console.warn('⚠️  Could not load sizing.yml, using default sizes');
}

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
  
  // Get sizing configuration for this diagram
  const diagramConfig = sizingConfig.diagrams?.[file] || { width: 500 };
  const { width } = diagramConfig;
  
  console.log(`Building ${file}... (width: ${width}px)`);
  
  try {
    execSync(`yarn mmdc -i "${inputFile}" -o "${outputFile}" -w ${width} -b transparent`, { stdio: 'inherit' });
    
    // Post-process the SVG to match configured width (height will be auto-calculated)
    let svgContent = fs.readFileSync(outputFile, 'utf8');
    
    // Update SVG to use configured width with auto height
    svgContent = svgContent.replace(/style="max-width: [^"]*"/, `style="max-width: ${width}px; width: ${width}px;"`);
    svgContent = svgContent.replace(/width="100%"/, `width="${width}"`);
    
    // Write the processed SVG
    fs.writeFileSync(outputFile, svgContent);
    
    // Copy SVG to src/diagrams for serving
    const srcSvgPath = path.join(diagramsSrcOutputDir, `${file}.svg`);
    fs.copyFileSync(outputFile, srcSvgPath);
    
    console.log(`✅ ${file}.svg generated (width: ${width}px)`);
  } catch (error) {
    console.error(`❌ Failed to build ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('🎉 All diagrams built successfully!');

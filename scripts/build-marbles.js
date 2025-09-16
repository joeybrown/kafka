#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import { TestScheduler } from 'rxjs/testing';
import { of, interval, merge, map, take, delay } from 'rxjs';

const marblesSrcDir = './marbles';
const marblesDistDir = './dist/marbles';
const marblesSrcOutputDir = './src/marbles';

// Ensure directories exist
if (!fs.existsSync(marblesDistDir)) {
  fs.mkdirSync(marblesDistDir, { recursive: true });
}
if (!fs.existsSync(marblesSrcOutputDir)) {
  fs.mkdirSync(marblesSrcOutputDir, { recursive: true });
}

// Create marbles directory if it doesn't exist
if (!fs.existsSync(marblesSrcDir)) {
  fs.mkdirSync(marblesSrcDir, { recursive: true });
}

console.log('🎯 Building RxJS marble diagrams for Kafka partitions...');

// Load marble configurations from YAML
let marbleConfigs = [];
try {
  const configFile = fs.readFileSync('./marbles/kafka-marbles.yml', 'utf8');
  const config = yaml.load(configFile);
  marbleConfigs = Object.entries(config.diagrams).map(([name, config]) => ({
    name,
    ...config
  }));
  console.log(`Loaded ${marbleConfigs.length} marble diagram configurations from YAML`);
} catch (error) {
  console.warn('⚠️  Could not load kafka-marbles.yml, using default configurations');
  // Fallback to hardcoded configurations
  marbleConfigs = [
    {
      name: 'single-partition',
      title: 'Single Partition Processing',
      description: 'Messages flowing through a single Kafka partition',
      width: 800,
      height: 300,
      streams: {
        producer: 'a---b---c---d---|',
        partition: 'a---b---c---d---|',
        consumer: '--a---b---c---d-|'
      }
    },
    {
      name: 'multiple-partitions',
      title: 'Multiple Partition Processing',
      description: 'Messages distributed across multiple partitions',
      width: 1000,
      height: 400,
      streams: {
        producer: 'a---b---c---d---e---f---|',
        partition0: 'a-------c-------e-----|',
        partition1: '---b-------d-------f-|',
        consumer: '--a---b---c---d---e---f-|'
      }
    },
    {
      name: 'partition-rebalancing',
      title: 'Consumer Group Rebalancing',
      description: 'How consumers handle partition reassignment',
      width: 1200,
      height: 500,
      streams: {
        partition0: 'a---b---c---d---e---f---|',
        partition1: '---x---y---z---w-------|',
        consumer1: 'a---b---c---d---e---f---|',
        consumer2: '---x---y---z---w-------|',
        rebalance: '-------R---------------|'
      }
    },
    {
      name: 'backpressure',
      title: 'Backpressure Handling',
      description: 'How consumers handle high message rates',
      width: 1000,
      height: 350,
      streams: {
        producer: 'a-b-c-d-e-f-g-h-i-j-k-l-|',
        consumer: 'a---b---c---d---e---f---|',
        buffer: '--b-c-d-e-f-g-h-i-j-k-l-|'
      }
    },
    {
      name: 'exactly-once',
      title: 'Exactly-Once Processing',
      description: 'Ensuring messages are processed exactly once',
      width: 1000,
      height: 400,
      streams: {
        message: 'a---b---c---d---e---f---|',
        processing: 'a---b---c---d---e---f---|',
        commit: '----a---b---c---d---e---f-|',
        duplicate: '-------c---------------|'
      }
    }
  ];
}

// Function to generate SVG marble diagram
function generateMarbleSVG(config) {
  const { name, title, description, width, height, streams } = config;
  
  // Create an authentic RxJS marble diagram
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: bold; fill: #2c3e50; }
      .description { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; fill: #7f8c8d; }
      .stream-label { font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 600; fill: #34495e; }
      .timeline { stroke: #34495e; stroke-width: 3; fill: none; }
      .timeline-arrow { stroke: #34495e; stroke-width: 3; fill: none; marker-end: url(#arrowhead); }
      .producer-bg { fill: #e8f5e8; fill-opacity: 0.3; stroke: #27ae60; stroke-width: 1; stroke-dasharray: 5,5; }
      .topic-bg { fill: #f3e5f5; fill-opacity: 0.3; stroke: #9b59b6; stroke-width: 1; stroke-dasharray: 5,5; }
      .partition-bg { fill: #e8f4fd; fill-opacity: 0.3; stroke: #3498db; stroke-width: 1; stroke-dasharray: 5,5; }
      .consumer-bg { fill: #fef9e7; fill-opacity: 0.3; stroke: #f39c12; stroke-width: 1; stroke-dasharray: 5,5; }
      .marble { fill: #3498db; stroke: #2980b9; stroke-width: 2; }
      .marble-blue { fill: #3498db; stroke: #2980b9; stroke-width: 2; }
      .marble-green { fill: #27ae60; stroke: #229954; stroke-width: 2; }
      .marble-purple { fill: #9b59b6; stroke: #8e44ad; stroke-width: 2; }
      .marble-orange { fill: #f39c12; stroke: #e67e22; stroke-width: 2; }
      .marble-red { fill: #e74c3c; stroke: #c0392b; stroke-width: 2; }
      .marble-yellow { fill: #f1c40f; stroke: #f39c12; stroke-width: 2; }
      .marble-teal { fill: #1abc9c; stroke: #16a085; stroke-width: 2; }
      .marble-pink { fill: #e91e63; stroke: #c2185b; stroke-width: 2; }
      .marble-indigo { fill: #6366f1; stroke: #4f46e5; stroke-width: 2; }
      .marble-cyan { fill: #06b6d4; stroke: #0891b2; stroke-width: 2; }
      .marble-lime { fill: #84cc16; stroke: #65a30d; stroke-width: 2; }
      .marble-amber { fill: #f59e0b; stroke: #d97706; stroke-width: 2; }
      .marble-emerald { fill: #10b981; stroke: #059669; stroke-width: 2; }
      .marble-rose { fill: #f43f5e; stroke: #e11d48; stroke-width: 2; }
      .marble-violet { fill: #8b5cf6; stroke: #7c3aed; stroke-width: 2; }
      .marble-sky { fill: #0ea5e9; stroke: #0284c7; stroke-width: 2; }
      .marble-stone { fill: #78716c; stroke: #57534e; stroke-width: 2; }
      .marble-slate { fill: #64748b; stroke: #475569; stroke-width: 2; }
      .marble-zinc { fill: #71717a; stroke: #52525b; stroke-width: 2; }
      .marble-neutral { fill: #a3a3a3; stroke: #737373; stroke-width: 2; }
      .marble-error { fill: #e74c3c; stroke: #c0392b; stroke-width: 2; }
      .marble-complete { fill: #27ae60; stroke: #229954; stroke-width: 2; }
      .marble-special { fill: #f39c12; stroke: #e67e22; stroke-width: 2; }
      .frame-marker { stroke: #bdc3c7; stroke-width: 1; fill: none; }
      .frame-number { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; fill: #95a5a6; }
      .marble-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: white; text-anchor: middle; }
      .marble-text-dark { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #2c3e50; text-anchor: middle; }
      .offset-label { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; font-weight: 600; fill: #2c3e50; text-anchor: middle; }
      .offset-bg { fill: #ecf0f1; fill-opacity: 0.8; stroke: #bdc3c7; stroke-width: 1; rx: 3; }
    </style>
    <marker id="arrowhead" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
      <polygon points="0 0, 12 4, 0 8" fill="#34495e" />
    </marker>
    <filter id="marbleShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#f8f9fa" stroke="none"/>
  
  <!-- Title -->
  <text x="30" y="35" class="title">${title}</text>
  <text x="30" y="55" class="description">${description}</text>
  
  <!-- Frame markers -->
  ${Array.from({ length: 20 }, (_, i) => {
    const x = 50 + (i * (width - 100) / 19);
    return `
      <line x1="${x}" y1="100" x2="${x}" y2="${height - 40}" class="frame-marker" />
      <text x="${x}" y="${height - 20}" class="frame-number" text-anchor="middle">${i}</text>
    `;
  }).join('')}
  
  <!-- Component group backgrounds -->
  ${(() => {
    const producerStreams = Object.entries(streams).filter(([name]) => 
      name.toLowerCase().includes('producer') || name.toLowerCase().includes('message')
    );
    const topicStreams = Object.entries(streams).filter(([name]) => 
      name.toLowerCase().includes('topic')
    );
    const partitionStreams = Object.entries(streams).filter(([name]) => 
      name.toLowerCase().includes('partition') || name.toLowerCase().includes('buffer')
    );
    const consumerStreams = Object.entries(streams).filter(([name]) => 
      name.toLowerCase().includes('consumer') || name.toLowerCase().includes('processing') || 
      name.toLowerCase().includes('commit') || name.toLowerCase().includes('retry') || 
      name.toLowerCase().includes('dlq') || name.toLowerCase().includes('lag') || 
      name.toLowerCase().includes('catch_up') || name.toLowerCase().includes('compact')
    );

    let backgrounds = '';
    
    // Producer background
    if (producerStreams.length > 0) {
      const firstProducerY = 120 + (Object.keys(streams).indexOf(producerStreams[0][0]) * 100) - 45; // Include label area
      const lastProducerY = 120 + (Object.keys(streams).indexOf(producerStreams[producerStreams.length - 1][0]) * 100) + 20;
      backgrounds += `<rect x="20" y="${firstProducerY}" width="${width - 40}" height="${lastProducerY - firstProducerY}" class="producer-bg" />`;
    }
    
    // Topic background
    if (topicStreams.length > 0) {
      const firstTopicY = 120 + (Object.keys(streams).indexOf(topicStreams[0][0]) * 100) - 45; // Include label area
      const lastTopicY = 120 + (Object.keys(streams).indexOf(topicStreams[topicStreams.length - 1][0]) * 100) + 20;
      backgrounds += `<rect x="20" y="${firstTopicY}" width="${width - 40}" height="${lastTopicY - firstTopicY}" class="topic-bg" />`;
    }
    
    // Partition background
    if (partitionStreams.length > 0) {
      const firstPartitionY = 120 + (Object.keys(streams).indexOf(partitionStreams[0][0]) * 100) - 45; // Include label area
      const lastPartitionY = 120 + (Object.keys(streams).indexOf(partitionStreams[partitionStreams.length - 1][0]) * 100) + 20;
      backgrounds += `<rect x="20" y="${firstPartitionY}" width="${width - 40}" height="${lastPartitionY - firstPartitionY}" class="partition-bg" />`;
    }
    
    // Consumer background
    if (consumerStreams.length > 0) {
      const firstConsumerY = 120 + (Object.keys(streams).indexOf(consumerStreams[0][0]) * 100) - 45; // Include label area
      const lastConsumerY = 120 + (Object.keys(streams).indexOf(consumerStreams[consumerStreams.length - 1][0]) * 100) + 20;
      backgrounds += `<rect x="20" y="${firstConsumerY}" width="${width - 40}" height="${lastConsumerY - firstConsumerY}" class="consumer-bg" />`;
    }
    
    return backgrounds;
  })()}
  
  <!-- Streams -->
  ${Object.entries(streams).map(([streamName, marbleString], index) => {
    const y = 120 + (index * 100); // Increased spacing between streams
    const streamLabel = streamName.charAt(0).toUpperCase() + streamName.slice(1);
    
    return `
      <!-- ${streamLabel} stream -->
      <text x="30" y="${y - 25}" class="stream-label">${streamLabel}:</text>
      <line x1="50" y1="${y}" x2="${width - 50}" y2="${y}" class="timeline" />
      <line x1="${width - 50}" y1="${y}" x2="${width - 30}" y2="${y}" class="timeline-arrow" />
      
      ${generateRxJSMarbles(marbleString, 50, y, width - 100, index, Object.keys(streams).length, streamName)}
    `;
  }).join('')}
  
</svg>`;

  return svg;
}

// Function to generate authentic RxJS marble diagrams with message-based coloring
function generateRxJSMarbles(marbleString, startX, y, width, streamIndex, totalStreams, streamName) {
  const marbles = [];
  const frameWidth = width / 20; // 20 time frames
  const marbleSize = 12; // Marble radius
  let currentFrame = 0;
  let messageCount = 0; // Track message count for offset labels
  
  // Parse the marble string and create marbles with proper timing
  for (let i = 0; i < marbleString.length; i++) {
    const char = marbleString[i];
    
    if (char === '-') {
      // Time delay - move to next frame
      currentFrame++;
    } else if (char === 'a' || char === 'b' || char === 'c' || char === 'd' || char === 'e' || char === 'f' || 
               char === 'g' || char === 'h' || char === 'i' || char === 'j' || char === 'k' || char === 'l' ||
               char === 'x' || char === 'y' || char === 'z' || char === 'w' || char === 'v' || char === 'u' ||
               char === 't' || char === 's' || char === 'r' || char === 'q' || char === 'p' || char === 'o' ||
               char === 'n' || char === 'm') {
      // Regular message marble - color based on message identifier
      // Ensure marble stays within timeline bounds (accounting for marble radius)
      const x = Math.min(startX + (currentFrame * frameWidth), startX + width - marbleSize - 20);
      const marbleClass = getMessageColor(char);
      const isPartitionStream = streamName && (streamName.toLowerCase().includes('partition') || streamName.toLowerCase().includes('topic'));
      marbles.push(createMarble(x, y, char, marbleClass, isPartitionStream, messageCount));
      messageCount++;
      currentFrame++;
    } else if (char === 'R') {
      // Rebalancing event
      const x = Math.min(startX + (currentFrame * frameWidth), startX + width - marbleSize - 20);
      const isPartitionStream = streamName && (streamName.toLowerCase().includes('partition') || streamName.toLowerCase().includes('topic'));
      marbles.push(createMarble(x, y, 'R', 'marble-special', isPartitionStream, messageCount));
      currentFrame++;
    } else if (char === 'X') {
      // Error marble
      const x = Math.min(startX + (currentFrame * frameWidth), startX + width - marbleSize - 20);
      const isPartitionStream = streamName && (streamName.toLowerCase().includes('partition') || streamName.toLowerCase().includes('topic'));
      marbles.push(createMarble(x, y, 'X', 'marble-error', isPartitionStream, messageCount));
      currentFrame++;
    } else if (char === '|') {
      // Completion marble - place at the very end
      const x = startX + width - marbleSize;
      const isPartitionStream = streamName && (streamName.toLowerCase().includes('partition') || streamName.toLowerCase().includes('topic'));
      marbles.push(createMarble(x, y, '|', 'marble-complete', isPartitionStream, messageCount));
      currentFrame++;
    } else if (char === 'C') {
      // Compaction event
      const x = Math.min(startX + (currentFrame * frameWidth), startX + width - marbleSize - 20);
      const isPartitionStream = streamName && (streamName.toLowerCase().includes('partition') || streamName.toLowerCase().includes('topic'));
      marbles.push(createMarble(x, y, 'C', 'marble-special', isPartitionStream, messageCount));
      currentFrame++;
    } else if (char === 'L') {
      // Lag indicator
      const x = Math.min(startX + (currentFrame * frameWidth), startX + width - marbleSize - 20);
      const isPartitionStream = streamName && (streamName.toLowerCase().includes('partition') || streamName.toLowerCase().includes('topic'));
      marbles.push(createMarble(x, y, 'L', 'marble-special', isPartitionStream, messageCount));
      currentFrame++;
    }
  }
  
  return marbles.join('');
}

// Function to determine marble color based on message identifier
function getMessageColor(char) {
  const messageColors = {
    'a': 'marble-blue',     // Blue
    'b': 'marble-green',    // Green
    'c': 'marble-purple',   // Purple
    'd': 'marble-orange',   // Orange
    'e': 'marble-red',      // Red
    'f': 'marble-yellow',   // Yellow
    'g': 'marble-teal',     // Teal
    'h': 'marble-pink',     // Pink
    'i': 'marble-indigo',   // Indigo
    'j': 'marble-cyan',     // Cyan
    'k': 'marble-lime',     // Lime
    'l': 'marble-amber',    // Amber
    'm': 'marble-emerald',  // Emerald
    'n': 'marble-rose',     // Rose
    'o': 'marble-violet',   // Violet
    'p': 'marble-sky',      // Sky
    'q': 'marble-stone',    // Stone
    'r': 'marble-slate',    // Slate
    's': 'marble-zinc',     // Zinc
    't': 'marble-neutral',  // Neutral
    'u': 'marble-stone',    // Stone
    'v': 'marble-red',      // Red
    'w': 'marble-orange',   // Orange
    'x': 'marble-yellow',   // Yellow
    'y': 'marble-green',    // Green
    'z': 'marble-blue'      // Blue
  };
  
  return messageColors[char] || 'marble';
}

// Function to generate a smart legend based on message colors used in the diagram
function generateSmartLegend(streams, width) {
  const legendItems = [];
  let yOffset = 25;
  
  // Collect all unique message identifiers from all streams
  const allMessages = new Set();
  Object.values(streams).forEach(marbleString => {
    for (const char of marbleString) {
      if (char.match(/[a-z]/)) {
        allMessages.add(char);
      }
    }
  });
  
  // Sort messages alphabetically for consistent legend
  const sortedMessages = Array.from(allMessages).sort();
  
  // Add message color legend items
  sortedMessages.forEach(char => {
    const marbleClass = getMessageColor(char);
    legendItems.push(`
      <circle cx="25" cy="${yOffset}" r="12" class="${marbleClass}" filter="url(#marbleShadow)" />
      <text x="25" y="${yOffset + 5}" class="marble-text">${char}</text>
      <text x="45" y="${yOffset + 5}" class="description">Message ${char.toUpperCase()}</text>
    `);
    yOffset += 25;
  });
  
  // Check for special events across all streams
  const hasSpecialEvents = Object.values(streams).some(marbleString => 
    marbleString.includes('R') || marbleString.includes('C') || marbleString.includes('L')
  );
  const hasErrors = Object.values(streams).some(marbleString => marbleString.includes('X'));
  const hasCompletion = Object.values(streams).some(marbleString => marbleString.includes('|'));
  
  // Add special events if present
  if (hasSpecialEvents) {
    legendItems.push(`
      <polygon points="25,${yOffset - 12} 37,${yOffset} 25,${yOffset + 12} 13,${yOffset}" 
               class="marble-special" filter="url(#marbleShadow)" />
      <text x="25" y="${yOffset + 4}" class="marble-text-dark">R</text>
      <text x="45" y="${yOffset + 5}" class="description">Events</text>
    `);
    yOffset += 25;
  }
  
  if (hasErrors) {
    legendItems.push(`
      <rect x="13" y="${yOffset - 12}" width="24" height="24" class="marble-error" rx="3" filter="url(#marbleShadow)" />
      <text x="25" y="${yOffset + 4}" class="marble-text">X</text>
      <text x="45" y="${yOffset + 5}" class="description">Errors</text>
    `);
    yOffset += 25;
  }
  
  if (hasCompletion) {
    legendItems.push(`
      <circle cx="25" cy="${yOffset}" r="12" class="marble-complete" filter="url(#marbleShadow)" />
      <text x="25" y="${yOffset + 5}" class="marble-text">|</text>
      <text x="45" y="${yOffset + 5}" class="description">Complete</text>
    `);
    yOffset += 25;
  }
  
  const legendHeight = Math.max(120, yOffset + 10);
  
  return `
    <g transform="translate(${width - 250}, 30)">
      <rect x="0" y="0" width="220" height="${legendHeight}" fill="white" stroke="#bdc3c7" stroke-width="1" rx="8" />
      <text x="15" y="20" class="stream-label">Legend:</text>
      ${legendItems.join('')}
    </g>
  `;
}

// Helper function to create a marble with proper styling
function createMarble(x, y, char, className, isPartitionStream = false, messageCount = 0) {
  const marbleSize = 12;
  const shadowFilter = 'url(#marbleShadow)';
  
  let marbleElement = '';
  
  if (className === 'marble-special') {
    // Special marbles (rebalancing, compaction, etc.) - diamond shape
    marbleElement = `
      <g filter="${shadowFilter}">
        <polygon points="${x},${y - marbleSize} ${x + marbleSize},${y} ${x},${y + marbleSize} ${x - marbleSize},${y}" 
                 class="${className}" />
        <text x="${x}" y="${y + 4}" class="marble-text-dark">${char}</text>
      </g>
    `;
  } else if (className === 'marble-error') {
    // Error marbles - square shape
    marbleElement = `
      <g filter="${shadowFilter}">
        <rect x="${x - marbleSize}" y="${y - marbleSize}" width="${marbleSize * 2}" height="${marbleSize * 2}" 
              class="${className}" rx="3" />
        <text x="${x}" y="${y + 4}" class="marble-text">${char}</text>
      </g>
    `;
  } else {
    // Regular marbles - circle shape
    marbleElement = `
      <g filter="${shadowFilter}">
        <circle cx="${x}" cy="${y}" r="${marbleSize}" class="${className}" />
        <text x="${x}" y="${y + 4}" class="marble-text">${char}</text>
      </g>
    `;
  }
  
  // Add offset label for partition streams
  if (isPartitionStream && (char.match(/[a-z]/) || char === '|')) {
    const offsetY = y + marbleSize + 20;
    const offsetText = char === '|' ? 'EOF' : `offset: ${messageCount}`;
    marbleElement += `
      <g>
        <rect x="${x - 25}" y="${offsetY - 8}" width="50" height="16" class="offset-bg" />
        <text x="${x}" y="${offsetY + 3}" class="offset-label">${offsetText}</text>
      </g>
    `;
  }
  
  return marbleElement;
}

// Generate all marble diagrams
marbleConfigs.forEach(config => {
  console.log(`Generating ${config.name}...`);
  
  const svg = generateMarbleSVG(config);
  const outputFile = path.join(marblesDistDir, `${config.name}.svg`);
  const srcFile = path.join(marblesSrcOutputDir, `${config.name}.svg`);
  
  // Write SVG files
  fs.writeFileSync(outputFile, svg);
  fs.writeFileSync(srcFile, svg);
  
  console.log(`✅ ${config.name}.svg generated`);
});

// Create a README for the marbles
const readmeContent = `# Kafka Partition Marble Diagrams

This directory contains RxJS-style marble diagrams that visualize how Kafka partitions work.

## Generated Diagrams

${marbleConfigs.map(config => `
### ${config.title}
- **File**: \`${config.name}.svg\`
- **Description**: ${config.description}
- **Dimensions**: ${config.width}x${config.height}px
`).join('')}

## Usage

These diagrams are automatically generated and can be included in your presentations by referencing them in your Markdown files:

\`\`\`markdown
![${marbleConfigs[0].title}](./marbles/${marbleConfigs[0].name}.svg)
\`\`\`

## Regenerating

To regenerate all marble diagrams, run:

\`\`\`bash
yarn marbles
\`\`\`
`;

fs.writeFileSync(path.join(marblesSrcOutputDir, 'README.md'), readmeContent);

console.log('🎉 All marble diagrams built successfully!');
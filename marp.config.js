module.exports = {
  // Enable HTML output
  html: true,
  
  // Enable PDF output
  pdf: true,
  
  // Enable PowerPoint output
  pptx: true,
  
  // Custom theme configuration
  theme: 'default',
  
  // Custom CSS
  css: `
    section {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    h1, h2, h3 {
      color: #fff;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    code {
      background: rgba(255,255,255,0.2);
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    
    pre {
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      padding: 1em;
    }
  `,
  
  // Output options
  output: {
    html: {
      enabled: true,
      output: './dist'
    },
    pdf: {
      enabled: true,
      output: './dist'
    },
    pptx: {
      enabled: true,
      output: './dist'
    }
  }
};

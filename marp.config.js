export const html = true;
export const pdf = true;
export const pptx = true;
export const theme = 'default';
export const css = `
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
    
    img {
      max-height: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
  `;

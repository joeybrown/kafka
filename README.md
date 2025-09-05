# Kafka Presentations

A Marp-based presentation project for creating beautiful slides about Apache Kafka and related topics.

## Prerequisites

- Node.js 24.7.0 (as specified in `.tool-versions`)
- Yarn package manager

## Setup

1. **Install dependencies:**

   ```bash
   yarn install
   ```

2. **Install Marp CLI:**
   ```bash
   yarn install:marp
   ```

## Usage

### Development

Start the development server with live reload:

```bash
yarn dev
```

This will:

- Start a local server (usually at http://localhost:8080)
- Watch for file changes and auto-reload
- Serve presentations from the `src/` directory

### Building Presentations

Build all presentations to different formats:

```bash
# Build all formats (HTML, PDF, PPTX)
yarn build

# Build specific formats
yarn build:html    # HTML only
yarn build:pdf     # PDF only
yarn build:pptx    # PowerPoint only
```

### Other Commands

```bash
# Serve presentations without watch mode
yarn serve

# Watch and build (no server)
yarn watch
```

## Project Structure

```
├── src/                    # Source markdown files
│   └── kafka-introduction.md
├── dist/                   # Generated presentations
├── marp.config.js         # Marp configuration
├── package.json           # Dependencies and scripts
├── .yarnrc.yml           # Yarn configuration
└── README.md             # This file
```

## Creating New Presentations

1. Create a new `.md` file in the `src/` directory
2. Add the Marp frontmatter at the top:
   ```markdown
   ---
   marp: true
   theme: default
   paginate: true
   ---
   ```
3. Write your slides using Markdown syntax
4. Use `---` to separate slides

## Customization

The project includes a custom theme with:

- Gradient backgrounds
- Custom typography
- Code highlighting
- Responsive design

Modify `marp.config.js` to customize the appearance further.

## Examples

- `kafka-introduction.md` - Basic Kafka overview presentation

## Deployment

### Heroku Deployment

This project is configured for easy deployment to Heroku:

#### Option 1: Deploy with Heroku CLI

```bash
# Install Heroku CLI if you haven't already
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Deploy to Heroku
git push heroku main
```

#### Option 2: Deploy with GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to Heroku
3. Enable automatic deployments

#### Option 3: One-Click Deploy

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/kafka-presentations)

### Environment Variables

- `PORT` - Automatically set by Heroku
- `NODE_ENV` - Set to "production" on Heroku

### Heroku Configuration

- **Stack**: heroku-22
- **Buildpack**: heroku/nodejs
- **Dyno Type**: eco (free tier)

## Resources

- [Marp Documentation](https://marpit.marp.app/)
- [Marp CLI Documentation](https://github.com/marp-team/marp-cli)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Heroku Node.js Documentation](https://devcenter.heroku.com/articles/getting-started-with-nodejs)

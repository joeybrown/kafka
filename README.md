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

### Other Commands

```bash
# Serve presentations without watch mode
yarn serve

# Watch and build (no server)
yarn watch
```

## Customization

Modify `marp.config.js` to customize the appearance further.

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

### Environment Variables

- `PORT` - Automatically set by Heroku
- `NODE_ENV` - Set to "production" on Heroku

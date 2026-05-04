# TUM Web Lab 6 - API & Subscription Manager

A modern React application for tracking subscriptions and managing API Keys and usage. Built with React, Vite, and Tailwind CSS v4.

## Features
- **Subscription Management**: Track your monthly recurring services and costs.
- **API Key Management**: Securely mask and store LLM API keys.
- **Usage Tracking**: Monitor API tokens used and their estimated costs.
- **Dark Mode**: Fully supports high-end dark and light modes.
- **Hash Routing**: Multi-page layout via seamless `#` based client-side routing.

## Development

To start the development server:
```bash
npm install
npm run dev
```

## Deployment
This project is configured to auto-deploy to **GitHub Pages** using GitHub Actions via the `.github/workflows/deploy.yml` workflow file. 

Whenever you push to `main` or `master`, the workflow will:
1. Check out the latest code.
2. Build the Vite application outputting to the `dist` folder.
3. Deploy the artifacts to your GitHub Pages URL automatically.

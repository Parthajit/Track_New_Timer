<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Track My Timer - Deployment Guide

This application is configured for automatic deployment to your custom domain via GitHub Actions.

## Setting Up GitHub Actions

To make the deployment work, you must configure the following **Secrets** in your GitHub Repository settings (`Settings > Secrets and variables > Actions`):

1.  **`GEMINI_API_KEY`**: Your Google Gemini API key.
2.  **`CUSTOM_DOMAIN`**: Your domain name (e.g., `www.yourdomain.com` or `timer.yourdomain.com`).

## Deployment Process

1.  **Push to Main**: Every push to the `main` branch triggers the `.github/workflows/deploy.yml` workflow.
2.  **Build**: GitHub Actions installs dependencies and runs `npm run build`.
3.  **CNAME**: A `CNAME` file is automatically generated in the build folder to support your custom domain.
4.  **Publish**: The `dist/` folder is uploaded and deployed to the `github-pages` environment.

## Domain Configuration (DNS)

Ensure your domain's DNS settings point to GitHub Pages servers:
- **A Records**: Point to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`.
- **CNAME Record**: If using a subdomain (like `timer.domain.com`), point it to `[your-username].github.io`.

---

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local)
3. Run the app: `npm run dev`
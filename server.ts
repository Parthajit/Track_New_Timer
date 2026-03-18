import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === "production";
  const root = process.cwd();

  console.log(`Starting server in ${isProd ? 'production' : 'development'} mode...`);
  console.log(`Working directory: ${root}`);

  let vite: any;
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware loaded");
  } else {
    const distPath = path.resolve(root, 'dist');
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath, { index: false }));
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: isProd ? "production" : "development" });
  });

  // Handle SPA fallback - serve index.html for all non-API requests
  app.get('*', async (req, res) => {
    const url = req.originalUrl;
    console.log(`Request received: ${url}`);

    try {
      if (!isProd) {
        // In development, read index.html from root, transform it with Vite, and serve it
        const templatePath = path.resolve(root, "index.html");
        let template = await fs.readFile(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } else {
        // In production, serve the built index.html from the dist directory
        const indexPath = path.resolve(root, 'dist', 'index.html');
        
        // Check if index.html exists in dist
        try {
          await fs.access(indexPath);
          res.sendFile(indexPath);
        } catch (err) {
          console.error(`Production index.html not found at ${indexPath}. Falling back to root index.html`);
          // Fallback to root index.html if dist/index.html is missing (though it shouldn't be)
          res.sendFile(path.resolve(root, 'index.html'));
        }
      }
    } catch (e: any) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error("Error serving index.html:", e.stack);
      res.status(500).end(e.stack);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

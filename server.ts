import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    // In development, use Vite middleware in 'custom' mode to handle HTML manually
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from the dist directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Handle SPA fallback - serve index.html for all non-API requests
  app.get('*', async (req, res) => {
    const url = req.originalUrl;

    try {
      if (process.env.NODE_ENV !== "production") {
        // In development, read index.html from root, transform it with Vite, and serve it
        const templatePath = path.resolve(__dirname, "index.html");
        let template = await fs.readFile(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } else {
        // In production, serve the built index.html from the dist directory
        const indexPath = path.join(process.cwd(), 'dist', 'index.html');
        res.sendFile(indexPath);
      }
    } catch (e: any) {
      if (process.env.NODE_ENV !== "production" && vite) {
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

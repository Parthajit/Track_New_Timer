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

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    app.get('*', async (req: express.Request, res: express.Response) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.resolve(root, "index.html");
        let template = await fs.readFile(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        console.error(e.stack);
        res.status(500).end(e.stack);
      }
    });
  } else {
    const distPath = path.resolve(root, 'dist');
    app.use(express.static(distPath, { index: false }));

    app.get('*', async (req: express.Request, res: express.Response) => {
      const indexPath = path.resolve(distPath, 'index.html');
      try {
        await fs.access(indexPath);
        res.sendFile(indexPath);
      } catch (err) {
        // Fallback to root index.html if dist/index.html is missing
        res.sendFile(path.resolve(root, 'index.html'));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { MOCK_NEWS } from "./src/constants";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API recommendations endpoint
  app.get("/api/recommendations", (req, res) => {
    const { userId, bookmarks } = req.query;
    
    // In a real app, we would query a DB for reading history.
    // For this demonstration, we'll use simple logic:
    // 1. If user has bookmarks, recommend articles in same categories
    // 2. Otherwise return high impact articles or a random selection
    
    let recommended = [];
    const bookmarkList = bookmarks ? (bookmarks as string).split(",") : [];
    
    const bookmarkedArticles = MOCK_NEWS.filter(a => bookmarkList.includes(a.id));
    const preferredCategories = Array.from(new Set(bookmarkedArticles.map(a => a.category)));
    
    if (preferredCategories.length > 0) {
      recommended = MOCK_NEWS.filter(a => 
        !bookmarkList.includes(a.id) && 
        preferredCategories.includes(a.category)
      );
    }
    
    // If we don't have enough, add some high impact ones
    if (recommended.length < 3) {
      const highImpact = MOCK_NEWS.filter(a => 
        a.isHighImpact && 
        !bookmarkList.includes(a.id) && 
        !recommended.some(r => r.id === a.id)
      );
      recommended = [...recommended, ...highImpact];
    }

    // Limit to 4 recommendations for UI purposes
    res.json(recommended.slice(0, 4));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

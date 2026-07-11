import { defineConfig, type Connect } from "vite";
import react from "vite-plugin-framer";

const hostedModules = new Map<string, string>();

function addModuleHostingMiddleware(server: any) {
  server.middlewares.use(async (req: any, res: any, next: any) => {
    // POST /host-module — accept { name, code, version } and store
    if (req.method === "POST" && req.url === "/host-module") {
      let body = "";
      req.on("data", (chunk: string) => (body += chunk));
      req.on("end", () => {
        try {
          const { name, code, version } = JSON.parse(body);
          const key = name + (version ? `@${version}` : "");
          hostedModules.set(key, code);
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "https://framer.com");
          res.setHeader("Access-Control-Allow-Private-Network", "true");
          res.end(JSON.stringify({
            url: `https://localhost:3000/modules/${encodeURIComponent(key)}.js`,
          }));
        } catch {
          res.statusCode = 400;
          res.end("Invalid JSON");
        }
      });
      return;
    }
    // GET /modules/:name — serve hosted code
    const match = req.url?.match(/^\/modules\/(.+)\.js$/);
    if (match && req.method === "GET") {
      const key = decodeURIComponent(match[1]);
      const code = hostedModules.get(key);
      if (code) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "https://framer.com");
        res.setHeader("Access-Control-Allow-Private-Network", "true");
        res.end(code);
      } else {
        res.statusCode = 404;
        res.end("Module not found");
      }
      return;
    }
    next();
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "framer-private-network",
      configureServer(server) {
        // 1) Handle OPTIONS preflight with Private Network opt-in
        const preflightHandler: Connect.NextHandleFunction = (req, res, next) => {
          if (req.method !== "OPTIONS") {
            next();
            return;
          }
          res.setHeader("Access-Control-Allow-Origin", "https://framer.com");
          res.setHeader("Access-Control-Allow-Private-Network", "true");
          res.setHeader("Access-Control-Allow-Methods", "*");
          res.setHeader("Access-Control-Allow-Headers", "*");
          res.statusCode = 204;
          res.end();
        };
        const stack = (server.middlewares as any).stack;
        if (Array.isArray(stack)) {
          stack.unshift({ route: "", handle: preflightHandler });
        }

        // 2) Override CORS + add Private-Network on ALL actual responses (runs after Vite's CORS middleware, so it takes precedence)
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Access-Control-Allow-Origin", "https://framer.com");
          res.setHeader("Access-Control-Allow-Private-Network", "true");
          next();
        });

        // 3) Module hosting — serve code modules for framer.addComponentInstance
        addModuleHostingMiddleware(server);
      },
    },
  ],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    https: {
      key: "C:/Users/hp/framer/forge/localhost+2-key.pem",
      cert: "C:/Users/hp/framer/forge/localhost+2.pem",
    },
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
});

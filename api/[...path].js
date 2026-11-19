const http = require("http");

const BACKEND_HOST = "78.154.103.37";
const BACKEND_PORT = 14370;

module.exports = (req, res) => {
  const targetPath = req.url || "/api/health";
  const headers = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    const lk = k.toLowerCase();
    if (["content-type", "x-telegram-init-data", "x-telegram-user-id"].includes(lk)) {
      headers[lk] = v;
    }
  }

  let bodyBuf = null;
  if (req.method && !["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase()) && req.body !== undefined) {
    if (Buffer.isBuffer(req.body)) {
      bodyBuf = req.body;
    } else if (typeof req.body === "string") {
      bodyBuf = Buffer.from(req.body, "utf8");
    } else {
      bodyBuf = Buffer.from(JSON.stringify(req.body), "utf8");
      if (!headers["content-type"]) headers["content-type"] = "application/json; charset=utf-8";
    }
    headers["content-length"] = String(bodyBuf.length);
  }

  const proxyReq = http.request(
    {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: targetPath,
      method: req.method || "GET",
      headers,
      timeout: 25000,
    },
    (proxyRes) => {
      const chunks = [];
      proxyRes.on("data", (c) => chunks.push(c));
      proxyRes.on("end", () => {
        const buf = Buffer.concat(chunks);
        res.statusCode = proxyRes.statusCode || 200;
        const ct = proxyRes.headers["content-type"] || "application/json; charset=utf-8";
        res.setHeader("Content-Type", ct);
        res.setHeader("Access-Control-Allow-Origin", "*");
        if (targetPath.startsWith("/api/media/") && res.statusCode === 200) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "no-store");
        }
        if (proxyRes.headers["content-disposition"]) {
          res.setHeader("Content-Disposition", proxyRes.headers["content-disposition"]);
        }
        res.end(buf);
      });
    },
  );

  proxyReq.on("error", (err) => {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: `Помилка з'єднання з сервером: ${err.message}` }));
  });

  proxyReq.on("timeout", () => {
    proxyReq.destroy();
    res.statusCode = 504;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "Таймаут сервера 78.154.103.37:14370" }));
  });

  if (bodyBuf && bodyBuf.length > 0) {
    proxyReq.write(bodyBuf);
  }
  proxyReq.end();
};

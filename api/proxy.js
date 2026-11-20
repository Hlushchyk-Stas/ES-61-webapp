const http = require("http");

const BACKEND_HOST = "78.154.103.37";
const BACKEND_PORT = 14370;

function readRawRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function buildTargetPath(req) {
  const urlObj = new URL(req.url || "/api/health", "http://localhost");
  const pathParam = urlObj.searchParams.get("__path");
  if (pathParam !== null) {
    urlObj.searchParams.delete("__path");
    const cleanPath = String(pathParam).replace(/^\/+/, "");
    const qs = urlObj.searchParams.toString();
    return `/api/${cleanPath}${qs ? `?${qs}` : ""}`;
  }
  return urlObj.pathname + urlObj.search;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Telegram-Init-Data");

  if ((req.method || "").toUpperCase() === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const targetPath = buildTargetPath(req);
  const headers = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    const lk = k.toLowerCase();
    if (["content-type", "x-telegram-init-data"].includes(lk)) {
      headers[lk] = v;
    }
  }

  const method = (req.method || "GET").toUpperCase();
  let bodyBuf = null;
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    if (req.body !== undefined && req.body !== null) {
      if (Buffer.isBuffer(req.body)) {
        bodyBuf = req.body;
      } else if (typeof req.body === "string") {
        bodyBuf = Buffer.from(req.body, "utf8");
      } else {
        bodyBuf = Buffer.from(JSON.stringify(req.body), "utf8");
        if (!headers["content-type"]) headers["content-type"] = "application/json; charset=utf-8";
      }
    } else if (!req.readableEnded) {
      try {
        bodyBuf = await readRawRequestBody(req);
      } catch {
        bodyBuf = null;
      }
    }
    if (bodyBuf && bodyBuf.length > 0) {
      headers["content-length"] = String(bodyBuf.length);
    }
  }

  await new Promise((resolve) => {
    const proxyReq = http.request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: targetPath,
        method,
        headers,
        timeout: 35000,
      },
      (proxyRes) => {
        const chunks = [];
        proxyRes.on("data", (c) => chunks.push(c));
        proxyRes.on("end", () => {
          const buf = Buffer.concat(chunks);
          res.statusCode = proxyRes.statusCode || 200;
          const ct = proxyRes.headers["content-type"] || "application/json; charset=utf-8";
          res.setHeader("Content-Type", ct);
          if (targetPath.startsWith("/api/media/") && res.statusCode === 200) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else {
            res.setHeader("Cache-Control", "no-store");
          }
          if (proxyRes.headers["content-disposition"]) {
            res.setHeader("Content-Disposition", proxyRes.headers["content-disposition"]);
          }
          res.end(buf);
          resolve();
        });
      },
    );

    proxyReq.on("error", (err) => {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, error: `Помилка з'єднання з сервером: ${err.message}` }));
      resolve();
    });

    proxyReq.on("timeout", () => {
      proxyReq.destroy();
      res.statusCode = 504;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, error: "Таймаут сервера 78.154.103.37:14370" }));
      resolve();
    });

    if (bodyBuf && bodyBuf.length > 0) {
      proxyReq.write(bodyBuf);
    }
    proxyReq.end();
  });
};

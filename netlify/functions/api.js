const http = require("http");

const BACKEND_HOST = "78.154.103.37";
const BACKEND_PORT = 14370;

exports.handler = async (event) => {
  const splat = (event.path || "")
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/^\/api/, "");
  const qs = event.rawQuery ? `?${event.rawQuery}` : "";
  const targetPath = `/api${splat || "/health"}${qs}`;

  const headers = {};
  for (const [k, v] of Object.entries(event.headers || {})) {
    const lk = k.toLowerCase();
    if (["content-type", "x-telegram-init-data", "x-telegram-user-id"].includes(lk)) {
      headers[lk] = v;
    }
  }

  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: targetPath,
        method: event.httpMethod || "GET",
        headers,
        timeout: 20000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          const contentType = res.headers["content-type"] || "application/json; charset=utf-8";
          const isBinary = contentType.includes("application/zip") || contentType.includes("octet-stream");
          const outHeaders = {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
          };
          if (res.headers["content-disposition"]) {
            outHeaders["Content-Disposition"] = res.headers["content-disposition"];
          }
          resolve({
            statusCode: res.statusCode || 200,
            headers: outHeaders,
            body: isBinary ? buf.toString("base64") : buf.toString("utf8"),
            isBase64Encoded: isBinary,
          });
        });
      },
    );

    req.on("error", (err) => {
      resolve({
        statusCode: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ok: false, error: `Помилка проксі до сервера: ${err.message}` }),
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        statusCode: 504,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ok: false, error: "Таймаут з'єднання з сервером 78.154.103.37:14370" }),
      });
    });

    if (event.body) {
      const bodyBuf = event.isBase64Encoded ? Buffer.from(event.body, "base64") : Buffer.from(event.body, "utf8");
      req.write(bodyBuf);
    }
    req.end();
  });
};

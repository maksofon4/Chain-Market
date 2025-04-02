const { createProxyMiddleware } = require("http-proxy-middleware");
const serverRoute = "http://localhost:3001";
module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: `${serverRoute}/api`,
      changeOrigin: true,
    })
  );
  app.use(
    "/uploads",
    createProxyMiddleware({
      target: `${serverRoute}/uploads`,
      changeOrigin: true,
    })
  );
  app.use(
    "/socket.io",
    createProxyMiddleware({
      target: `${serverRoute}/socket.io`,
      ws: true,
      secure: false,
      changeOrigin: true,
    })
  );
};

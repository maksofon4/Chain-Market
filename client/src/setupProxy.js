const { createProxyMiddleware } = require("http-proxy-middleware");
const API_URL = process.env.REACT_APP_API_URL;
module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: `${API_URL}/api`,
      changeOrigin: true,
    })
  );
  app.use(
    "/uploads",
    createProxyMiddleware({
      target: `${API_URL}/uploads`,
      changeOrigin: true,
    })
  );
  app.use(
    "/socket.io",
    createProxyMiddleware({
      target: `${API_URL}/socket.io`,
      ws: true,
      secure: false,
      changeOrigin: true,
    })
  );
};

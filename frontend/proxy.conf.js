// Proxy do dev server.
const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

module.exports = {
    "/api": {
        target: BACKEND,
        changeOrigin: true,
    },
    // Painel admin do Django: /admin e /static no frontend → backend.
    "/admin": {
    target: BACKEND,
    changeOrigin: true,
    },
    "/static": {
        target: BACKEND,
        changeOrigin: true,
    },
};

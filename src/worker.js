export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      const result = await env.DB
        .prepare("SELECT COUNT(*) AS total FROM usuarios")
        .first();

      return Response.json({
        ok: true,
        database: "alera-db",
        usuarios: result?.total ?? 0
      });
    }

    return env.ASSETS.fetch(request);
  }
};

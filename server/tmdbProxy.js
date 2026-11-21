import { createServer } from "node:http";

const token = process.env.TMDB_ACCESS_TOKEN;
const port = Number(process.env.TMDB_PROXY_PORT || 3002);

if (!token) {
  console.error("TMDB_ACCESS_TOKEN is missing. Add your API Read Access Token to .env.local.");
  process.exit(1);
}

const allowedRoute = /^\/(?:movie\/(?:popular|now_playing|top_rated|\d+(?:\/(?:similar|videos))?)|trending\/movie\/(?:day|week)|search\/movie|genre\/movie\/list|discover\/movie)$/;
const allowedParams = new Set(["language", "include_adult", "page", "query", "with_genres", "sort_by", "vote_count.gte"]);

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
  if (request.method !== "GET") {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Only read-only GET requests are supported." }));
    return;
  }

  if (!allowedRoute.test(requestUrl.pathname)) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "TMDB route not found." }));
    return;
  }

  const upstreamUrl = new URL(`https://api.themoviedb.org/3${requestUrl.pathname}`);
  for (const [key, value] of requestUrl.searchParams) {
    if (allowedParams.has(key)) upstreamUrl.searchParams.set(key, value);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    });
    response.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
    });
    response.end(await upstream.text());
  } catch (error) {
    console.error(`TMDB request failed: ${error.name || "NetworkError"}`);
    response.writeHead(502, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "TMDB could not be reached. Check your connection and try again." }));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`TMDB read proxy listening on http://127.0.0.1:${port}`);
});

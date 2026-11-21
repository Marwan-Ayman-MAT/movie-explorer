export default async function handler(req, res) {
  const targetPath = req.url.replace(/^\/api\/tmdb\/?/, "");
  const url = `https://api.themoviedb.org/3/${targetPath}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch data from TMDB" });
  }
}

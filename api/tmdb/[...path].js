export default async function handler(req, res) {
  const { path = [], ...queryParams } = req.query;
  const endpoint = Array.isArray(path) ? path.join("/") : path;
  const queryString = new URLSearchParams(queryParams).toString();
  const url = `https://api.themoviedb.org/3/${endpoint}${queryString ? `?${queryString}` : ""}`;

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

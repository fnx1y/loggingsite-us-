export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { currentUser, entry } = req.body || {};

    if (!currentUser || !entry) {
      return res.status(400).json({ error: "Missing user or entry data." });
    }

    if ((currentUser.roleRank ?? 0) < 18) {
      return res.status(403).json({ error: "Unauthorized." });
    }

    const requiredFields = ["username", "rank", "reason", "cooldown", "loggedBy"];
    for (const field of requiredFields) {
      if (!entry[field] || typeof entry[field] !== "string" || !entry[field].trim()) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }

    return res.status(200).json({
      ok: true
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
}

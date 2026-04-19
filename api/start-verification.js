function makeCode() {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `VERIFY-${part}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { username } = req.body || {};

    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ error: "A Roblox username is required." });
    }

    const cleanUsername = username.trim();

    const userResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usernames: [cleanUsername],
        excludeBannedUsers: true
      })
    });

    if (!userResponse.ok) {
      return res.status(502).json({ error: "Unable to resolve Roblox account." });
    }

    const userData = await userResponse.json();

    if (!userData.data || !userData.data.length) {
      return res.status(404).json({ error: "Roblox user not found." });
    }

    const user = userData.data[0];

    return res.status(200).json({
      username: user.name,
      userId: user.id,
      code: makeCode()
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
}

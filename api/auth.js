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
    const userId = user.id;

    const groupsResponse = await fetch(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);

    if (!groupsResponse.ok) {
      return res.status(502).json({ error: "Unable to load Roblox group roles." });
    }

    const groupsData = await groupsResponse.json();

    const membership = (groupsData.data || []).find(
      entry => entry.group && entry.group.id === 831503444
    );

    if (!membership) {
      return res.status(403).json({ error: "Access denied. User is not in the required Roblox group." });
    }

    const roleRank = membership.role?.rank ?? 0;
    const roleName = membership.role?.name ?? "Unknown Role";

    if (roleRank < 18) {
      return res.status(403).json({ error: "Access denied. Required group rank is 18 or higher." });
    }

    return res.status(200).json({
      username: user.name,
      userId,
      roleName,
      roleRank
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
}

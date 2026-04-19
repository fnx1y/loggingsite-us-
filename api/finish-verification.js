export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { username, userId, code } = req.body || {};

    if (!username || !userId || !code) {
      return res.status(400).json({ error: "Missing verification data." });
    }

    const profileResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);

    if (!profileResponse.ok) {
      return res.status(502).json({ error: "Unable to load Roblox profile." });
    }

    const profileData = await profileResponse.json();
    const description = profileData.description || "";

    if (!description.includes(code)) {
      return res.status(403).json({ error: "Verification code was not found in the Roblox bio." });
    }

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
      username,
      userId,
      roleName,
      roleRank
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
}

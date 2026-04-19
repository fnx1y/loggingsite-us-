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
    const memberships = groupsData.data || [];

    const fullAccessMembership = memberships.find(
      entry => entry.group && entry.group.id === 242317433
    );

    const historyOnlyMembership = memberships.find(
      entry => entry.group && entry.group.id === 831503444
    );

    if (fullAccessMembership && (fullAccessMembership.role?.rank ?? 0) >= 248) {
      return res.status(200).json({
        username,
        userId,
        roleName: fullAccessMembership.role?.name ?? "Unknown Role",
        roleRank: fullAccessMembership.role?.rank ?? 0,
        accessLevel: "full"
      });
    }

    if (historyOnlyMembership && (historyOnlyMembership.role?.rank ?? 0) >= 18) {
      return res.status(200).json({
        username,
        userId,
        roleName: historyOnlyMembership.role?.name ?? "Unknown Role",
        roleRank: historyOnlyMembership.role?.rank ?? 0,
        accessLevel: "history"
      });
    }

    return res.status(403).json({
      error: "Access denied. You do not meet the required rank in either authorized group."
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error." });
  }
}

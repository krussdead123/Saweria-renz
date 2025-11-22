export default async function handler(req, res) {
  const username = req.query.username || "TestUser";
  const amount = Number(req.query.amount || 1000);
  const message = req.query.message || "Test donasi!";

  const payload = {
    username,
    amount,
    message,
  };

  console.log("TEST → Sending to Roblox:", payload);

  try {
    const send = await fetch(
      `https://apis.roblox.com/messaging-service/v1/universes/${process.env.ROBLOX_UNIVERSE_ID}/topics/saweriaDonation`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.ROBLOX_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: JSON.stringify(payload),
        }),
      }
    );

    const text = await send.text();
    return res.status(200).json({
      success: true,
      status: send.status,
      roblox: text,
      sent: payload,
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

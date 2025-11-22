export default async function handler(req, res) {
  // Ambil query string
  const donator_name = req.query.username || "TestUser";
  const amount_raw = Number(req.query.amount || 1000);
  const message = req.query.message || "Test donasi!";

  // Buat payload mirip Saweria
  const payload = {
    version: "2022.01",
    created_at: new Date().toISOString(),
    id: crypto.randomUUID(),
    type: "donation",
    amount_raw: amount_raw,
    cut: 0,
    donator_name,
    donator_email: "test@example.com",
    donator_is_user: false,
    message,
    etc: {
      amount_to_display: amount_raw,
      transaction_fee_policy: "TIPPER",
    },
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

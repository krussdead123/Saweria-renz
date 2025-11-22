export default async function handler(req, res) {
  const payload = {
    version: "2022.01",
    created_at: new Date().toISOString(),
    id: "test-donation-123",
    type: "donation",
    amount_raw: Number(req.query.amount_raw || 1000),          // jumlah kotor
    cut: -58,                                                  // potongan
    donator_name: req.query.username || "TestUser",           // username
    donator_email: req.query.email || "test@example.com",
    donator_is_user: false,
    message: req.query.message || "Test donasi!",
    etc: {
      amount_to_display: Number(req.query.amount || 1000),    // jumlah yang tampil
      qr_string: "TESTQRSTRING",
      transaction_fee_policy: "TIPPER"
    }
  };

  console.log("TEST → Sending Saweria-like payload to Roblox:", payload);

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
          // Roblox script kamu hanya butuh username, amount, message
          message: JSON.stringify({
            username: payload.donator_name,
            amount: payload.etc.amount_to_display,
            message: payload.message
          })
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

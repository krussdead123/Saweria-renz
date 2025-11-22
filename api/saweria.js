export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Saweria webhook aktif" });
  }

  const body = req.body;

  // Ambil data langsung dari payload Saweria
  const username = body?.donator_name || "Unknown";
  const amount = Number(body?.amount_to_display || body?.amount_raw || 0);
  const message = body?.message || "";

  if (!username || amount <= 0) {
    console.log("Invalid Saweria Payload:", body);
    return res.status(200).json({ success: false });
  }

  console.log("Saweria incoming:", username, amount, message);

  const payload = {
    username,
    amount,
    message,
  };

  try {
    const send = await fetch(
      `https://apis.roblox.com/messaging-service/v1/universes/${process.env.ROBLOX_UNIVERSE_ID}/topics/saweriaDonation`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.ROBLOX_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: JSON.stringify(payload) }),
      }
    );

    const responseText = await send.text();
    console.log("Roblox MessagingService Response:", send.status, responseText);
  } catch (err) {
    console.error("Failed to send to Roblox MessagingService:", err);
    return res.status(500).json({ success: false, error: err.message });
  }

  return res.status(200).json({ success: true });
}

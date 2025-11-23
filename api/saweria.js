export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Saweria webhook aktif" });
  }

  console.log("====================================");
  console.log("📥 Incoming Saweria Webhook");
  console.log("Raw Body:", JSON.stringify(req.body, null, 2));
  console.log("====================================");

  const body = req.body;

  // Ambil data dari Saweria
  const username = body?.donator_name || "";
  const amount = Number(body?.amount_to_display || body?.amount_raw || 0);
  const message = body?.message || "";

  console.log("Parsed Saweria Data:", { username, amount, message });

  if (!username || amount <= 0) {
    console.log("❌ Invalid Saweria Payload:", body);
    return res.status(200).json({ success: false });
  }

  // ===============================
  // 1. LOOKUP USER ID ROBLOX
  // ===============================
  let userId = null;

  try {
    console.log("🔍 Mencari Roblox UserId untuk:", username);

    const lookupResponse = await fetch(
      "https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false,
        }),
      }
    );

    const lookupText = await lookupResponse.text();
    console.log("📩 Lookup Raw Response:", lookupText);

    const lookupData = JSON.parse(lookupText);

    if (lookupData?.data?.length > 0) {
      userId = lookupData.data[0].id;
      console.log("✅ UserId ditemukan:", userId);
    } else {
      console.log("⚠ Tidak menemukan UserId Roblox untuk username:", username);
    }
  } catch (err) {
    console.error("❌ ERROR Lookup Roblox UserId:", err);
  }

  // Payload final yang dikirim ke Roblox
  const payload = {
    username,
    userId: userId || null,
    amount,
    message,
    timestamp: Date.now(),
  };

  console.log("📦 Final Payload to Roblox:", JSON.stringify(payload, null, 2));

  // ===============================
  // 2. KIRIM KE ROBLOX MESSAGING SERVICE
  // ===============================
  try {
    console.log("🚀 Mengirim ke Roblox MessagingService...");

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

    const robloxResponseText = await send.text();

    console.log("📨 Roblox MessagingService Status:", send.status);
    console.log("📨 Roblox MessagingService Response:", robloxResponseText);

    console.log("====================================");
    console.log("Webhook Processed Successfully");
    console.log("====================================");
  } catch (err) {
    console.error("❌ ERROR send to Roblox MessagingService:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }

  return res.status(200).json({ success: true });
}

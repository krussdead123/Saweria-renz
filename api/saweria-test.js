export default async function handler(req, res) {
  const username = req.query.username || "TestUser";
  const amount = Number(req.query.amount || 0);
  const message = req.query.message || "Test donasi";

  // Fake payload Saweria mirip real
  const saweriaPayload = {
    donator_name: username,
    amount_raw: amount,
    message,
    etc: {
      amount_to_display: amount
    }
  };

  console.log("\n==============================");
  console.log("📥 Incoming Saweria-like payload:");
  console.log(saweriaPayload);
  console.log("==============================\n");

  // ===============================
  // 1. LOOKUP USERID ROBLOX
  // ===============================
  let userId = null;

  console.log("🔍 Mencari Roblox UserId untuk:", username);

  try {
    const lookupRes = await fetch(
      "https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      }
    );

    const lookupJson = await lookupRes.json();

    console.log("\n📥 Lookup Response Raw:");
    console.log(lookupJson);

    if (lookupJson?.data?.length > 0) {
      userId = lookupJson.data[0].id;
    }

  } catch (err) {
    console.log("❌ Lookup Error:", err);
  }

  console.log("\n🎯 UserId ditemukan:", userId, "\n");

  // ===============================
  // 2. KIRIM PAYLOAD FINAL KE ROBLOX
  // ===============================

  const finalPayload = {
    username,
    userId: userId || null,
    amount,
    message,
  };

  console.log("\n📦 Final Payload to Roblox:");
  console.log(finalPayload);
  console.log("\n==============================\n");

  try {
    const robloxReq = await fetch(
      `https://apis.roblox.com/messaging-service/v1/universes/${process.env.ROBLOX_UNIVERSE_ID}/topics/saweriaDonation`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.ROBLOX_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: JSON.stringify(finalPayload)
        })
      }
    );

    const robloxText = await robloxReq.text();

    console.log("\n🟦 Roblox MessagingService Response:");
    console.log("Status:", robloxReq.status);
    console.log("Body:", robloxText);

    return res.status(200).json({
      success: true,
      status: robloxReq.status,
      robloxResponse: robloxText,
      payloadSent: finalPayload
    });

  } catch (err) {
    console.log("❌ MessagingService Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

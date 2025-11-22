export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Saweria webhook aktif" });
  }

  const body = req.body;

  const userId = Number(body?.data?.user_id);     // langsung user id roblox
  const amount = Number(body?.data?.amount || 0); 
  const message = body?.data?.message || "";      

  console.log("Sending to Roblox:", userId, amount, message);

  // Kirim ke Roblox MessagingService
  await fetch(
    `https://apis.roblox.com/messaging-service/v1/universes/${process.env.ROBLOX_UNIVERSE_ID}/topics/saweriaDonation`,
    {
      method: "POST",
      headers: {
        "x-api-key": process.env.ROBLOX_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: JSON.stringify({
          userId,
          amount,
          message,
        }),
      }),
    }
  );

  return res.status(200).json({ success: true });
}

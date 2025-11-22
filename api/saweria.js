export default async function handler(req, res) {
  // Untuk test: jika GET → tampilkan pesan
  if (req.method === "GET") {
    return res.status(200).json({ message: "Saweria webhook endpoint aktif" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Body tidak otomatis terparse di Vercel Node.js API
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    const data = JSON.parse(body || "{}");

    console.log("Webhook Saweria masuk:", data);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error parsing webhook:", err);
    return res.status(400).json({ error: "Bad Request" });
  }
}

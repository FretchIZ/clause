export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" })
    }

    let body = req.body
    if (typeof body === "string") {
      body = JSON.parse(body)
    }

    const { messages, model = "mistral-large-latest" } = body || {}

    if (!messages) {
      return res.status(400).json({ error: "messages is required" })
    }

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({ model, messages }),
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "No response"
    res.status(200).json({ reply, model })
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack })
  }
}

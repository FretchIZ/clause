export default function handler(req, res) {
  let body = ""
  req.on("data", (chunk) => { body += chunk })
  req.on("end", async () => {
    try {
      const { messages, model = "mistral-large-latest" } = JSON.parse(body)

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
      res.status(500).json({ error: err.message })
    }
  })
}

export default function handler(req, res) {
  let body = ""
  req.on("data", (chunk) => { body += chunk })
  req.on("end", () => {
    try {
      const parsed = JSON.parse(body)
      res.status(200).json({ success: true, body: parsed })
    } catch (err) {
      res.status(200).json({ error: err.message, raw: body, rawLen: body.length, rawBytes: [...Buffer.from(body)].slice(0, 20) })
    }
  })
}

const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

const allowedOrigins = [
  "http://localhost:3000", // local dev
  "https://summary-generator-5avd.vercel.app" // your Vercel frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.post("/summarize", (req, res) => {
  const inputText = req.body.text;

  const python = spawn("python", [path.join(__dirname, "inference.py")]);

  let output = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on("close", (code) => {
    if (code === 0) {
      res.json({ summary: output.trim() });
    } else {
      res.status(500).json({ error: "Python process failed" });
    }
  });

  python.stdin.write(JSON.stringify({ text: inputText }));
  python.stdin.end();
});

// ✅ Use dynamic port for Render (or default to 5000 locally)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

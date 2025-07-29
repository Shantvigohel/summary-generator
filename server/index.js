const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

// ✅ Add all needed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://summary-generator-5avd.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request from origin:", origin); // ✅ Debug log
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("CORS Blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Allow preflight OPTIONS requests for /summarize
app.options("/summarize", cors());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

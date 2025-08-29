import express from "express";
import cors from "cors";
import { getAuthUrl, saveToken, authorize } from "./auth.js";
import { fetchEmails } from "./gmail.js";
import { summarizeText } from "./summarize.js";      // ✅ Make sure this file exists
import { classifyUrgency } from "./classify.js";     // ✅ Make sure this file exists

const app = express();
app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => res.send("✅ Backend running"));

// Start OAuth flow
app.get("/auth", (req, res) => {
  try {
    const url = getAuthUrl();
    res.redirect(url);
  } catch (err) {
    console.error("Error generating auth URL:", err);
    res.status(500).send("Failed to generate auth URL");
  }
});

// OAuth callback
app.get("/auth/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    await saveToken(code);
    res.send("✅ Authorization successful! You can now fetch emails at /emails");
  } catch (err) {
    console.error("Error saving token:", err);
    res.status(500).send("Failed to save token");
  }
});

// Fetch emails
app.get("/emails", async (req, res) => {
  try {
    const auth = authorize();
    if (!auth) return res.status(401).json({ error: "Not authorized. Visit /auth first." });

    const emails = await fetchEmails(auth, 5); // fetch with OAuth client
    const processedEmails = await Promise.all(
      emails.map(async (email) => {
        const text = email.body || email.snippet;
        const summary = await summarizeText(text);
        const urgency = await classifyUrgency(text);
        return { ...email, summary, urgency };
      })
    );

    res.json(processedEmails);
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));


import { google } from "googleapis";
import { convert } from "html-to-text"; // npm install html-to-text

// Utility to decode Gmail base64url format
function decodeBase64(data) {
  return Buffer.from(data, "base64url").toString("utf-8");
}

// Recursive function to extract plain text from Gmail parts
function extractTextFromParts(parts) {
  let result = "";
  for (const part of parts) {
    if (part.parts) {
      result += extractTextFromParts(part.parts);
    } else if (part.mimeType === "text/plain" && part.body?.data) {
      result += decodeBase64(part.body.data) + "\n";
    } else if (part.mimeType === "text/html" && part.body?.data) {
      const html = decodeBase64(part.body.data);
      result += convert(html, { wordwrap: 130 }) + "\n";
    }
  }
  return result;
}

// Fetch emails using authorized OAuth2 client
export async function fetchEmails(auth, maxResults = 5) {
  if (!auth) throw new Error("❌ Not authorized. Please visit /auth first.");

  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults,
  });

  const messages = res.data.messages || [];
  const emailData = [];

  for (const msg of messages) {
    const fullMsg = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

    const payload = fullMsg.data.payload;
    let body = "";

    if (payload.parts && payload.parts.length) {
      body = extractTextFromParts(payload.parts);
    } else if (payload.body?.data) {
      const rawData = decodeBase64(payload.body.data);
      body = payload.mimeType === "text/html"
        ? convert(rawData, { wordwrap: 130 })
        : rawData;
    }

    // Clean up excessive whitespace and line breaks
    body = body.replace(/\r\n|\n|\r/g, " ").replace(/\s+/g, " ").trim();

    emailData.push({
      id: msg.id,
      snippet: convert(fullMsg.data.snippet || "", { wordwrap: 130 }), // also convert snippet to plain text
      body,
    });
  }

  return emailData;
}

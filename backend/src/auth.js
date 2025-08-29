import { google } from "googleapis";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH = "token.json";

// Create OAuth2 client from credentials.json
function createOAuthClient() {
  const credentials = JSON.parse(fs.readFileSync("credentials.json"));
  const { client_id, client_secret, redirect_uris } = credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

// Returns OAuth2 client if token.json exists
export function authorize() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    if (!token.refresh_token) {
      console.warn("❌ No refresh token found. Re-authorize via /auth.");
      return null;
    }
    const oAuth2Client = createOAuthClient();
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }
  return null;
}

// Generate Google OAuth URL
export function getAuthUrl() {
  const oAuth2Client = createOAuthClient();
  return oAuth2Client.generateAuthUrl({
    access_type: "offline", // ensures refresh token
    scope: SCOPES,
    prompt: "consent",
  });
}

// Exchange auth code for token and save to token.json
export async function saveToken(code) {
  const oAuth2Client = createOAuthClient();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Save tokens (access + refresh)
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log("✅ Token stored to token.json");
  return oAuth2Client;
}

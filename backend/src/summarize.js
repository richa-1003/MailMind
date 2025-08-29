
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HF_API = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

export async function summarizeText(text) {
  try {
    const response = await axios.post(
      HF_API,
      { inputs: text },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      }
    );
    return response.data[0].summary_text;
  } catch (err) {
    console.error("Summarization failed:", err.message);
    return text; // fallback
  }
}

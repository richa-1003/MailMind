import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HF_API = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

export async function classifyUrgency(text) {
  try {
    const response = await axios.post(
      HF_API,
      {
        inputs: text,
        parameters: { candidate_labels: ["High", "Medium", "Low"] },
      },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      }
    );

    return response.data.labels[0]; // top urgency
  } catch (err) {
    console.error("Classification failed:", err.message);
    return "Unknown";
  }
}

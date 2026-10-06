const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  const models = await genAI.getModels(); // Actually wait, there is no getModels() in the v0.24.1 SDK maybe?
  // We can fetch manually from REST API
}
listModels();

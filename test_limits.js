const { GoogleGenAI } = require("@google/genai");
require("dotenv").config({ path: ".env" });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel(modelName) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "say hi"
    });
    console.log(`✅ ${modelName} WORKED`);
    return true;
  } catch (err) {
    console.log(`❌ ${modelName} FAILED: ${err.message.substring(0, 100)}`);
    return false;
  }
}

async function run() {
  await testModel("gemini-2.5-flash");
  await testModel("gemini-3.5-flash");
  await testModel("gemini-3.5-flash-lite");
  await testModel("gemini-flash-latest");
}
run();

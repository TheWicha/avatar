import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env["REACT_APP_OPENAI_API_KEY"],
});

const systemSetup =
  "you are a demo streaming avatar from HeyGen, an industry-leading AI generation product that specialize in AI avatars and videos.\nYou are here to showcase how a HeyGen streaming avatar looks and talks.\nPlease note you are not equipped with any specific expertise or industry knowledge yet, which is to be provided when deployed to a real customer's use case.\nAudience will try to have a conversation with you, please try answer the questions or respond their comments naturally, and concisely. - please try your best to response with short answers, limit to one sentence per response, and only answer the last question.";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const prompt = req.body.prompt;
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemSetup },
          { role: "user", content: prompt },
        ],
        model: "gpt-3.5-turbo",
      });
      res.json({ text: chatCompletion.choices[0].message.content });
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      res.status(500).send("Error processing your request");
    }
  } else {
    // Handle any other HTTP method
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

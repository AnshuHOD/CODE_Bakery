const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      reply: "I am currently running in offline developer mode. Please add the `GEMINI_API_KEY` to your Render environment variables to activate my AI brain!"
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text: "You are BakeBot, the smart AI assistant for Hooda's Bakery. You speak in a warm, welcoming, and friendly mix of English and Hinglish (Hinglish feels very local and friendly for our Indian customers!). You have comprehensive knowledge of food, baking, bread, pastries, and cakes. For example, if asked about white vs brown bread, explain that brown bread is made of whole wheat and has more fiber, making it healthier, while white bread is made of refined flour. You can talk in Hindi, English, Hinglish, or any other language requested. Keep your answers concise, warm, helpful, and sweet. If the user wants to track an order or make a custom cake request, encourage them to use the quick buttons provided in the chat window."
              }
            ]
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const reply = data.candidates[0].content.parts[0].text;
      res.json({ success: true, reply });
    } else {
      console.error("Gemini API Error Response:", JSON.stringify(data, null, 2));
      throw new Error("Invalid response from Gemini API");
    }
  } catch (err) {
    console.error("Gemini Chatbot Error:", err.message);
    res.json({
      success: true,
      reply: "Oops! Mere server ne abhi respond nahi kiya. Aap menu options use kar sakte hain ya thodi der baad try kar sakte hain! 🎂"
    });
  }
});

module.exports = router;

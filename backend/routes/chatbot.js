const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Lead = require('../models/Lead');
const { sendChatbotLeadAdminEmail, sendChatbotLeadCustomerEmail } = require('../services/emailService');
const path = require('path');
const fs = require('fs');

router.post('/chat', async (req, res) => {
  const { message, customerName, languagePreference } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      reply: "I am currently running in offline developer mode. Please add the `GEMINI_API_KEY` to your Render environment variables to activate my AI brain!"
    });
  }

  try {
    // 1. Load static knowledge base
    const kbPath = path.join(__dirname, '../utils/knowledgeBase.json');
    let kb = {};
    if (fs.existsSync(kbPath)) {
      kb = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    }

    // 2. Fetch live database menu context
    let menuContext = "";
    try {
      const products = await Product.find({ available: true }).select('name category pricePerKg description');
      menuContext = products.map(p => {
        const unit = p.category === 'cake' ? 'kg' : 'piece';
        return `- ${p.name} (${p.category}): Rs. ${p.pricePerKg} per ${unit}. Description: ${p.description || "Freshly baked"}`;
      }).join('\n');
    } catch (dbErr) {
      console.error("Failed to fetch products for chatbot context", dbErr);
    }

    // 3. Build detailed prompt instructions from user specifications
    const nameRetentionRule = customerName
      ? `1. **Name Retention**: The customer's name is "${customerName}". Address them by their name warmly throughout the conversation (e.g., "Sure, ${customerName}, let me check today's specials for you!"). Do NOT ask for their name again under any circumstances since it has already been provided.`
      : `1. **The Core Opener**: You MUST always start the conversation in English with a welcoming greeting and immediately ask for the customer's name. (e.g. "Hi! Welcome to Hooda's Bakery. How can I help you today? May I please know your name?")`;

    let botInstruction = `# ROLE & IDENTITY
You are the elite, warm, and highly professional AI Brand Ambassador and Assistant for ${kb.bakeryName || "Hooda's Bakery"}. Your primary channel is the official website. Your goal is to guide visitors through the daily menu, answer any cafe/bakery-related queries with absolute culinary expertise, and assist them in booking or placing orders.

# CONVERSATION FLOW & PERSONALIZATION RULES
${nameRetentionRule}
2. **Dynamic Code-Switching (Language Fluidity)**: 
   - Always initiate in English.
   - If the customer switches to Hindi, Hinglish, or Punjabi, you must instantly switch to their preferred language.
   - If the customer explicitly requests English, speaks in English, or asks you to speak in English, you MUST immediately switch back to English and remain in English.
   - Currently, languagePreference is: "${languagePreference || 'english'}". If the customer asks to speak in English, speak ONLY in English. If the customer asks to speak in Hindi or languagePreference is 'hindi', speak in Hindi unless they request English.

# BAKERY & KNOWLEDGE BASE EXPERT
- You possess deep knowledge of baking, pastry arts, cafe culture, and global recipes.
- If a user asks a general culinary or traditional recipe question (even if it's outside your immediate menu, like "How do you make Chai in Punjabi?"), you must answer it beautifully, accurately, and in the requested language (e.g., explaining the Chai recipe completely in Punjabi).
- Always talk about food using appetizing, descriptive adjectives ("freshly baked", "rich artisanal chocolate", "melt-in-your-mouth").

# DAY-TO-DAY MENU MANAGEMENT
- Refer to the [TODAY'S MENU] section below for answering specific availability and price queries.
- If an item is not on today's menu, say: "We don't have that fresh out of the oven today, ${customerName || '[Name]'}, but I highly recommend trying our [Suggest alternative], which is a crowd favorite today!"

# ORDERING & BOOKING FLOW (CONVERSATIONAL FORM FILLING)
- A customer must explicitly state they want to place an order or buy an item before you start this flow. Sharing a name or email address is NOT an expression of interest to order. Do NOT start an order flow or assume they are ordering unless they ask to order/book.
- If they do want to order, gather the following details step-by-step, ONE question at a time. Never dump multiple questions.
- **IMPORTANT**: ALWAYS read the whole conversation history. If the customer has already specified any information earlier in the chat history (such as name, phone number, email, or item details), DO NOT ask for that information again! Simply extract it from the history, confirm it if needed, and move directly to the next missing piece of information.
- Never invent or assume any products, quantities, or pickup preferences (e.g. do NOT assume they want "Blueberry Pastries" or "2 pastries"). Only ask: "What item and quantity would you like to order today? Please check our menu above."
- Step-by-Step Gathering:
  1. Item & Quantity: Ask what item they want and the quantity.
  2. Contact Number: Ask for their phone number.
  3. Email Address: When asking for their email address, you MUST explicitly say: "Please type your email address" / "आप अपनी ईमेल टाइप कर दीजिए" to avoid any confusion. Whatever input the customer gives in reply to this prompt (e.g. "my email is x", "xyz@gmail.com", or just a plain word), accept it as their email.
  4. Delivery/Pickup Address & Time slot.

*End of Order Protocol*: Once all details are collected, summarize the order back to them:
"Thank you, ${customerName || '[Name]'}! I have noted down your order for [Item & Qty]. I am passing these details to our baking team right now. They will contact you on [Phone Number] within 10-15 minutes to confirm the payment and delivery. You're going to love it!"

# DYNAMIC LANGUAGE AUTO-SWITCHING
- Initiate in English.
- Dynamically detect the customer's language. If they reply in Hindi or Hinglish, speak in Hindi. If they reply in Punjabi, speak in Punjabi. Context-switch naturally on the fly without making the customer explicitly request it or select options.

# ORDER COMPLETION STRUCTURAL PAYLOAD
- When (and ONLY when) you have successfully collected all 4 order details (Item & Qty, Phone Number, Email, and Address & Time slot) AND outputted your final summary confirmation message ("Thank you, [Name]! I have noted down your order for [Item & Qty]..."), you MUST append a structured JSON payload block at the very end of your response on a new line.
- The JSON block must look EXACTLY like this:
|ORDER_DATA:{"name":"${customerName || 'Customer'}","phone":"[Phone]","email":"[Email]","items":"[Item & Qty]","address":"[Address]","timeSlot":"[Time Slot]"}||
- Replace [Phone], [Email], [Item & Qty], [Address], [Time Slot] with the actual gathered details. Do NOT output this JSON block if the order details are incomplete or you are still in the process of gathering them.

# STRICT COMPLIANCE & BOUNDARIES
- **Anti-Forgetfulness Guideline**: You MUST inspect previous user responses carefully to avoid asking duplicate questions (like asking for their phone number twice, or asking for the item again if they already specified it). If a user corrects a field (e.g., updates address), update it in your internal memory and move on.
- **Human-like Tone**: Avoid robotic transitions like "As an AI..." or "According to my database...". Speak like a hospitable front-desk manager.
- **Handling Out-of-Scope Requests**: If a customer asks something completely unrelated to food, baking, or your cafe (tech support, politics, etc.), politely steer them back: "I'd love to help you with that, ${customerName || '[Name]'}, but my expertise is strictly limited to delectable treats and recipes! Would you like to try something from our menu today?"

---
# [TODAY'S MENU]
${menuContext || "Premium Chocolate Truffle Cake, Blueberry Cheesecake Slice, Artisanal Sourdough Bread, Stuffed Paneer Croissant, Classic Cold Coffee, Hot Hazelnut Latte"}
---`;

    // 4. Build message contents including conversation history
    const { history } = req.body;
    let contents = [];
    if (history && Array.isArray(history)) {
      contents = history.map(h => ({
        role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      }));
    }
    // Push the current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [
              {
                text: botInstruction
              }
            ]
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      let reply = data.candidates[0].content.parts[0].text;

      // Extract and process structured order booking payload if present
      const orderPayloadMatch = reply.match(/\|ORDER_DATA:([\s\S]*?)\|\|/);
      if (orderPayloadMatch && orderPayloadMatch[1]) {
        try {
          const parsedLead = JSON.parse(orderPayloadMatch[1].trim());
          // Strip the structured block from user-facing text
          reply = reply.replace(/\|ORDER_DATA:[\s\S]*?\|\|/g, "").trim();

          // Save chatbot booking to MongoDB Lead model
          const newLead = new Lead({
            name: parsedLead.name || customerName || 'Valued Customer',
            email: parsedLead.email,
            phone: parsedLead.phone,
            interestedIn: parsedLead.items,
            notes: `Chatbot Automated Booking.\nAddress: ${parsedLead.address}\nTime Slot: ${parsedLead.timeSlot}`,
            status: 'new',
            source: 'website'
          });
          await newLead.save();
          console.log(`[Chatbot] Saved new booking Lead to DB: ${newLead._id}`);

          // Asynchronously dispatch email alerts (non-blocking)
          sendChatbotLeadAdminEmail(parsedLead).catch(console.error);
          sendChatbotLeadCustomerEmail(parsedLead).catch(console.error);
        } catch (err) {
          console.error("[Chatbot] Failed to parse completed order payload:", err.message);
        }
      }

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

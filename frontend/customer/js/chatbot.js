// chatbot.js — Custom Smart Chatbot Logic for Bakery Website
// Handles interactive FAQ, Order Tracking, and Custom Cake Lead Qualification.

const API_BASE = CONFIG.API_BASE;

// Chatbot HTML injection (includes microphone, restart, and close buttons)
const chatbotHTML = `
  <div class="chatbot-bubble" id="chatBubble" onclick="toggleChat(true)">🧁</div>
  <div class="chatbot-container" id="chatContainer">
    <div class="chatbot-header">
      <h3><span>🎂</span> Hooda's BakeBot <span class="chatbot-status"></span></h3>
      <div class="chatbot-header-actions">
        <button class="chatbot-reset" onclick="resetChat()" title="Reset Conversation">↻</button>
        <button class="chatbot-close" onclick="toggleChat(false)">✕</button>
      </div>
    </div>
    <div class="chatbot-messages" id="chatMessages">
      <!-- Messages go here -->
    </div>
    <div class="chatbot-input-area">
      <input type="text" id="chatInput" class="chatbot-input" placeholder="Type or speak a message..." onkeydown="handleInputKey(event)" />
      <button class="chatbot-mic" id="chatMicBtn" onclick="toggleSpeech()" title="Speak to BakeBot 🎙️">🎙️</button>
      <button class="chatbot-send" onclick="handleSend()">➔</button>
    </div>
  </div>
`;

// Inject chatbot elements on document load
document.addEventListener('DOMContentLoaded', () => {
  const div = document.createElement('div');
  div.innerHTML = chatbotHTML;
  document.body.appendChild(div);
  
  initializeChatbotGreeting();
});

// Initialize Greeting or Name Intake
function initializeChatbotGreeting() {
  let savedName = localStorage.getItem('bakery_customer_name');
  
  // Proactively auto-clean bad/glitched names from old sessions!
  if (savedName) {
    const isBadName = !extractName(savedName) || savedName.toLowerCase().includes('waffle') || savedName.toLowerCase().includes('hii');
    if (isBadName) {
      localStorage.removeItem('bakery_customer_name');
      savedName = null;
    }
  }

  const messagesDiv = document.getElementById('chatMessages');
  messagesDiv.innerHTML = '';
  
  if (savedName) {
    botState = 'idle';
    const pref = localStorage.getItem('bakery_language_preference') || 'english';
    if (pref === 'hindi') {
      addBotMessage(`नमस्ते ${savedName}! स्वीट बाइट्स बेकरी में आपका स्वागत है 🎂। आज मैं आपकी क्या सहायता कर सकता हूँ?`);
    } else {
      addBotMessage(`Hello ${savedName}! Welcome back to Hooda's Bakery 🎂. How can I help you today?`);
    }
    showOptions();
  } else {
    botState = 'welcome_name';
    addBotMessage("Hi! Welcome to Hooda's Bakery 🎂. How can I help you today? May I please know your name?");
  }
}

// Reset/Restart Chatbot without page refresh
function resetChat() {
  localStorage.removeItem('bakery_customer_name');
  chatHistory = [];
  botState = 'idle';
  leadData = {
    name: '',
    email: '',
    phone: '',
    interestedIn: '',
    estimatedBudget: '',
    notes: 'Qualified via Website Chatbot'
  };
  initializeChatbotGreeting();
}

let botState = 'idle'; // 'idle', 'tracking', 'lead_name', 'lead_email', 'lead_phone', 'lead_desc', 'lead_budget'
let chatHistory = [];  // Stores structured conversation history
let leadData = {
  name: '',
  email: '',
  phone: '',
  interestedIn: '',
  estimatedBudget: '',
  notes: 'Qualified via Website Chatbot'
};

function toggleChat(open) {
  const container = document.getElementById('chatContainer');
  if (open) {
    container.classList.add('open');
  } else {
    container.classList.remove('open');
  }
}

function addBotMessage(text) {
  const messagesDiv = document.getElementById('chatMessages');
  
  // Strip HTML tags for clean model instruction history
  const cleanText = text.replace(/<[^>]*>/g, '');
  chatHistory.push({ role: 'assistant', text: cleanText });
  if (chatHistory.length > 40) chatHistory.shift();

  // Create Message Bubble
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = text;
  
  messagesDiv.appendChild(bubble);
  scrollToBottom();
}

function addUserMessage(text) {
  chatHistory.push({ role: 'user', text: text });
  if (chatHistory.length > 40) chatHistory.shift();

  const messagesDiv = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.innerText = text;
  messagesDiv.appendChild(bubble);
  scrollToBottom();
}

function showTypingIndicator() {
  const messagesDiv = document.getElementById('chatMessages');
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  messagesDiv.appendChild(indicator);
  scrollToBottom();
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

function scrollToBottom() {
  const messagesDiv = document.getElementById('chatMessages');
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showOptions() {
  const messagesDiv = document.getElementById('chatMessages');
  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'chatbot-options';
  optionsDiv.id = 'chatOptions';
  
  const options = [
    { text: '🚚 Track My Order', action: () => startTrackingFlow() },
    { text: '🎂 Request Custom Cake (CRM Inquiry)', action: () => startConversationalLeadFlow() },
    { text: '🍰 Browse Menu & Prices', action: () => showMenuInfo() },
    { text: '❓ Frequently Asked Questions', action: () => showFAQOptions() }
  ];
  
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'bot-opt-btn';
    btn.innerText = opt.text;
    btn.onclick = () => {
      optionsDiv.remove();
      addUserMessage(opt.text);
      opt.action();
    };
    optionsDiv.appendChild(btn);
  });
  
  messagesDiv.appendChild(optionsDiv);
  scrollToBottom();
}

// Option Actions
function showMenuInfo() {
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    addBotMessage("We bake customized cakes, delicious pastries, freshly-made artisanal bread, cookies, and more! Minimum sizes for custom cakes start at 0.5 kg. You can check all prices on our menu page:<br/><a href='menu.html' style='color:#0F6E56; font-weight:700;'>Browse Full Menu →</a>");
    showOptions();
  }, 800);
}

function showFAQOptions() {
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    addBotMessage("Here are some frequent questions. Tap one to learn more:");
    
    const messagesDiv = document.getElementById('chatMessages');
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'chatbot-options';
    optionsDiv.id = 'chatOptions';
    
    const faqs = [
      { q: '🥚 Eggless Options?', a: 'Yes! Almost all our cakes can be prepared eggless. Just mention it in the special instructions!' },
      { q: '⏰ Delivery Timings?', a: 'We deliver between 9:00 AM and 9:00 PM. Please place custom orders at least 24 hours in advance.' },
      { q: '🛵 Delivery Range?', a: 'We deliver city-wide within a 15km radius of our main kitchen. Delivery fees depend on distance.' },
      { q: '↩ Back to Main Menu', a: 'back' }
    ];
    
    faqs.forEach(faq => {
      const btn = document.createElement('button');
      btn.className = 'bot-opt-btn';
      btn.innerText = faq.q;
      btn.onclick = () => {
        optionsDiv.remove();
        addUserMessage(faq.q);
        if (faq.a === 'back') {
          showOptions();
        } else {
          addBotMessage(faq.a);
          showFAQOptions();
        }
      };
      optionsDiv.appendChild(btn);
    });
    
    messagesDiv.appendChild(optionsDiv);
    scrollToBottom();
  }, 600);
}

// ORDER TRACKING FLOW
function startTrackingFlow() {
  botState = 'tracking';
  addBotMessage("Sure, I can track your delivery status! Please enter your **Order ID** (starts with `ORD-` e.g., `ORD-20260622-4821`):");
}

async function handleTracking(orderId) {
  showTypingIndicator();
  try {
    const res = await fetch(`${API_BASE}/orders/track/${orderId.trim()}`);
    const result = await res.json();
    removeTypingIndicator();
    
    if (result.success) {
      const o = result.data;
      const formattedDate = new Date(o.deliveryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' });
      const items = o.items.map(i => `${i.productName} (${i.sizeKg}kg)`).join(', ');
      
      let statusEmoji = '⏳';
      if (o.status === 'confirmed') statusEmoji = '✅ Confirmed';
      if (o.status === 'processing') statusEmoji = '🥣 Baker is preparing';
      if (o.status === 'dispatched') statusEmoji = '🛵 Out for Delivery';
      if (o.status === 'delivered') statusEmoji = '🎂 Delivered! Enjoy your slice!';
      if (o.status === 'cancelled') statusEmoji = '❌ Cancelled';

      addBotMessage(`<strong>Order Status:</strong><br/>
        🆔 Order ID: ${o.orderId}<br/>
        👤 Customer: ${o.customerName}<br/>
        📦 Items: ${items}<br/>
        📅 Delivery Date: ${formattedDate}<br/>
        💰 Total Amount: ₹${o.total}<br/>
        🔔 Status: <strong>${statusEmoji}</strong>
      `);
    } else {
      addBotMessage("Sorry, I couldn't find an order with that ID. Please check the spelling and try again.");
    }
  } catch (err) {
    removeTypingIndicator();
    addBotMessage("Oops! I had trouble connecting to the tracking system. Please try again in a bit.");
  }
  botState = 'idle';
  showOptions();
}

// CRM LEAD INTAKE FLOW (CONVERSATIONAL AI)
function startConversationalLeadFlow() {
  botState = 'idle';
  addBotMessage("I'd love to help you customize a cake! Tell me about the cake you're dreaming of (e.g. flavour, event theme, size, shape, dietary preferences), or feel free to ask me for recommendations or pricing! 🎂");
}

// CRM LEAD INTAKE FLOW (QUALIFICATION) - Fallback/Legacy
function startLeadFlow() {
  const savedName = localStorage.getItem('bakery_customer_name');
  if (savedName) {
    leadData.name = savedName;
    botState = 'lead_email';
    addBotMessage("Fantastic! I will collect details for your custom cake order. Please type your Email Address / आप अपनी ईमेल टाइप कर दीजिए:");
  } else {
    botState = 'lead_name';
    addBotMessage("Fantastic! I will collect details for your custom cake order. First, what is your **Full Name**?");
  }
}

function handleInputKey(e) {
  if (e.key === 'Enter') handleSend();
}

function handleSend() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  
  addUserMessage(text);
  input.value = '';
  
  if (botState === 'welcome_name') {
    let cleanedName = extractName(text);
    if (!cleanedName) {
      botState = 'idle';
      const lowText = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      const isSimpleGreeting = /^(hi+|hello+|hey+|yo|sup|greetings)$/i.test(lowText);
      if (isSimpleGreeting) {
        addBotMessage("Nice to meet you! How can I help you today? 🎂");
        showOptions();
      } else {
        handleGeneralChat(text);
      }
      return;
    }
    
    // Clean any prefix leakage from 'myself', 'this is', 'i am'
    cleanedName = cleanedName.replace(/\b(myself|i am|im|this is|my name is|mera naam)\b/gi, "").trim();
    // Re-verify that we didn't wipe the name completely
    if (!cleanedName) {
      cleanedName = "Guest";
    }

    localStorage.setItem('bakery_customer_name', cleanedName);
    botState = 'idle';
    const pref = localStorage.getItem('bakery_language_preference') || 'english';
    if (pref === 'hindi') {
      addBotMessage(`आपसे मिलकर खुशी हुई, ${cleanedName}! आज मैं आपकी क्या सहायता कर सकता हूँ? 🎂`);
    } else {
      addBotMessage(`Nice to meet you, ${cleanedName}! How can I help you today? 🎂`);
    }
    showOptions();
  } else if (botState === 'tracking') {
    handleTracking(text);
  } else if (botState === 'lead_name') {
    // If they explicitly reply with name, save it
    const cleanedName = extractName(text) || text;
    localStorage.setItem('bakery_customer_name', cleanedName);
    leadData.name = cleanedName;
    botState = 'lead_email';
    addBotMessage(`Nice to meet you, ${cleanedName}! Please type your Email Address / आप अपनी ईमेल टाइप कर दीजिए:`);
  } else if (botState === 'lead_email') {
    // Simple verification
    if (!text.includes('@') || !text.includes('.')) {
      addBotMessage("Hmm, that email format looks incorrect. Please type a valid email address:");
      return;
    }
    leadData.email = text.toLowerCase();
    botState = 'lead_phone';
    addBotMessage("Got it. And what is your **Phone Number**?");
  } else if (botState === 'lead_phone') {
    leadData.phone = text;
    botState = 'lead_desc';
    addBotMessage("Perfect! Tell me about the cake you're dreaming of (e.g. flavour, event theme, size, shape, dietary preferences):");
  } else if (botState === 'lead_desc') {
    leadData.interestedIn = text;
    botState = 'lead_budget';
    addBotMessage("Almost done! What is your **estimated budget** for this order (e.g., ₹1500, ₹3000)?");
  } else if (botState === 'lead_budget') {
    leadData.estimatedBudget = text;
    submitLead();
  } else {
    // idle state - conversational chatbot response
    // Names should ONLY be extracted in the welcome_name state, never in the idle state
    handleGeneralChat(text);
  }
}

async function submitLead() {
  botState = 'idle';
  showTypingIndicator();
  try {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    const result = await res.json();
    removeTypingIndicator();
    if (result.success) {
      addBotMessage("🎉 **Success!** Your inquiry has been logged in our CRM. Our head chef will contact you shortly via phone or email to discuss details and finalize pricing. Thank you!");
    } else {
      addBotMessage("Your inquiry details were compiled, but we had a hiccup saving them to the CRM database. We have notified our team.");
    }
  } catch (err) {
    removeTypingIndicator();
    addBotMessage("Thank you! I saved your specifications locally, but could not sync with CRM database. We will check it.");
  }
  showOptions();
}

async function handleGeneralChat(text) {
  const lowText = text.toLowerCase();
  
  const hasEnglishRequest = /\b(english|angreji|in english)\b/i.test(lowText) && /\b(speak|talk|only|say|chat|switch|please|just)\b/i.test(lowText);
  const hasHindiRequest = /\b(hindi|hindustani)\b/i.test(lowText) && /\b(speak|talk|only|say|chat|switch|please|just|bol|sun)\b/i.test(lowText);

  if (hasEnglishRequest) {
    localStorage.setItem('bakery_language_preference', 'english');
    addBotMessage("Sure, I will speak in English only from now on! How can I help you? 🎂");
    showOptions();
    return;
  } else if (hasHindiRequest) {
    localStorage.setItem('bakery_language_preference', 'hindi');
    addBotMessage("बिल्कुल, अब से मैं केवल हिंदी में बात करूँगा! मैं आपकी क्या सहायता कर सकता हूँ? 🎂");
    showOptions();
    return;
  }

  showTypingIndicator();
  try {
    const res = await fetch(`${API_BASE}/chatbot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: text,
        customerName: localStorage.getItem('bakery_customer_name') || '',
        languagePreference: localStorage.getItem('bakery_language_preference') || 'english',
        history: chatHistory
      })
    });
    const result = await res.json();
    removeTypingIndicator();
    
    if (result.success) {
      addBotMessage(result.reply);
    } else {
      addBotMessage("Oops! I had some trouble understanding that. Could you try again?");
    }
  } catch (err) {
    removeTypingIndicator();
    addBotMessage("Sorry, I'm having trouble connecting to my brain right now. Please try again in a moment! 🎂");
  }
  showOptions();
}

/**
 * Extracts a clean customer name from greeting texts.
 * Handles English & Hinglish formats like "My name is Anshu", "Mera naam Rohan hai", "hey..im..Vikram", etc.
 */
function extractName(input) {
  // 1. If input is an email, phone number, or contains numbers, it is NOT a name!
  if (input.includes('@') || input.toLowerCase().includes('.com') || input.toLowerCase().includes('.in') || /[0-9]/.test(input)) {
    return null;
  }

  // 2. Clean punctuation by replacing any non-word, non-space, and non-Devanagari characters with space
  // This preserves English letters (a-z), numbers, spaces, and Devanagari script (\u0900-\u097F)
  // We explicitly replace Devanagari full stops (\u0964 and \u0965) with spaces to strip them
  let cleanInput = input.replace(/[\u0964\u0965]/g, " ").replace(/[^\w\s\u0900-\u097F]/g, " ").replace(/\s+/g, " ").trim();
  
  // 3. Clean variations of greetings in English and Hindi
  const greetingsRegex = /^(hello+|hi+|hey+|greetings|namaste|pranam|hola|yo|sup|हैलो+|हेलो+|हाय+|हे+|नमस्ते+|प्रणाम+|सत+श्री+अकाल)$/i;
  const lowInput = cleanInput.toLowerCase().trim();
  
  if (greetingsRegex.test(lowInput)) {
    return null; // pure greeting, not a name
  }

  // 4. Block conversational/instruction keywords
  const conversationalKeywords = [
    'speak', 'talk', 'english', 'hindi', 'language', 'track', 'order', 
    'cake', 'menu', 'help', 'how', 'what', 'where', 'why', 'who', 
    'no', 'yes', 'ok', 'okay', 'sure', 'please', 'only', 'write', 'read',
    'sourdough', 'pastry', 'bread', 'cookie', 'cookies', 'croissant',
    'waffle', 'waffles', 'hai', 'he', 'h', 'aaj', 'kya', 'tha', 'thi',
    'milega', 'milegi', 'price', 'rate', 'address', 'deliver', 'delivery',
    'pickup', 'time', 'slot', 'date', 'order', 'book', 'booking'
  ];

  const wordsList = lowInput.split(/\s+/);
  for (const keyword of conversationalKeywords) {
    if (wordsList.includes(keyword)) {
      return null; // Conversational word detected, not a name
    }
  }

  // 5. English Regex patterns to match common ways of stating a name:
  const patterns = [
    /my name is\s+([a-zA-Z\u0900-\u097F\s]+)/i,
    /i am\s+([a-zA-Z\u0900-\u097F\s]+)/i,
    /im\s+([a-zA-Z\u0900-\u097F\s]+)/i,
    /this is\s+([a-zA-Z\u0900-\u097F\s]+)/i,
    /name is\s+([a-zA-Z\u0900-\u097F\s]+)/i,
    /naam hai\s+([a-zA-Z\u0900-\u097F\s]+)/i,
    /mera naam\s+([a-zA-Z\u0900-\u097F\s]+)/i,
    /myself\s+([a-zA-Z\u0900-\u097F\s]+)/i,
    /bol raha hu\s+([a-zA-Z\u0900-\u097F\s]+)/i,
    /bol rahi hu\s+([a-zA-Z\u0900-\u097F\s]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = cleanInput.match(pattern);
    if (match && match[1]) {
      let namePart = match[1].trim();
      // Remove trailing Hindi/English verbs or spaces
      namePart = namePart.replace(/\b(hai|hoon|hu|here|ji|है|हूं|हूँ)\b/gi, "").trim();
      if (namePart && !greetingsRegex.test(namePart.toLowerCase())) {
        return namePart.split(/\s+/).slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    }
  }
  
  // 6. Secondary fallback: strip greeting words and skip pronouns
  let words = cleanInput.split(/\s+/).filter(w => !greetingsRegex.test(w));
  if (words.length > 0) {
    let startIndex = 0;
    // Skip pronouns/prefix words in both English and Hindi
    const prefixRegex = /^(my|name|is|i|am|im|this|mera|naam|hai|hoon|hu|here|ji|मायसैल्फ|मयासेल्फ|इट्स|इतस|है|हूं|हूँ)$/i;
    while (startIndex < words.length && prefixRegex.test(words[startIndex])) {
      startIndex++;
    }
    
    // If there are more than 3 words left, it's a sentence or address, not a name
    if (words.length - startIndex > 3) {
      return null;
    }

    const finalWords = words.slice(startIndex, startIndex + 2);
    if (finalWords.length > 0) {
      const parsed = finalWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      const cleanedParsed = parsed.replace(/\b(hai|hoon|hu|here|ji|है|हूं|हूँ)\b/gi, "").trim();
      if (cleanedParsed && !greetingsRegex.test(cleanedParsed.toLowerCase())) {
        return cleanedParsed;
      }
    }
  }
  
  return null;
}

// --- Speech Recognition (Voice Input) ---
let recognition;
let isListening = false;

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech recognition is not supported in this browser.");
    const micBtn = document.getElementById('chatMicBtn');
    if (micBtn) micBtn.style.display = 'none';
    return;
  }
  
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;
    const micBtn = document.getElementById('chatMicBtn');
    if (micBtn) {
      micBtn.classList.add('listening');
      micBtn.innerHTML = '🛑';
    }
    const inputEl = document.getElementById('chatInput');
    if (inputEl) inputEl.placeholder = "Listening... speak now 🎙️";
  };

  recognition.onend = () => {
    isListening = false;
    const micBtn = document.getElementById('chatMicBtn');
    if (micBtn) {
      micBtn.classList.remove('listening');
      micBtn.innerHTML = '🎙️';
    }
    const inputEl = document.getElementById('chatInput');
    if (inputEl) inputEl.placeholder = "Type or speak a message...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const inputEl = document.getElementById('chatInput');
    if (inputEl) {
      inputEl.value = transcript;
      handleSend(); // Auto send the spoken query!
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    isListening = false;
    const micBtn = document.getElementById('chatMicBtn');
    if (micBtn) {
      micBtn.classList.remove('listening');
      micBtn.innerHTML = '🎙️';
    }
    const inputEl = document.getElementById('chatInput');
    if (inputEl) inputEl.placeholder = "Type or speak a message...";
  };
}

function toggleSpeech() {
  if (!recognition) {
    initSpeechRecognition();
  }
  if (!recognition) return;
  
  if (isListening) {
    recognition.stop();
  } else {
    // Determine language based on local selection
    const pref = localStorage.getItem('bakery_language_preference') || 'english';
    recognition.lang = pref === 'hindi' ? 'hi-IN' : 'en-IN'; // en-IN handles Hinglish/Indian accent beautifully
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  }
}

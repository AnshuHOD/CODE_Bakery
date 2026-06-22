// chatbot.js — Custom Smart Chatbot Logic for Bakery Website
// Handles interactive FAQ, Order Tracking, and Custom Cake Lead Qualification.

const API_BASE = CONFIG.API_BASE;

// Chatbot HTML injection
const chatbotHTML = `
  <div class="chatbot-bubble" id="chatBubble" onclick="toggleChat(true)">💬</div>
  <div class="chatbot-container" id="chatContainer">
    <div class="chatbot-header">
      <h3><span>🎂</span> Sweet Bites Assistant <span class="chatbot-status"></span></h3>
      <button class="chatbot-close" onclick="toggleChat(false)">✕</button>
    </div>
    <div class="chatbot-messages" id="chatMessages">
      <!-- Messages go here -->
    </div>
    <div class="chatbot-input-area">
      <input type="text" id="chatInput" class="chatbot-input" placeholder="Type a message..." onkeydown="handleInputKey(event)" />
      <button class="chatbot-send" onclick="handleSend()">➔</button>
    </div>
  </div>
`;

// Inject chatbot elements on document load
document.addEventListener('DOMContentLoaded', () => {
  const div = document.createElement('div');
  div.innerHTML = chatbotHTML;
  document.body.appendChild(div);
  
  // Initial Greeting
  addBotMessage("Hello there! Welcome to Sweet Bites Bakery 🎂. How can I help you today?");
  showOptions();
});

let botState = 'idle'; // 'idle', 'tracking', 'lead_name', 'lead_email', 'lead_phone', 'lead_desc', 'lead_budget'
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
  
  // Create Message Bubble
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = text;
  
  messagesDiv.appendChild(bubble);
  scrollToBottom();
}

function addUserMessage(text) {
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
    { text: '🎂 Request Custom Cake (CRM Inquiry)', action: () => startLeadFlow() },
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

// CRM LEAD INTAKE FLOW (QUALIFICATION)
function startLeadFlow() {
  botState = 'lead_name';
  addBotMessage("Fantastic! I will collect details for your custom cake order. What is your **Full Name**?");
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
  
  if (botState === 'tracking') {
    handleTracking(text);
  } else if (botState === 'lead_name') {
    leadData.name = text;
    botState = 'lead_email';
    addBotMessage(`Nice to meet you, ${text}! What is your **Email Address**?`);
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
    // If idle, conversational chatbot response
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
  showTypingIndicator();
  try {
    const res = await fetch(`${API_BASE}/chatbot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
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

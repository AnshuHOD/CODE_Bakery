// config.js — Production & Local Dynamic API configurations
// Change the URL below to point to your live Render backend URL after deployment.

const CONFIG = {
  API_BASE: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://sweet-bites-backend.onrender.com/api' // <-- RENDER BACKEND URL HERE
};

// generateOrderId.js — Unique readable Order ID banana
// Format: ORD-YYYYMMDD-XXXX (jaise ORD-20260619-4821)
// Human-readable hai aur phone pe bolne mein aasan

const generateOrderId = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `ORD-${dateStr}-${random}`;
};

module.exports = generateOrderId;

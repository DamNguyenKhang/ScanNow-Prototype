const SCAN_NOW_STATE = { 
  cart: JSON.parse(localStorage.getItem('scanNowCart') || '[]'),
  orders: JSON.parse(localStorage.getItem('scanNowOrders') || '[]'),
  lastOrderId: localStorage.getItem('scanNowLastOrderId') || null
};

// Menu items data
const MENU_ITEMS = {
  'seafood-noodles': { id: 'seafood-noodles', name: 'Spicy Seafood Noodles', price: 125000, desc: 'Fresh seafood with spicy broth and handmade noodles.' },
  'pork-rice': { id: 'pork-rice', name: 'Grilled Pork Rice', price: 95000, desc: 'Marinated pork served with jasmine rice.' },
  'berry-fizz': { id: 'berry-fizz', name: 'Summer Berry Fizz', price: 65000, desc: 'Sparkling soda with mix berries.' }
};

function saveState() {
  localStorage.setItem('scanNowCart', JSON.stringify(SCAN_NOW_STATE.cart));
  localStorage.setItem('scanNowOrders', JSON.stringify(SCAN_NOW_STATE.orders));
  localStorage.setItem('scanNowLastOrderId', SCAN_NOW_STATE.lastOrderId || '');
}

function addToCart(itemId, name, price, qty = 1) {
  const menuItem = MENU_ITEMS[itemId];
  if (!menuItem) return;
  
  const item = {
    id: itemId,
    name: name || menuItem.name,
    price: price || menuItem.price,
    qty: qty
  };
  
  const existing = SCAN_NOW_STATE.cart.find(i => i.id === itemId);
  if (existing) {
    existing.qty += qty;
  } else {
    SCAN_NOW_STATE.cart.push(item);
  }
  saveState();
  if (typeof updateCartUI === 'function') updateCartUI();
}

function updateCartQty(id, delta) {
  const existing = SCAN_NOW_STATE.cart.find(i => i.id === id);
  if (existing) {
    existing.qty += delta;
    if (existing.qty <= 0) {
      SCAN_NOW_STATE.cart = SCAN_NOW_STATE.cart.filter(i => i.id !== id);
    }
  }
  saveState();
  if (typeof updateCartUI === 'function') updateCartUI();
}

function removeFromCart(id) {
  SCAN_NOW_STATE.cart = SCAN_NOW_STATE.cart.filter(i => i.id !== id);
  saveState();
  if (typeof updateCartUI === 'function') updateCartUI();
}

function clearCart() {
  SCAN_NOW_STATE.cart = [];
  saveState();
  if (typeof updateCartUI === 'function') updateCartUI();
}

function getCartTotal() {
  return SCAN_NOW_STATE.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
  return SCAN_NOW_STATE.cart.reduce((sum, item) => sum + item.qty, 0);
}

function placeOrder() {
  if (SCAN_NOW_STATE.cart.length === 0) return null;
  
  const total = getCartTotal();
  const id = 'SN-' + Math.floor(1000 + Math.random() * 9000);
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const p = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const t = h + ':' + m + ' ' + p;
  
  const newOrder = {
    id: id,
    items: JSON.parse(JSON.stringify(SCAN_NOW_STATE.cart)),
    total: total,
    time: t,
    status: 'Awaiting Confirmation',
    createdAt: new Date().toISOString()
  };
  
  SCAN_NOW_STATE.orders.unshift(newOrder);
  SCAN_NOW_STATE.lastOrderId = id;
  clearCart();
  saveState();
  
  return id;
}

function getLastOrder() {
  return SCAN_NOW_STATE.orders.length > 0 ? SCAN_NOW_STATE.orders[0] : null;
}

function getAllOrders() {
  return SCAN_NOW_STATE.orders;
}

function formatVND(amount) {
  return amount.toLocaleString('vi-VN') + ' ₫';
}

window.addEventListener('load', () => {
  if (typeof updateCartUI === 'function') updateCartUI();
});

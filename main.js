/* js/main.js - simple cart using localStorage, product helpers */
const Cart = {
  key: 'watch_shop_cart_v1',
  get(){ return JSON.parse(localStorage.getItem(this.key) || '[]'); },
  save(items){ localStorage.setItem(this.key, JSON.stringify(items)); },
  add(product){
    const items = this.get();
    const idx = items.findIndex(i=>i.id===product.id);
    if(idx>-1){ items[idx].qty += product.qty || 1; }
    else{ items.push({...product, qty: product.qty || 1}); }
    this.save(items);
    return items;
  },
  update(id, qty){
    let items = this.get();
    items = items.map(i=> i.id===id ? {...i, qty: qty} : i).filter(i=> i.qty>0);
    this.save(items);
    return items;
  },
  remove(id){
    let items = this.get().filter(i=> i.id!==id);
    this.save(items);
    return items;
  },
  clear(){ this.save([]); }
};

function formatINR(n){ return '₹' + Number(n).toFixed(2); }

function refreshCartCount(){
  const count = Cart.get().reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('cart-count');
  if(el) el.innerText = count;
}
document.addEventListener('DOMContentLoaded', refreshCartCount);

function addToCartFromPage(product){
  Cart.add(product);
  refreshCartCount();
  alert('Product added to cart');
}

function renderCartTable(){
  const table = document.getElementById('cart-table');
  if(!table) return;
  const items = Cart.get();
  if(items.length===0){
    table.innerHTML = '<tr><td colspan="6">Your cart is empty</td></tr>';
    return;
  }
  let html = '';
  let total = 0;
  items.forEach(it=>{
    const s = (it.price * it.qty);
    total += s;
    html += `<tr>
      <td style="width:120px"><img src="${it.image}" style="width:100px;border-radius:8px"></td>
      <td>${it.name}</td>
      <td><input type="number" min="1" value="${it.qty}" style="width:70px" onchange="updateQty('${it.id}', this.value)"></td>
      <td>${formatINR(it.price)}</td>
      <td>${formatINR(s)}</td>
      <td><button onclick="removeItem('${it.id}')">Remove</button></td>
    </tr>`;
  });
  html += `<tr><td colspan="4" style="text-align:right;font-weight:700">Total</td><td colspan="2">${formatINR(total)}</td></tr>`;
  table.innerHTML = html;
}
function updateQty(id, qty){ Cart.update(id, Number(qty)); renderCartTable(); refreshCartCount(); }
function removeItem(id){ Cart.remove(id); renderCartTable(); refreshCartCount(); }

function handleCheckoutSubmit(e){
  e.preventDefault();
  const items = Cart.get();
  if(items.length===0){ alert('Cart is empty'); return; }
  const fd = new FormData(e.target);
  const order = {
    id: 'ORD' + Date.now(),
    name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'),
    items, total: items.reduce((s,i)=>s+i.price*i.qty,0), date: new Date().toISOString()
  };
  const orders = JSON.parse(localStorage.getItem('orders')||'[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  Cart.clear();
  refreshCartCount();
  window.location.href = 'success.html?order=' + order.id;
}

document.addEventListener('DOMContentLoaded', function(){
  const checkoutForm = document.getElementById('checkout-form');
  if(checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  renderCartTable();
});
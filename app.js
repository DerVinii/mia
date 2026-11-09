const FREE_SHIPPING_FROM = 100, SHIPPING_COST = 4.90;
const eur = n => n.toFixed(2).replace(".", ",") + " €";
const $ = id => document.getElementById(id);
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let brand = "Alle", query = "";

const brands = ["Alle", ...new Set(PRODUCTS.map(p => p.brand))];
$("filters").innerHTML = brands.map(b => `<button class="chip${b==="Alle"?" active":""}" data-b="${b}">${b}</button>`).join("");
$("filters").onclick = e => {
  if (!e.target.dataset.b) return;
  brand = e.target.dataset.b;
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.b === brand));
  render();
};
$("search").oninput = e => { query = e.target.value.toLowerCase(); render(); };

function render() {
  const list = PRODUCTS.filter(p => (brand === "Alle" || p.brand === brand) &&
    (p.brand + " " + p.name + " " + p.category).toLowerCase().includes(query));
  $("grid").innerHTML = list.map(p => {
    const off = Math.round((1 - p.price / p.oldPrice) * 100);
    return `<div class="card">
      <div class="img">${p.image ? `<img src="${p.image}" alt="${p.brand} ${p.name}">` : (p.category === "Schuhe" ? "👟" : "👕")}
        <span class="badge">-${off}%</span></div>
      <div class="info">
        <span class="brand">${p.brand}</span><b>${p.name}</b>
        <span class="price"><b>${eur(p.price)}</b><s>${eur(p.oldPrice)}</s></span>
        <span class="delivery">✓ Lieferung in 2–4 Werktagen</span>
        <select id="size${p.id}">${p.sizes.map(s => `<option>${s}</option>`).join("")}</select>
        <button class="primary" onclick="add(${p.id})">In den Warenkorb</button>
      </div></div>`;
  }).join("") || "<p>Keine Produkte gefunden.</p>";
}

function add(id) {
  const size = $("size" + id).value;
  const found = cart.find(i => i.id === id && i.size === size);
  found ? found.qty++ : cart.push({ id, size, qty: 1 });
  saveCart(); $("cart").classList.remove("hidden");
}
function change(i, d) { cart[i].qty += d; if (cart[i].qty <= 0) cart.splice(i, 1); saveCart(); }
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); renderCart(); }

function renderCart() {
  const prod = id => PRODUCTS.find(p => p.id === id);
  const sub = cart.reduce((s, i) => s + prod(i.id).price * i.qty, 0);
  const ship = sub === 0 || sub >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  $("cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
  $("cartItems").innerHTML = cart.map((i, idx) => `<div class="item">
    <span><b>${prod(i.id).brand}</b> ${prod(i.id).name}<br>Größe ${i.size}</span>
    <span><button onclick="change(${idx},-1)">−</button> ${i.qty} <button onclick="change(${idx},1)">+</button><br>${eur(prod(i.id).price * i.qty)}</span>
  </div>`).join("") || "<p>Dein Warenkorb ist leer.</p>";
  $("subtotal").textContent = eur(sub); $("shipping").textContent = eur(ship); $("total").textContent = eur(sub + ship);
}

$("cartBtn").onclick = () => $("cart").classList.remove("hidden");
$("closeCart").onclick = () => $("cart").classList.add("hidden");
$("checkoutBtn").onclick = () => cart.length ? $("checkout").showModal() : alert("Warenkorb ist leer.");
$("cancelCheckout").onclick = () => $("checkout").close();
$("checkoutForm").onsubmit = () => {
  alert("Danke für deine Bestellung! (Demo – noch keine echte Zahlung)");
  cart = []; saveCart(); $("cart").classList.add("hidden");
};

render(); renderCart();

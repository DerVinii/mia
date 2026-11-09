// Gemeinsame Logik: Daten (localStorage-Mock), Header/Footer, Warenkorb, Checkout.
const FREE_SHIPPING_FROM = 100, SHIPPING_COST = 4.90;
const $ = id => document.getElementById(id);
const eur = n => Number(n).toFixed(2).replace(".", ",") + " €";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const getProducts = () => load("products", null) || window.PRODUCTS;
const getProduct = id => getProducts().find(p => p.id === Number(id));
const getUsers = () => load("users", []);
const currentUser = () => getUsers().find(u => u.email === load("session", null));
const getOrders = () => load("orders", []);
const discount = p => p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
const productImg = p => p.image ? `<img src="${esc(p.image)}" alt="${esc(p.brand + " " + p.name)}">` : (p.category === "Schuhe" ? "👟" : "👕");

let cart = load("cart", []);

function cartTotals() {
  const sub = cart.reduce((s, i) => s + (getProduct(i.id)?.price || 0) * i.qty, 0);
  const ship = sub === 0 || sub >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  return { sub, ship, total: sub + ship };
}
function saveCart() { save("cart", cart); renderCart(); }
function add(id, size, qty = 1) {
  const found = cart.find(i => i.id === id && i.size === size);
  found ? found.qty += qty : cart.push({ id, size, qty });
  saveCart(); $("cart").classList.remove("hidden");
}
function change(i, d) { cart[i].qty += d; if (cart[i].qty <= 0) cart.splice(i, 1); saveCart(); }
function renderCart() {
  cart = cart.filter(i => getProduct(i.id));
  const t = cartTotals();
  $("cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
  $("cartItems").innerHTML = cart.map((i, idx) => { const p = getProduct(i.id); return `<div class="item">
    <span><b>${esc(p.brand)}</b> ${esc(p.name)}<br>Größe ${esc(i.size)}</span>
    <span><button onclick="change(${idx},-1)">−</button> ${i.qty} <button onclick="change(${idx},1)">+</button><br>${eur(p.price * i.qty)}</span>
  </div>`; }).join("") || "<p>Dein Warenkorb ist leer.</p>";
  $("subtotal").textContent = eur(t.sub); $("shipping").textContent = eur(t.ship); $("total").textContent = eur(t.total);
}

function buildShell() {
  const u = currentUser();
  document.body.insertAdjacentHTML("afterbegin", `
  <div class="topbar">🚚 Lieferung in 2–4 Werktagen · Gratis Versand ab 100 € · 14 Tage Rückgabe · <b>Mockup – keine echten Bestellungen</b></div>
  <header>
    <a class="logo" href="index.html">MIA</a>
    <form id="searchForm" action="index.html"><input id="search" name="q" type="search" placeholder="Marke oder Produkt suchen…"></form>
    <a class="nav-link" href="account.html">👤 ${u ? esc(u.name.split(" ")[0]) : "Konto"}</a>
    <button id="cartBtn" class="cart-btn">🛒 Warenkorb (<span id="cartCount">0</span>)</button>
  </header>`);
  document.body.insertAdjacentHTML("beforeend", `
  <aside id="cart" class="cart hidden">
    <div class="cart-head"><h2>Warenkorb</h2><button id="closeCart">✕</button></div>
    <div id="cartItems"></div>
    <div class="cart-foot">
      <div>Zwischensumme: <b id="subtotal"></b></div><div>Versand: <b id="shipping"></b></div>
      <div class="total">Gesamt: <b id="total"></b></div>
      <button id="checkoutBtn" class="primary">Zur Kasse</button>
    </div>
  </aside>
  <dialog id="checkout"><form id="checkoutForm"></form></dialog>
  <footer>
    <p><a href="impressum.html">Impressum</a> · <a href="datenschutz.html">Datenschutz</a> · <a href="agb.html">AGB</a> · <a href="widerruf.html">Widerruf</a> · <a href="admin.html">Admin</a></p>
    <p>© MIA – Mockup-Shop, keine echten Verkäufe</p>
  </footer>`);
  const q = new URLSearchParams(location.search).get("q");
  if (q) $("search").value = q;
  $("cartBtn").onclick = () => $("cart").classList.remove("hidden");
  $("closeCart").onclick = () => $("cart").classList.add("hidden");
  $("checkoutBtn").onclick = openCheckout;
  renderCart();
}

function openCheckout() {
  if (!cart.length) return alert("Warenkorb ist leer.");
  const u = currentUser() || {};
  const t = cartTotals();
  $("checkoutForm").innerHTML = `
    <h2>Bestellung abschließen</h2>
    <input required name="name" placeholder="Vor- und Nachname" value="${esc(u.name)}">
    <input required name="street" placeholder="Straße und Hausnummer">
    <div class="row"><input required name="zip" placeholder="PLZ"><input required name="city" placeholder="Ort"></div>
    <input required type="email" name="email" placeholder="E-Mail" value="${esc(u.email)}">
    <select name="pay"><option>PayPal</option><option>Kreditkarte</option><option>Klarna</option><option>Vorkasse</option></select>
    <p><b>Gesamt: ${eur(t.total)}</b></p>
    <p class="note">Mockup: Es wird keine echte Zahlung ausgelöst. Mit „Jetzt kaufen" akzeptierst du die <a href="agb.html" target="_blank">AGB</a> und hast die <a href="widerruf.html" target="_blank">Widerrufsbelehrung</a> gelesen.</p>
    <div class="row"><button type="button" id="cancelCheckout">Abbrechen</button><button class="primary" type="submit">Jetzt kaufen</button></div>`;
  $("cancelCheckout").onclick = () => $("checkout").close();
  $("checkoutForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target), t2 = cartTotals();
    const order = {
      id: "MIA-" + Date.now().toString(36).toUpperCase(), date: new Date().toISOString(), status: "Neu",
      email: f.get("email"), name: f.get("name"), address: `${f.get("street")}, ${f.get("zip")} ${f.get("city")}`, pay: f.get("pay"),
      items: cart.map(i => { const p = getProduct(i.id); return { id: p.id, brand: p.brand, name: p.name, size: i.size, qty: i.qty, price: p.price }; }),
      total: t2.total
    };
    save("orders", [order, ...getOrders()]);
    cart = []; saveCart(); $("cart").classList.add("hidden");
    $("checkoutForm").innerHTML = `<h2>Danke für deine Bestellung! 🎉</h2><p>Bestellnummer: <b>${order.id}</b></p>
      <p>Voraussichtliche Lieferung in 2–4 Werktagen. (Mockup – keine echte Bestellung)</p>
      <button type="button" class="primary" onclick="$('checkout').close()">Weiter einkaufen</button>`;
  };
  $("checkout").showModal();
}

buildShell();

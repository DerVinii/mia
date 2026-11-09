// Startseite: Filter, Suche, Produktraster
let brand = "Alle", query = (new URLSearchParams(location.search).get("q") || "").toLowerCase();
const brands = ["Alle", ...new Set(getProducts().map(p => p.brand))];
$("filters").innerHTML = brands.map(b => `<button class="chip${b === "Alle" ? " active" : ""}" data-b="${esc(b)}">${esc(b)}</button>`).join("");
$("filters").onclick = e => {
  if (!e.target.dataset.b) return;
  brand = e.target.dataset.b;
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.b === brand));
  render();
};
$("search").oninput = e => { query = e.target.value.toLowerCase(); render(); };
$("searchForm").onsubmit = e => { e.preventDefault(); };

function render() {
  const list = getProducts().filter(p => (brand === "Alle" || p.brand === brand) &&
    (p.brand + " " + p.name + " " + p.category).toLowerCase().includes(query));
  $("grid").innerHTML = list.map(p => `<div class="card">
    <a class="img" href="product.html?id=${p.id}">${productImg(p)}${discount(p) ? `<span class="badge">-${discount(p)}%</span>` : ""}</a>
    <div class="info">
      <span class="brand">${esc(p.brand)}</span><a class="pname" href="product.html?id=${p.id}">${esc(p.name)}</a>
      <span class="price"><b>${eur(p.price)}</b>${p.oldPrice > p.price ? `<s>${eur(p.oldPrice)}</s>` : ""}</span>
      <span class="delivery">✓ Lieferung in 2–4 Werktagen</span>
      <a class="primary btn" href="product.html?id=${p.id}">Ansehen</a>
    </div></div>`).join("") || "<p>Keine Produkte gefunden.</p>";
}
render();

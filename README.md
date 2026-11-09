# MIA – Online-Shop für Marken-Fashion

Statischer Shop (HTML/CSS/JS). Starten: `index.html` im Browser öffnen oder `python3 -m http.server 8000`.

- Produkte pflegen: `products.js` (Bilder in `images/`)
- Funktionen: Marken-Filter, Suche, Warenkorb (localStorage), Versandkosten, Checkout-Formular (Demo)

## Noch nötig für den echten Betrieb
1. Echte Zahlung (Stripe / PayPal / Shopify Payments)
2. Backend/Datenbank für Bestellungen & Lagerbestand
3. Rechtstexte: Impressum, Datenschutz, AGB, Widerruf (Pflicht in DE/EU)
4. Nur **originale** Ware von autorisierten Händlern/Großhändlern; Markenlogos/Fotos nur mit Erlaubnis

## Seiten (Mockup, Daten in localStorage)
- `index.html` Shop · `product.html?id=…` Produktseite · `account.html` Kundenkonto (Registrieren/Login/Bestellungen)
- `admin.html` Admin-Panel (Passwort **admin**): Produkte anlegen/bearbeiten/löschen, Bestellungen & Status
- `impressum.html`, `datenschutz.html`, `agb.html`, `widerruf.html`: **Vorlagen** mit [Platzhaltern], keine Rechtsberatung

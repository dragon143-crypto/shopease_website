
// Utility: read URL params
function getParam(name) {
  return new URL(location.href).searchParams.get(name);
}

// Find product by id
function findProductById(id) {
  return PRODUCTS.find(p => +p.id === +id);
}

function formatPrice(n) {
  return "₹" + n.toLocaleString("en-IN");
}

// Make star rating
function createStars(r) {
  const full = Math.floor(r);
  const half = (r - full) >= 0.5;
  let html = "";
  for (let i = 0; i < full; i++) html += "★";
  if (half) html += "☆";
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += "☆";
  return html;
}

// RENDER PRODUCT
function renderProduct(p) {
  if (!p) return;

  document.title = p.title + " — ShopEase";

  // Title, price, discount
  document.getElementById("pTitle").textContent = p.title;
  document.getElementById("pPrice").textContent = formatPrice(p.price);
  document.getElementById("pMRP").textContent = formatPrice(p.mrp);

  const discount = Math.round((1 - p.price / p.mrp) * 100);
  document.getElementById("pDiscount").textContent = discount + "% off";

  document.getElementById("shortDesc").textContent = p.shortDesc;

  // Rating
  document.getElementById("ratingStars").textContent = createStars(p.rating);
  document.getElementById("ratingCount").textContent =
    `${p.rating} (${p.ratingCount} reviews)`;

  // Stock
  const stock = document.getElementById("stockBadge");
  if (p.inStock) {
    stock.className = "stock in-stock";
    stock.textContent = "In Stock";
  } else {
    stock.className = "stock out";
    stock.textContent = "Out of Stock";
  }

  // Gallery
  const mainImg = document.getElementById("mainImage");
  const thumbs = document.getElementById("thumbs");

  mainImg.src = p.images[0];
  thumbs.innerHTML = "";

  p.images.forEach((src, index) => {
    const btn = document.createElement("button");
    const img = document.createElement("img");
    img.src = src;
    btn.appendChild(img);

    btn.onclick = () => {
      mainImg.src = src;
      [...thumbs.children].forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };

    if (index === 0) btn.classList.add("active");
    thumbs.appendChild(btn);
  });

  // Colors
  const swatches = document.getElementById("colorSwatches");
  swatches.innerHTML = "";
  p.colors.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "swatch";
    div.style.background = c;

    div.onclick = () => {
      [...swatches.children].forEach(s => s.classList.remove("selected"));
      div.classList.add("selected");
    };

    if (i === 0) div.classList.add("selected");
    swatches.appendChild(div);
  });

  // Offers
  const offerList = document.getElementById("offerList");
  offerList.innerHTML = "";
  (p.offers || []).forEach(o => {
    const li = document.createElement("li");
    li.textContent = o;
    offerList.appendChild(li);
  });

  // Description
  document.getElementById("longDesc").innerHTML = p.description;

  // Specifications
  const specTable = document.getElementById("specTable");
  specTable.innerHTML = "";
  for (const key in p.specs) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${key}</td><td>${p.specs[key]}</td>`;
    specTable.appendChild(tr);
  }

  // Reviews
  const reviewList = document.getElementById("reviewList");
  reviewList.innerHTML = "";
  (p.reviews || []).forEach(r => {
    const div = document.createElement("div");
    div.className = "review";
    div.innerHTML = `
      <div class="meta"><strong>${r.name}</strong> • ${r.rating} ★ • ${r.date}</div>
      <div class="body">${r.text}</div>
    `;
    reviewList.appendChild(div);
  });

  // Related products
  const related = PRODUCTS.filter(x =>
    x.category === p.category && x.id !== p.id
  ).slice(0, 6);

  const relBox = document.getElementById("relatedContainer");
  relBox.innerHTML = "";

  related.forEach(r => {
    const card = document.createElement("div");
    card.className = "related-card";
    card.innerHTML = `
      <a href="product-details.html?id=${r.id}">
        <img src="${r.images[0]}" />
        <h4>${r.title}</h4>
        <div class="price">${formatPrice(r.price)}</div>
      </a>
    `;
    relBox.appendChild(card);
  });
}

// Tabs
document.addEventListener("click", (e) => {
  if (e.target.matches(".tab-btn")) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");

    const tab = e.target.dataset.tab;
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  }
});

// Load page
document.addEventListener("DOMContentLoaded", () => {
  const id = getParam("id");
  const product = findProductById(id);

  if (!product) {
    document.querySelector(".container").innerHTML =
      "<h2>Product not found.</h2>";
    return;
  }

  renderProduct(product);

 // ensure cart.js and wishlist.js are loaded before this script in HTML
document.getElementById("addCart").addEventListener("click", () => {
  // get selected color if any
  const selColorEl = document.querySelector("#colorSwatches .swatch.selected");
  const color = selColorEl ? selColorEl.title || selColorEl.style.background : null;
  const qty = +document.getElementById("qty").value || 1;
  Cart.add(product, qty, color); // product is the product object in scope
  alert(`${qty} x ${product.title} added to cart.`);
});

document.getElementById("wishlist").addEventListener("click", (e) => {
  const added = Wishlist.toggle(product);
  e.target.textContent = added ? "♥ Wishlisted" : "❤ Wishlist";
});

  // Submit review
  document.getElementById("submitReview").onclick = () => {
    const rating = +document.getElementById("reviewRating").value;
    const text = document.getElementById("reviewText").value.trim();
    if (!text) return alert("Write a review!");

    product.reviews.unshift({
      name: "You",
      rating,
      text,
      date: new Date().toISOString().split("T")[0]
    });

    renderProduct(product);
    document.getElementById("reviewText").value = "";
  };
});

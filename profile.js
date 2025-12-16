/* PROFILE PAGE JS */

document.addEventListener("DOMContentLoaded", () => {
  loadProfileUI();
  loadOrdersUI();
  loadWishlistUI();
  loadActivityUI();
  loadSessionsUI();
});

/* ---------- PROFILE ---------- */
function loadProfileUI() {
  const p = getProfile();
  document.getElementById("userFullName").textContent = p.name;
  document.getElementById("header-email").textContent = p.email;
  document.getElementById("inputName").value = p.name;
  document.getElementById("inputEmail").value = p.email;
  document.getElementById("inputPhone").value = p.phone;
  document.getElementById("inputBio").value = p.bio;

  if (p.avatar) document.getElementById("avatarImg").src = p.avatar;
}

function saveProfileChanges() {
  updateProfile({
    name: document.getElementById("inputName").value,
    email: document.getElementById("inputEmail").value,
    phone: document.getElementById("inputPhone").value,
    bio: document.getElementById("inputBio").value
  });

  alert("Profile updated!");
  loadProfileUI();
}

/* ---------- ORDERS ---------- */
function loadOrdersUI() {
  const list = getOrders();
  const box = document.getElementById("ordersList");
  box.innerHTML = "";

  if (!list.length) {
    box.innerHTML = "<p>No orders found</p>";
    return;
  }

  list.forEach(o => {
    box.innerHTML += `
      <div class="item">
        <img src="${o.img}">
        <div class="meta">
          <h4>${o.title} (${o.id})</h4>
          <p>${o.date} • ${o.price}</p>
        </div>
      </div>
    `;
  });
}

/* ---------- WISHLIST ---------- */
function loadWishlistUI() {
  const list = getWishlist();
  const box = document.getElementById("wishList");
  box.innerHTML = "";

  if (!list.length) {
    box.innerHTML = "<p>No wishlist items</p>";
    return;
  }

  list.forEach(w => {
    box.innerHTML += `
      <div class="item">
        <img src="${w.img}">
        <div class="meta">
          <h4>${w.title}</h4>
          <p>${w.price}</p>
        </div>
      </div>
    `;
  });
}

/* ---------- ACTIVITY ---------- */
function loadActivityUI() {
  const list = getActivity();
  const box = document.querySelector("#activityTable tbody");
  box.innerHTML = "";

  list.forEach(a => {
    box.innerHTML += `
      <tr>
        <td>${a.when}</td>
        <td>${a.event}</td>
        <td>${a.meta}</td>
      </tr>
    `;
  });
}

/* ---------- SESSIONS ---------- */
function loadSessionsUI() {
  const list = getSessions();
  const box = document.querySelector("#sessionsTable tbody");
  box.innerHTML = "";

  list.forEach((s, i) => {
    box.innerHTML += `
      <tr>
        <td>${s.device}</td>
        <td>${s.location}</td>
        <td>${s.last}</td>
        <td><button onclick="removeSession(${i})">Revoke</button></td>
      </tr>
    `;
  });
}

function removeSession(i) {
  revokeSession(i);
  loadSessionsUI();
}

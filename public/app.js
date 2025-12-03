const apiBase = "";

const loginStatusEl = document.getElementById("login-status");
const couponsListEl = document.getElementById("coupons-list");
const refreshCouponsBtn = document.getElementById("refresh-coupons");
const couponCountEl = document.getElementById("coupon-count");

const bestCouponForm = document.getElementById("best-coupon-form");
const bestErrorEl = document.getElementById("best-error");
const bestResultEl = document.getElementById("best-result");

let currentUser = null;

function loadUserFromStorage() {
  try {
    const raw = window.localStorage.getItem("couponDemoUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setLoginStatus(user) {
  if (!user) {
    loginStatusEl.innerHTML =
      '<span class="badge badge-muted">Not logged in</span>';
    return;
  }
  loginStatusEl.innerHTML = `
    <span class="badge badge-success">
      <span style="width:8px;height:8px;border-radius:999px;background:#22c55e;display:inline-block;"></span>
      ${user.email} (${user.userTier})
    </span>
  `;
}

async function apiRequest(path, options = {}) {
  const url = apiBase + path;
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const message = data.error || resp.statusText || "Request failed";
    throw new Error(message);
  }
  return data;
}

function renderCoupons(coupons) {
  if (!Array.isArray(coupons) || coupons.length === 0) {
    couponsListEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <p class="muted">No coupons found.</p>
      </div>
    `;
    if (couponCountEl) couponCountEl.textContent = "0";
    return;
  }

  const now = new Date();

  couponsListEl.innerHTML = coupons
    .map((c) => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      const active = now >= start && now <= end;
      const typeLabel =
        c.discountType === "FLAT"
          ? `₹${c.discountValue} off`
          : `${c.discountValue}% off${
              c.maxDiscountAmount ? ` (max ₹${c.maxDiscountAmount})` : ""
            }`;

      const statusBadge = active
        ? '<span class="status-badge status-active">● Active</span>'
        : '<span class="status-badge status-inactive">○ Inactive</span>';

      return `
        <article class="coupon-card">
          <div class="coupon-main">
            <div class="coupon-header-row">
              <div class="coupon-code">${c.code}</div>
              ${statusBadge}
            </div>
            <div class="coupon-description">${c.description || "No description"}</div>
            <div class="chip-row">
              <span class="chip chip-accent">${typeLabel}</span>
              ${
                c.usageLimitPerUser
                  ? `<span class="chip chip-info">🔄 Limit: ${c.usageLimitPerUser}</span>`
                  : ""
              }
            </div>
          </div>
          <div class="coupon-meta">
            <div class="meta-item">
              <span class="meta-label">Valid from</span>
              <span class="meta-value">${start.toISOString().slice(0, 10)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Valid until</span>
              <span class="meta-value">${end.toISOString().slice(0, 10)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (couponCountEl) {
    couponCountEl.textContent = `${coupons.length} ${coupons.length === 1 ? "coupon" : "coupons"}`;
  }
}

async function loadCoupons() {
  try {
    couponsListEl.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="muted">Loading coupons...</p>
      </div>
    `;
    const data = await apiRequest("/api/coupons");
    renderCoupons(data.coupons || []);
  } catch (err) {
    couponsListEl.innerHTML = `
      <div class="error-state">
        <span class="error-icon">⚠️</span>
        <p class="error-text">${err.message}</p>
      </div>
    `;
    if (couponCountEl) couponCountEl.textContent = "Error";
  }
}

function buildCartFromSummary(total, categoriesCsv, itemsCount) {
  const categories = categoriesCsv
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  if (categories.length === 0) {
    categories.push("general");
  }

  const perItemValue = itemsCount > 0 ? total / itemsCount : 0;

  return {
    items: categories.map((cat) => ({
      productId: `demo-${cat}`,
      category: cat,
      unitPrice: perItemValue,
      quantity: 1,
    })),
  };
}

async function handleBestCoupon(e) {
  e.preventDefault();
  bestErrorEl.textContent = "";
  bestResultEl.classList.remove("best-empty");
  bestResultEl.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p class="muted">Computing best coupon...</p>
    </div>
  `;

  const tier = bestCouponForm.userTier.value;
  const country = bestCouponForm.country.value || "IN";
  const lifetimeSpend = Number(bestCouponForm.lifetimeSpend.value || "0");
  const ordersPlaced = 0; // Default to 0, removed from form to avoid overlay
  const cartTotal = Number(bestCouponForm.cartTotal.value || "0");
  const cartCategories = bestCouponForm.cartCategories.value || "";
  const itemsCount = Number(bestCouponForm.itemsCount.value || "1");

  const userId =
    (currentUser && currentUser.userId) || "sim-user-" + tier.toLowerCase();

  const payload = {
    user: {
      userId,
      userTier: tier,
      country,
      lifetimeSpend,
      ordersPlaced,
    },
    cart: buildCartFromSummary(cartTotal, cartCategories, itemsCount),
  };

  try {
    const result = await apiRequest("/api/coupons/best", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!result.coupon) {
      bestResultEl.classList.add("best-empty");
      bestResultEl.innerHTML = `
        <div class="result-placeholder">
          <span class="result-icon">🔍</span>
          <p class="muted">
            No coupon applies for this user/cart combination.
          </p>
        </div>
      `;
      return;
    }

    const c = result.coupon;
    const discount = result.discount;
    const discountTypeLabel =
      c.discountType === "PERCENT"
        ? `${c.discountValue}%${c.maxDiscountAmount ? ` (capped at ₹${c.maxDiscountAmount})` : ""}`
        : `₹${c.discountValue} flat discount`;

    bestResultEl.innerHTML = `
      <div class="result-success">
        <div class="result-header">
          <span class="result-badge">🏆 Best Match</span>
          <div class="coupon-code-large">${c.code}</div>
        </div>
        <div class="result-content">
          <div class="result-item">
            <span class="result-label">💰 Discount Amount</span>
            <span class="result-value highlight">₹${discount.toFixed(2)}</span>
          </div>
          <div class="result-item">
            <span class="result-label">📝 Description</span>
            <span class="result-value">${c.description || "No description"}</span>
          </div>
          <div class="result-item">
            <span class="result-label">🎯 Discount Type</span>
            <span class="result-value">${discountTypeLabel}</span>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    bestErrorEl.textContent = err.message;
    bestResultEl.classList.add("best-empty");
    bestResultEl.innerHTML = `
      <div class="result-placeholder">
        <span class="result-icon">⚠️</span>
        <p class="muted">Could not compute best coupon. ${err.message}</p>
      </div>
    `;
  }
}

refreshCouponsBtn.addEventListener("click", loadCoupons);
bestCouponForm.addEventListener("submit", handleBestCoupon);

window.addEventListener("DOMContentLoaded", () => {
  currentUser = loadUserFromStorage();
  setLoginStatus(currentUser);
  loadCoupons();
});



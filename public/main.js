const apiBase = "";

const loginForm = document.getElementById("login-form");
const loginErrorEl = document.getElementById("login-error");

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

async function handleLogin(e) {
  e.preventDefault();
  loginErrorEl.textContent = "";

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  try {
    const { user } = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Persist user info for the dashboard (non-secure, demo only)
    window.localStorage.setItem("couponDemoUser", JSON.stringify(user));

    window.location.href = "/app.html";
  } catch (err) {
    loginErrorEl.textContent = err.message;
  }
}

loginForm.addEventListener("submit", handleLogin);

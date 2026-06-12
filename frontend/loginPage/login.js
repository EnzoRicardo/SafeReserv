const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginMessage.textContent = "Entrando...";
  loginMessage.className = "login-message";

  try {
    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || "Não foi possível entrar.");
    }

    saveSession(data);
    redirectByRole(data.user.role);
  } catch (error) {
    loginMessage.textContent = error.message;
    loginMessage.className = "login-message error";
  }
});

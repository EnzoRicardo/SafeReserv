const form = document.getElementById("registerForm");
const message = document.getElementById("registerMessage");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("role").value;

  if (password !== confirmPassword) {
    message.textContent = "As senhas não coincidem.";
    message.className = "login-message error";
    return;
  }

  message.textContent = "Criando conta...";
  message.className = "login-message";

  try {
    const response = await fetch(`${API_BASE}/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorText = formatApiError(data);
      throw new Error(errorText || "Não foi possível criar a conta.");
    }

    saveSession(data);
    message.textContent = "Conta criada com sucesso! Redirecionando...";
    message.className = "login-message success";

    setTimeout(() => {
      redirectByRole(data.user.role);
    }, 800);
  } catch (error) {
    message.textContent = error.message;
    message.className = "login-message error";
  }
});

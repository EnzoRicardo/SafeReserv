const form = document.getElementById("registerForm");
const message = document.getElementById("registerMessage");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    message.textContent = "As senhas não coincidem.";
    message.className = "login-message error";
    return;
  }

  message.textContent = "Conta criada (simulação). Integração com backend em breve.";
  message.className = "login-message success";
});
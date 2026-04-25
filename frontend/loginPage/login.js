const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  loginMessage.textContent = "Login enviado. Integração com backend será conectada depois.";
  loginMessage.className = "login-message success";
});
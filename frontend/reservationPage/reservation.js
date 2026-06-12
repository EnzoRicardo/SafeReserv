const reservationForm = document.getElementById("reservationForm");

const formMessage = document.getElementById("formMessage");

const occupiedList = document.getElementById("occupiedList");

const roomSelect = document.getElementById("room");



function renderOccupiedTimes() {

  occupiedList.innerHTML = occupiedTimes.map(item => `

    <article class="occupied-item">

      <strong>${item.room}</strong>



      <span>

        <i class="fa-solid fa-calendar"></i>

        ${item.date}

      </span>



      <span>

        <i class="fa-solid fa-clock"></i>

        ${item.time}

      </span>



      <span>

        <i class="fa-solid fa-lock"></i>

        ${item.user}

      </span>

    </article>

  `).join("");

}



async function loadRooms() {
  try {
    const response = await fetch(`${API_BASE}/salas/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar as salas.");
    }

    const rooms = await response.json();

    const session = getSession();

    const filteredRooms = rooms.filter(room => {
      if (
        room.room_type === "teacher" &&
        session?.user?.role === "student"
      ) {
        return false;
      }

      return true;
    });

    roomSelect.innerHTML = `
      <option value="">Selecione uma sala</option>
      ${filteredRooms
        .map(
          room => `
            <option value="${room.id}">
              ${room.name}
            </option>
          `
        )
        .join("")}
    `;
  } catch (error) {
    console.error(error);

    formMessage.textContent =
      "Erro ao carregar salas. Verifique se há salas cadastradas.";

    formMessage.classList.add("error");
  }
}

async function loadOccupiedReservations() {
  try {
    const response = await fetch(`${API_BASE}/reservas/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar reservas.");
    }

    const reservations = await response.json();

    if (!reservations.length) {
      occupiedList.innerHTML =
        "<p>Nenhuma reserva encontrada.</p>";
      return;
    }

    occupiedList.innerHTML = reservations
      .map(
        item => `
          <article class="occupied-item">

            <strong>${item.room_name}</strong>

            <span>
              <i class="fa-solid fa-calendar"></i>
              ${item.reservation_date}
            </span>

            <span>
              <i class="fa-solid fa-clock"></i>
              ${item.start_time.slice(0, 5)}
              -
              ${item.end_time.slice(0, 5)}
            </span>

            <span>
              <i class="fa-solid fa-lock"></i>
              Reserva já existente
            </span>

          </article>
        `
      )
      .join("");
  } catch (error) {
    console.error(error);

    occupiedList.innerHTML =
      "<p>Erro ao carregar horários ocupados.</p>";
  }
}



function timeToMinutes(time) {

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;

}



reservationForm.addEventListener("submit", async (event) => {

  event.preventDefault();



  const session = getSession();

  if (!session?.user) {

    window.location.href = "../loginPage/login.html";

    return;

  }



  const room = document.getElementById("room").value;

  const date = document.getElementById("date").value;

  const startTime = document.getElementById("startTime").value;

  const endTime = document.getElementById("endTime").value;

  const participantsCount = document.getElementById("participants").value;



  formMessage.className = "form-message";

  formMessage.textContent = "";



  if (!room || !date || !startTime || !endTime) {

    formMessage.textContent = "Preencha todos os campos obrigatórios.";

    formMessage.classList.add("error");

    return;

  }



  const start = timeToMinutes(startTime);

  const end = timeToMinutes(endTime);



  if (end <= start) {

    formMessage.textContent = "O horário final deve ser maior que o horário inicial.";

    formMessage.classList.add("error");

    return;

  }



  const dadosDaReserva = {

    user: session.user.id,

    room: parseInt(room, 10),

    reservation_date: date,

    start_time: startTime + ":00",

    end_time: endTime + ":00",

    participants_count: parseInt(participantsCount, 10),

  };



  try {

    const CHAVE_SECRETA = CryptoJS.enc.Utf8.parse("a9F3kL8zQ2vX7mNpR4tYw6CjD1sH5uB0");

    const jsonString = JSON.stringify(dadosDaReserva);



    const encrypted = CryptoJS.AES.encrypt(jsonString, CHAVE_SECRETA, {

      mode: CryptoJS.mode.ECB,

      padding: CryptoJS.pad.Pkcs7

    });



    const payloadCriptografado = encrypted.toString();



    formMessage.textContent = "Criptografando e enviando para o servidor...";

    formMessage.classList.add("success");



    const resposta = await fetch(`${API_BASE}/reservas/`, {

      method: "POST",

      headers: getAuthHeaders({

        "Content-Type": "application/json",

      }),

      body: JSON.stringify({

        payload_criptografado: payloadCriptografado,

      }),

    });



    const retornoApi = await resposta.json();



    if (resposta.status === 201) {

      formMessage.textContent = "✅ Sucesso! Reserva descriptografada e salva no banco.";

      reservationForm.reset();

    } else {

      const detalhes = retornoApi.erro || retornoApi.detail || JSON.stringify(retornoApi);

      throw new Error(detalhes);

    }



  } catch (erro) {

    console.error(erro);

    formMessage.textContent = erro.message || "❌ Falha na comunicação ou na descriptografia.";

    formMessage.classList.remove("success");

    formMessage.classList.add("error");

  }

});



loadRooms();
loadOccupiedReservations();



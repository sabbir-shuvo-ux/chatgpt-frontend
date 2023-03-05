import bot from "./assets/bot.svg";
import user from "./assets/user.svg";
const APIKEY = import.meta.env.VITE_OPEN_AI_API_KEY;

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(el) {
  el.textContent = "";

  loadInterval = setInterval(() => {
    el.textContent += ".";

    if (el.textContent === "....") {
      el.textContent = "";
    }
  }, 300);
}

function typeText(el, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      el.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestmp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);

  return `id-${timestmp}-${hexaDecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
            <div class="wrapper ${isAi && "ai"}">
                <div class="chat">
                    <div class="profile">
                        <img src="${isAi ? bot : user}" 
                            alt="${isAi ? "bot" : "user"}"
                        />
                    </div>
                    <div class="message" id=${uniqueId}>${value}</div>
                </div>
            </div>
        `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatStrip
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  // bot's chatStrip
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch data from api
  const response = await fetch(
    "https://chat-gpt-api-by-shuvo.onrender.com/api",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APIKEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: data.get("prompt"),
        temperature: 0,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
      }),
    }
  );

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

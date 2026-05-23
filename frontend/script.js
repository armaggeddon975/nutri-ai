const chatBox =
document.getElementById("chat-box");

const userInput =
document.getElementById("user-input");

const sendBtn =
document.getElementById("send-btn");

window.onload = () => {

  const saved =
  localStorage.getItem("nutriChat");

  if(saved){

    chatBox.innerHTML = saved;

  }

};

function saveMessages(){

  localStorage.setItem(
    "nutriChat",
    chatBox.innerHTML
  );

}

function addMessage(text, sender){

  const message =
  document.createElement("div");

  message.classList.add("message");
  message.classList.add(sender);

  message.innerHTML = text;

  chatBox.appendChild(message);

  chatBox.scrollTop =
  chatBox.scrollHeight;

  saveMessages();

}

async function sendMessage(){

  const text =
  userInput.value.trim();

  if(text === "") return;

  addMessage(text, "user");

  userInput.value = "";

  const loading =
  document.createElement("div");

  loading.classList.add("message");
  loading.classList.add("bot");

  loading.innerHTML =
  "NutriAI está pensando...";

  chatBox.appendChild(loading);

  chatBox.scrollTop =
  chatBox.scrollHeight;

  try{

    const response =
    await fetch("https://nutriai-backend-tnht.onrender.com/chat",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        message:text
      })

    });

    const data =
    await response.json();

    loading.remove();

    addMessage(data.reply, "bot");

  }catch(error){

    loading.remove();

    addMessage(
      "Erro ao conectar com o servidor.",
      "bot"
    );

    console.error(error);
  }

}

sendBtn.addEventListener(
  "click",
  sendMessage
);

userInput.addEventListener(
  "keypress",
  (e)=>{

    if(e.key === "Enter"){
      sendMessage();
    }

  }
);
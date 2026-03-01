import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { 
  getFirestore, 
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

/* ===== CONFIG FIREBASE ===== */
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "convite-noah.firebaseapp.com",
  projectId: "convite-noah",
  storageBucket: "convite-noah.firebasestorage.app",
  messagingSenderId: "829535421891",
  appId: "1:829535421891:web:57463ce4d5c35824e82976"
};
/* ============================ */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let slides;
let currentSlide = 0;

/* ============================= */
/*        INICIALIZAÇÃO          */
/* ============================= */

document.addEventListener("DOMContentLoaded", async function(){

  slides = document.querySelectorAll(".slide");

  // 🔐 ADMIN sempre entra
  if(window.location.hash === "#admin"){
    await openAdmin();
    return;
  }

  const resposta = localStorage.getItem("respostaEnviada");

  // 🔓 Se respondeu que VAI, abre direto no endereço
  if(resposta === "vai"){
    showSlide(3);
    return;
  }

  // 🔒 Se respondeu que NÃO vai, bloqueia
  if(resposta === "nao"){
    document.body.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Poppins;text-align:center;">
        <div>
          <h2>Resposta já enviada ✅</h2>
          <p>Obrigado por avisar!</p>
        </div>
      </div>
    `;
    return;
  }

  showSlide(0);
});

/* ============================= */
/*           SLIDES              */
/* ============================= */

function showSlide(index){
  slides.forEach(slide => slide.classList.remove("active"));
  slides[index].classList.add("active");
  currentSlide = index;
}

function nextSlide(){
  if(currentSlide < slides.length - 1){
    showSlide(currentSlide + 1);
  }
}

function restartSlides(){
  showSlide(0);
}

window.nextSlide = nextSlide;
window.restartSlides = restartSlides;

/* ============================= */
/*        CONFIRMAR PRESENÇA     */
/* ============================= */

async function confirmPresence(isComing){

  let name = document.getElementById("guestName").value.trim();

  if(!name){
    alert("Digite seu nome 😊");
    return;
  }

  await addDoc(collection(db,"confirmacoes"),{
    nome: name,
    status: isComing ? "Vai comparecer" : "Não vai comparecer",
    data: new Date().toLocaleString()
  });

  if(isComing){

    // 🔓 Libera para entrar novamente
    localStorage.setItem("respostaEnviada", "vai");

    alert("🎉 Presença confirmada!");
    showSlide(3);

  } else {

    // 🔒 Bloqueia se não vai
    localStorage.setItem("respostaEnviada", "nao");

    document.body.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Poppins;text-align:center;">
        <div>
          <h2>Resposta enviada 😊</h2>
          <p>Obrigado por avisar!</p>
        </div>
      </div>
    `;
  }
}

window.confirmPresence = confirmPresence;

/* ============================= */
/*          PAINEL ADMIN         */
/* ============================= */

async function loadAdminList(){
  const querySnapshot = await getDocs(collection(db,"confirmacoes"));
  let html="";

  querySnapshot.forEach((docItem)=>{
    let p = docItem.data();
    html += `<p><strong>${p.nome}</strong> - ${p.status} - ${p.data}</p>`;
  });

  document.getElementById("adminList").innerHTML =
    html || "Nenhuma confirmação ainda.";
}

async function clearList(){

  const confirmar = confirm("Tem certeza que deseja apagar TODAS as confirmações?");
  if(!confirmar) return;

  const querySnapshot = await getDocs(collection(db,"confirmacoes"));
  const promises = [];

  querySnapshot.forEach((docItem)=>{
    promises.push(deleteDoc(doc(db,"confirmacoes", docItem.id)));
  });

  await Promise.all(promises);

  alert("Todas confirmações foram apagadas!");
  loadAdminList();
}

async function openAdmin(){

  let senha = prompt("Digite a senha do administrador:");

  if(senha==="noah2026"){
    document.querySelector(".container").style.display="none";
    document.getElementById("adminPanel").style.display="block";
    await loadAdminList();
  }else{
    alert("Senha incorreta!");
  }
}

window.openAdmin = openAdmin;
window.clearList = clearList;

/* ============================= */
/*        ENDEREÇO FUNÇÕES       */
/* ============================= */

function copyAddress(){

  const address = document.getElementById("addressText").innerText;

  navigator.clipboard.writeText(address)
    .then(() => {
      alert("Endereço copiado! 📋");
    })
    .catch(() => {
      alert("Não foi possível copiar automaticamente.");
    });
}

function openMaps(){
  // URL direta do Google Maps para Chácara Da Felicidade
  const url = "https://www.google.com/maps/place/Chacar%C3%A1+Da+Felicidade/@-23.1297238,-46.7346928,17z/data=!4m15!1m8!3m7!1s0x94cedbce9fad8649:0x9899d892ddbe879f!2sR.+S%C3%A3o+Sebasti%C3%A3o,+986+-+Aglomera%C3%A7%C3%A3o+Urbana+de+Jundia%C3%AD,+Jarinu+-+SP,+13240-000!3b1!8m2!3d-23.1297238!4d-46.7346928!16s%2Fg%2F11vql7qj5l!3m5!1s0x94cedb007ddabb03:0x27c11288b800df99!8m2!3d-23.1301795!4d-46.7345624!16s%2Fg%2F11y955xxsh?entry=ttu&g_ep=EgoyMDI2MDIyNS4wIKXMDSoASAFQAw%3D%3D";

  window.open(url, "_blank");
}

window.copyAddress = copyAddress;
window.openMaps = openMaps;

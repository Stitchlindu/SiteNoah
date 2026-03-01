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

document.addEventListener("DOMContentLoaded", async function(){

  slides = document.querySelectorAll(".slide");

  // 🔐 PRIMEIRO verifica se é admin
  if(window.location.hash === "#admin"){
    await openAdmin();
    return;
  }

  // 🔒 DEPOIS verifica se já respondeu
  const resposta = localStorage.getItem("respostaEnviada");

  if(resposta){
    document.body.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Poppins;text-align:center;">
        <div>
          <h2>Resposta já enviada ✅</h2>
          <p>Obrigado pela confirmação!</p>
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

  localStorage.setItem("respostaEnviada", "true");

  if(isComing){
    alert("🎉 Presença confirmada!");
    showSlide(3);
  } else {
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

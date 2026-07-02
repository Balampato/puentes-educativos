// ===== IMPORTS DE FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ===== CONFIGURACIÓN DE FIREBASE (reemplaza con la tuya) =====
const firebaseConfig = {
  apiKey: "AIzaSyAIxUOpEjRwtxMHPicFOMqscxqb-nWYEYA",
  authDomain: "conexion-vital-cdb49.firebaseapp.com",
  projectId: "conexion-vital-cdb49",
  storageBucket: "conexion-vital-cdb49.firebasestorage.app",
  messagingSenderId: "1067275843636",
  appId: "1:1067275843636:web:3dd0074322cd11d6df7261",
  measurementId: "G-F9X355WRZW"
};

// ===== INICIALIZACIÓN =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Variables globales de la sesión actual
let currentUser = null;  // objeto user de Firebase

// ===== ELEMENTOS DEL DOM =====
const pages = {
  home: document.getElementById('page-home'),
  login: document.getElementById('page-login'),
  register: document.getElementById('page-register'),
  dashboard: document.getElementById('page-dashboard'),
  report: document.getElementById('page-report'),
};

const btnGoLogin = document.getElementById('btnGoLogin');
const btnGoRegister = document.getElementById('btnGoRegister');
const linkGoRegister = document.getElementById('linkGoRegister');
const linkGoLogin = document.getElementById('linkGoLogin');
const btnBackHome1 = document.getElementById('btnBackHome1');
const btnBackHome2 = document.getElementById('btnBackHome2');
const btnLoginSubmit = document.getElementById('btnLoginSubmit');
const btnRegisterSubmit = document.getElementById('btnRegisterSubmit');
const btnLogout = document.getElementById('btnLogout');
const btnNewReport = document.getElementById('btnNewReport');
const btnBackDashboard = document.getElementById('btnBackDashboard');
const btnEnviarReporte = document.getElementById('btnEnviarReporte');
const btnAlertaRapida = document.getElementById('btnAlertaRapida');
const btnGoogleLogin = document.getElementById('btnGoogleLogin');
const displayUsername = document.getElementById('displayUsername');

const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');
const regUser = document.getElementById('regUser');
const regEmail = document.getElementById('regEmail');
const regPass = document.getElementById('regPass');
const regPassConfirm = document.getElementById('regPassConfirm');
const tipoIncidente = document.getElementById('tipoIncidente');
const descripcionReporte = document.getElementById('descripcionReporte');
const lugarReporte = document.getElementById('lugarReporte');
const toast = document.getElementById('toast');

// ===== FUNCIONES DE NAVEGACIÓN Y UI =====
function showPage(pageName) {
  Object.values(pages).forEach(p => p.classList.remove('active'));
  if (pages[pageName]) {
    pages[pageName].classList.add('active');
  }
  document.getElementById('appContent').scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message, isSuccess = true) {
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.background = isSuccess ? '#2ecc71' : '#e74c3c';
  toast.style.animation = 'none';
  toast.offsetHeight; // reflow
  toast.style.animation = 'slideDown 0.4s ease, fadeOut 0.4s 2.5s forwards';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== EVENTOS DE NAVEGACIÓN =====
btnGoLogin?.addEventListener('click', () => showPage('login'));
btnGoRegister?.addEventListener('click', () => showPage('register'));
linkGoRegister?.addEventListener('click', e => { e.preventDefault(); showPage('register'); });
linkGoLogin?.addEventListener('click', e => { e.preventDefault(); showPage('login'); });
btnBackHome1?.addEventListener('click', () => showPage('home'));
btnBackHome2?.addEventListener('click', () => showPage('home'));
btnNewReport?.addEventListener('click', () => showPage('report'));
btnBackDashboard?.addEventListener('click', () => showPage('dashboard'));

// ===== AUTENTICACIÓN CON CORREO Y CONTRASEÑA (REAL) =====
btnLoginSubmit?.addEventListener('click', async () => {
  const email = loginUser.value.trim();
  const pass = loginPass.value.trim();
  if (!email || !pass) {
    showToast('Completa todos los campos', false);
    return;
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    currentUser = userCredential.user;
    showPage('foro');
    showToast('Inicio de sesión exitoso 🛡️');
    loginUser.value = '';
    loginPass.value = '';
  } catch (error) {
    console.error(error);
    showToast('Credenciales inválidas. Intenta de nuevo.', false);
  }
});

btnRegisterSubmit?.addEventListener('click', async () => {
  const username = regUser.value.trim();
  const email = regEmail.value.trim();
  const pass = regPass.value.trim();
  const passConfirm = regPassConfirm.value.trim();

  if (!username || !email || !pass || !passConfirm) {
    showToast('Todos los campos son obligatorios', false);
    return;
  }
  if (!validarEmail(email)) {
    showToast('Ingresa un correo electrónico válido', false);
    return;
  }
  if (pass.length < 8) {
    showToast('La contraseña debe tener al menos 8 caracteres', false);
    return;
  }
  if (pass !== passConfirm) {
    showToast('Las contraseñas no coinciden', false);
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    currentUser = userCredential.user;
    showPage('dashboard');
    showToast('¡Cuenta creada con éxito! Bienvenido/a 🛡️');
    regUser.value = '';
    regEmail.value = '';
    regPass.value = '';
    regPassConfirm.value = '';
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/email-already-in-use') {
      showToast('Este correo ya está registrado.', false);
    } else {
      showToast('Error al crear la cuenta.', false);
    }
  }
});

// ===== AUTENTICACIÓN CON GOOGLE =====
btnGoogleLogin?.addEventListener('click', async () => {
  try {
    const currentAuthUser = auth.currentUser;
    if (currentAuthUser && currentAuthUser.isAnonymous) {
      // Vincular cuenta anónima existente con Google
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      await linkWithCredential(currentAuthUser, credential);
      showToast('¡Cuenta anónima vinculada a Google!', true);
    } else {
      // Iniciar sesión normal con Google
      await signInWithPopup(auth, googleProvider);
      showToast('Inicio de sesión con Google exitoso', true);
    }
    currentUser = auth.currentUser;
    showPage('dashboard');
  } catch (error) {
    console.error(error);
    showToast('Error al iniciar sesión con Google.', false);
  }
});

// ===== CIERRE DE SESIÓN =====
btnLogout?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    currentUser = null;
    showPage('home');
    showToast('Sesión cerrada correctamente');
  } catch (error) {
    console.error(error);
  }
});

// ===== ENVÍO DE REPORTE A FIRESTORE =====
btnEnviarReporte?.addEventListener('click', async () => {
  const tipo = tipoIncidente.value;
  const desc = descripcionReporte.value.trim();
  const lugar = lugarReporte.value.trim();

  if (!tipo || !desc) {
    showToast('Completa los campos obligatorios', false);
    return;
  }

  try {
    const user = auth.currentUser;
    const nuevoReporte = {
      tipo_incidente: tipo,
      descripcion: desc,
      lugar: lugar || null,
      anonimo: !user,
      estado: "pendiente",
      fecha: serverTimestamp(),
      uid: user ? user.uid : null
    };

    await addDoc(collection(db, "reportes"), nuevoReporte);
    showToast('✅ Reporte enviado correctamente', true);
    tipoIncidente.value = '';
    descripcionReporte.value = '';
    lugarReporte.value = '';
  } catch (error) {
    console.error("Error al guardar:", error);
    showToast('❌ Error al enviar el reporte.', false);
  }
});

// ===== ALERTA RÁPIDA (simulada, luego puedes guardar en Firestore) =====
btnAlertaRapida?.addEventListener('click', () => {
  if (confirm('⚠️ ¿Estás seguro de enviar una ALERTA URGENTE?\n\nEsto notificará inmediatamente al equipo de orientación escolar.\nPuedes mantener tu anonimato.')) {
    showToast('🚨 Alerta urgente enviada. El equipo de apoyo ha sido notificado.', true);
    // Aquí podrías añadir un addDoc a una colección "alertas" similar a los reportes
  }
});

// ===== OBSERVADOR DE ESTADO DE AUTENTICACIÓN =====
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const btnGoogle = document.getElementById('btnGoogleLogin');
  const userDisplay = document.getElementById('displayUsername');

  if (user) {
    // Usuario autenticado
    if (btnGoogle) btnGoogle.style.display = 'none';
    if (userDisplay) {
      userDisplay.textContent = user.displayName || user.email || 'Usuario';
    }
    // Si estaba en login/register, mover al dashboard
    if (pages.login.classList.contains('active') || pages.register.classList.contains('active')) {
      showPage('dashboard');
    }
  } else {
    // No autenticado
    if (btnGoogle) btnGoogle.style.display = 'flex';
    if (userDisplay) userDisplay.textContent = 'Invitado';
  }
});

// ===== INICIO: Mostrar home y autenticación anónima opcional =====
showPage('home');
console.log('🛡️ Conexión Vital - Firebase integrado correctamente.');

// (Opcional) Autenticación anónima automática al cargar
// Descomenta si quieres que todos los visitantes tengan un uid anónimo desde el principio
/*
(async () => {
  try {
    await signInAnonymously(auth);
  } catch (e) {
    console.warn('No se pudo iniciar sesión anónima', e);
  }
})();
*/

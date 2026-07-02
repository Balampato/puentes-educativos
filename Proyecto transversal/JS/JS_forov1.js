// ===== IMPORTS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    linkWithCredential,
    onAuthStateChanged,
    signOut,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ===== CONFIGURACIÓN FIREBASE (REEMPLAZA CON LA TUYA) =====
const firebaseConfig = {
  apiKey: "AIzaSyAIxUOpEjRwtxMHPicFOMqscxqb-nWYEYA",
  authDomain: "conexion-vital-cdb49.firebaseapp.com",
  projectId: "conexion-vital-cdb49",
  storageBucket: "conexion-vital-cdb49.firebasestorage.app",
  messagingSenderId: "1067275843636",
  appId: "1:1067275843636:web:3dd0074322cd11d6df7261",
  measurementId: "G-F9X355WRZW"
};
// Referencias a los botones de navegación
const navItems = document.querySelectorAll('.nav-item');
const toast = document.getElementById('toast');

// Función para mostrar toast
function showToast(message) {
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.animation = 'none';
    toast.offsetHeight;
    toast.style.animation = 'slideDown 0.4s ease, fadeOut 0.4s 2.5s forwards';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// Eventos para cada botón (simulan funcionalidad futura)
const acciones = {
    navInicio: 'Estás en Inicio',
    navAmigos: 'Sección de Amigos en construcción',
    navNotificaciones: 'No tienes notificaciones nuevas',
    navPerfil: 'Perfil en desarrollo'
};

navItems.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover active de todos
        navItems.forEach(b => b.classList.remove('active'));
        // Activar el clickeado
        btn.classList.add('active');
        // Mostrar toast con mensaje
        const mensaje = acciones[btn.id] || 'Funcionalidad próximamente';
        showToast('🚧 ' + mensaje);
    });
});

// Estilos para las animaciones del toast
const style = document.createElement('style');
style.textContent = `
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-80px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes fadeOut {
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `;
document.head.appendChild(style);

const formularioTema = document.getElementById('formularioTema');
const foroTitulo = document.getElementById('foroTitulo');
const foroContenido = document.getElementById('foroContenido');
const btnPublicarTema = document.getElementById('btnPublicarTema');
const listaTemas = document.getElementById('listaTemas');
const toast = document.getElementById('toast');

// Iniciar sesión anónima al cargar
(async () => {
  try {
    await signInAnonymously(auth);
    console.log("Usuario anónimo listo");
  } catch (e) {
    console.warn("No se pudo iniciar sesión anónima", e);
  }
})();

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Mostrar formulario de nuevo tema
    if (formularioTema) formularioTema.style.display = 'block';
  } else {
    if (formularioTema) formularioTema.style.display = 'none';
  }
  // Recargar temas por si acaso
  cargarTemas();
});

async function cargarTemas() {
  const q = query(collection(db, "foro"), orderBy("fecha", "desc"));
  try {
    const snapshot = await getDocs(q);
    listaTemas.innerHTML = '';
    if (snapshot.empty) {
      listaTemas.innerHTML = '<p style="text-align:center; color:#7f8c9b;">¡Nadie ha escrito aún! Sé el primero en compartir 🌟</p>';
      return;
    }
    snapshot.forEach(doc => {
      const data = doc.data();
      const fecha = data.fecha ? data.fecha.toDate().toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin fecha';
      const tarjeta = document.createElement('div');
      tarjeta.className = 'dev-card';
      tarjeta.style.cssText = 'text-align:left; margin-bottom:12px;';
      tarjeta.innerHTML = `
        <h4 style="margin-bottom:6px;">${data.titulo}</h4>
        <p style="font-size:0.9rem; color:#5a6f82;">${data.contenido}</p>
        <small style="color:#9aa9b7;">Por ${data.autor || 'Anónimo'} · ${fecha}</small>
      `;
      listaTemas.appendChild(tarjeta);
    });
  } catch (error) {
    console.error("Error al cargar temas:", error);
    listaTemas.innerHTML = '<p style="text-align:center; color:red;">Error al cargar temas. Intenta recargar.</p>';
  }
}

btnPublicarTema.addEventListener('click', async () => {
  const titulo = foroTitulo.value.trim();
  const contenido = foroContenido.value.trim();

  if (!titulo || !contenido) {
    mostrarToast('Por favor completa todos los campos', false);
    return;
  }

  try {
    const user = auth.currentUser;
    await addDoc(collection(db, "foro"), {
      titulo,
      contenido,
      autor: user ? (user.displayName || 'Anónimo') : 'Anónimo',
      uid: user ? user.uid : null,
      fecha: serverTimestamp(),
      respuestas: []
    });
    mostrarToast('¡Tema publicado! 🎉');
    foroTitulo.value = '';
    foroContenido.value = '';
    cargarTemas(); // refrescar lista
  } catch (error) {
    console.error(error);
    mostrarToast('Ups, no se pudo publicar. Intenta otra vez.', false);
  }
});

function mostrarToast(mensaje, esExito = true) {
  toast.textContent = mensaje;
  toast.style.display = 'block';
  toast.style.background = esExito ? '#7bc8a4' : '#f8b4c8';
  // animación ya la tienes en tu CSS anterior
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
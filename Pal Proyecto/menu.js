// 1. Lógica para el botón "Cerrar Sesión"

// Obtiene el botón por su ID.
const logoutButton = document.getElementById('logoutButton');

// Agrega un evento click al botón.
logoutButton.addEventListener('click', function() {
    // Confirma si el usuario realmente quiere cerrar la sesión (opcional).
    const confirmation = confirm("¿Estás seguro que deseas cerrar la sesión?");
    
    if (confirmation) {
        // ***************************************************************
        // COMANDO PARA REGRESAR AL INDEX DEL INICIO DE SESIÓN
        // Asumiendo que tu página de inicio de sesión se llama 'index.html'
        window.location.href = "../index/index.html"; 
        // ***************************************************************
    }
});


// 2. Lógica para los botones del menú (Figuras)

// Selecciona todos los botones con la clase 'menu-item'.
const menuItems = document.querySelectorAll('.menu-item');

// Itera sobre cada botón y agrega un evento click.
menuItems.forEach(item => {
    item.addEventListener('click', function() {
        // Obtiene el nombre de la figura del atributo 'data-figure'.
        const figure = item.getAttribute('data-figure');
        
        // Aquí puedes agregar la lógica para llevar al usuario a la página de cálculo de la figura
        // Por ahora, solo mostraremos una alerta.
        // EJEMPLO: Si tuvieras una página para el círculo llamada 'circulo.html', harías:
        // if (figure === 'circulo') {
        //    window.location.href = 'circulo.html';
        // }
    });
});
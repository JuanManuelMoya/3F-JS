document.addEventListener('DOMContentLoaded', () => {
    // --- 0. CONFIGURACIÓN E INICIALIZACIÓN ---
    const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
    const POKEDEX_SIZE = 1025; // Número máximo de Pokémon (aprox.)

    // Referencias a elementos del DOM
    const body = document.body;
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const apiContent = document.getElementById('apiContent'); // Contenedor del Pokémon
    const cargarDatosBtn = document.getElementById('cargarDatos');
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    
    // Elemento clave para el desplegable (Curiosidades)
    const desplegableTipos = document.getElementById('desplegable-tipos'); 

    // Clase inicial para estilos
    body.classList.add('videojuegos'); 
    
    // --- LÓGICA DE NAVEGACIÓN Y UI ---

    // Manejo del menú de navegación (para móviles)
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Cierra el menú móvil al hacer clic en un enlace (útil en SPAs)
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            });
        });
    }

    // --- FUNCIONES DE ASISTENCIA Y UI (VALIDACIÓN) ---

    /**
     * Muestra un mensaje de error de validación bajo un campo.
     * @param {string} elementId ID del elemento de error (div.error)
     * @param {string} message Mensaje de error a mostrar.
     */
    function showValidationError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Oculta el mensaje de error para un campo de formulario.
     * @param {string} elementId ID del elemento de error (div.error)
     */
    function hideValidationError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /*
     * Actualiza el contenido inicial del DOM para reflejar la temática Pokémon.
     */
    function updateInitialContent() {
        // Ejemplo de actualización de textos de la página al estilo Pokémon
        const logo = document.querySelector('.logo');
        if (logo) logo.textContent = 'Poké World JS';
        const apiLink = document.querySelector('a[href="#api"]');
        if (apiLink) apiLink.textContent = 'Pokédex API';
        
        const apiH2 = document.querySelector('#api h2');
        if (apiH2) apiH2.textContent = 'Pokédex Dinámica';
        const apiP = document.querySelector('#api p');
        if (apiP) apiP.textContent = 'Pulsa el botón para cargar un Pokémon aleatorio y ver su información.';
        if (document.getElementById('cargarDatos')) document.getElementById('cargarDatos').textContent = 'Cargar Nuevo Pokémon';
        
        const formH2 = document.querySelector('#formulario h2');
        if (formH2) formH2.textContent = 'Conviértete en Entrenador';
        const formP = document.querySelector('#formulario p');
        if (formP) formP.textContent = 'Completa el formulario para obtener tu licencia oficial de la Liga.';
    }

    // --- LÓGICA DE LA POKÉAPI ---

    /*
     * Carga y muestra los datos de un Pokémon aleatorio.
     */
    async function loadRandomPokemon() {
        const randomId = Math.floor(Math.random() * POKEDEX_SIZE) + 1;
        const url = `${API_URL}${randomId}`;
        
        // Mostrar estado de carga
        apiContent.innerHTML = '<div class="api-item"><h3>Cargando Pokémon...</h3><p>Obteniendo datos de la PokéAPI.</p></div>';
        cargarDatosBtn.disabled = true;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error al cargar: ${response.status}`);
            }
            const data = await response.json();
            
            displayPokemonData(data);

        } catch (error) {
            console.error('Error al cargar Pokémon:', error);
            apiContent.innerHTML = '<div class="api-item" style="background-color:#e74c3c; color:white;"><h3>Error de Conexión</h3><p>No se pudo cargar la PokéAPI. Intenta de nuevo.</p></div>';
        } finally {
            cargarDatosBtn.disabled = false;
        }
    }

    /**
     * Genera el HTML para mostrar los datos del Pokémon.
     * @param {object} pokemonData Objeto JSON del Pokémon.
     */
    function displayPokemonData(pokemonData) {
        // Limpiar el contenido anterior
        apiContent.innerHTML = '';

        const name = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
        const id = pokemonData.id.toString().padStart(3, '0');
        const types = pokemonData.types.map(t => t.type.name.toUpperCase()).join(' / ');
        
        // URL de placeholder garantizado para casos de error de imagen
        const reliablePlaceholder = 'https://placehold.co/300x220/E3350D/FFFFFF?text=IMAGEN+FALLIDA';
        
        // Lógica de imagen: preferir official-artwork, luego sprite frontal, si no, placeholder
        const imageUrl = pokemonData.sprites.other['official-artwork']?.front_default 
                        || pokemonData.sprites.front_default 
                        || reliablePlaceholder;

        // Crear contenedor principal
        const div = document.createElement('div');
        div.className = 'api-item'; 

        // Crear elemento de imagen
        const img = document.createElement('img');
        img.alt = name;
        img.width = 300;
        img.height = 220;
        img.style.objectFit = 'contain';
        img.style.backgroundColor = '#fff';

        // Manejador de errores para la imagen
        img.onerror = function() {
            console.error(`ERROR DE IMAGEN: Falló la carga de ${this.src}`);
            // Usar el placeholder garantizado si la imagen de la API falla
            this.src = reliablePlaceholder; 
            this.title = 'Error al cargar la imagen de la API.';
        };
        img.src = imageUrl;

        // ADJUNTAR LA IMAGEN AL DIV (CORRECCIÓN CLAVE)
        div.appendChild(img); 

        // Crear elementos de contenido
        const h3 = document.createElement('h3');
        h3.textContent = `#${id} - ${name}`;

        const pTypes = document.createElement('p');
        pTypes.innerHTML = `Tipo(s): <strong>${types}</strong>`;

        const pAlt = document.createElement('p');
        pAlt.textContent = `Altura: ${pokemonData.height / 10} m`;

        const pPeso = document.createElement('p');
        pPeso.textContent = `Peso: ${pokemonData.weight / 10} kg`;

        // Ensamblar el resto del contenido
        div.appendChild(h3);
        div.appendChild(pTypes);
        div.appendChild(pAlt);
        div.appendChild(pPeso);

        // Añadir la tarjeta completa al contenedor de la API
        apiContent.appendChild(div);
    }

    // --- LÓGICA DEL DESPLEGABLE DE CURIOSIDADES (ACORDEÓN) ---
    
    /**
     * Alterna el estado de apertura/cierre de la sección de curiosidades.
     */
    function toggleDesplegable() {
        // Alterna la clase 'opened' en el elemento que tiene el ID 'desplegable-tipos'
        const opened = desplegableTipos.classList.toggle('opened');
        
        // El elemento flecha debe actualizarse visualmente.
        const arrow = desplegableTipos.querySelector('.arrow');
        if (arrow) {
            if (opened) {
                arrow.textContent = '▲'; // Flecha arriba
            } else {
                arrow.textContent = '▼'; // Flecha abajo
            }
        }
    }
    
    // Asignar el evento click al contenedor del desplegable
    if (desplegableTipos) {
        desplegableTipos.addEventListener('click', toggleDesplegable);
    }

    // --- LÓGICA DE VALIDACIÓN DEL FORMULARIO --- 

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            let isValid = true;
            
            // Resetear mensajes de éxito/error
            successMessage.style.display = 'none';
            
            // VALIDACIÓN DE NOMBRE
            const nombreInput = document.getElementById('nombre');
            const nombre = nombreInput.value.trim();
            if (nombre.length < 3) {
                showValidationError('errorNombre', 'El nombre debe tener al menos 3 caracteres.');
                isValid = false;
            } else {
                hideValidationError('errorNombre');
            }

            // VALIDACIÓN DE EMAIL 
            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showValidationError('errorEmail', 'Por favor, introduce un correo electrónico válido.');
                isValid = false;
            } else {
                hideValidationError('errorEmail');
            }

            // VALIDACIÓN DE ASUNTO
            const asuntoInput = document.getElementById('asunto');
            const asunto = asuntoInput.value;
            if (asunto === "") {
                showValidationError('errorAsunto', 'Debes seleccionar un asunto.');
                isValid = false;
            } else {
                hideValidationError('errorAsunto');
            }
            
            // VALIDACIÓN DE MENSAJE
            const mensajeInput = document.getElementById('mensaje');
            const mensaje = mensajeInput.value.trim();
            if (mensaje.length < 10) {
                showValidationError('errorMensaje', 'El mensaje debe tener al menos 10 caracteres.');
                isValid = false;
            } else {
                hideValidationError('errorMensaje');
            }

            // MANEJO FINAL DEL ENVÍO 
            if (isValid) {
                // Simular envío de datos
                console.log('Formulario enviado con éxito:', {
                    nombre: nombre,
                    email: email,
                    asunto: asunto,
                    mensaje: mensaje
                });
                
                // Mostrar mensaje de éxito y limpiar el formulario
                successMessage.style.display = 'block';
                contactForm.reset();
                
                // Ocultar mensaje de éxito después de 5 segundos
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
                
            }
        });
    }
    
    // --- 6. INICIALIZACIÓN Y EVENTOS ---

    updateInitialContent();
    if (cargarDatosBtn) cargarDatosBtn.addEventListener('click', loadRandomPokemon);

    // Cargar el primer Pokémon al cargar la página
    loadRandomPokemon();

});
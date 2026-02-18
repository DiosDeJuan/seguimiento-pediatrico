/**
 * ========================================
 * Módulo Modal - Lógica Reusable
 * ========================================
 * Modal reusable para mensajes y validaciones
 */

let isModalOpen = false;

/**
 * Inicializa el módulo modal
 */
export function initModal() {
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    const closeBtn = document.getElementById('modalClose');
    const btnEntendido = document.getElementById('modalBtnEntendido');
    
    // Cerrar modal
    const cerrarModal = () => {
        if (overlay) overlay.classList.remove('active');
        if (container) container.classList.remove('active');
        isModalOpen = false;
    };
    
    // Click en overlay
    if (overlay) {
        overlay.addEventListener('click', cerrarModal);
    }
    
    // Click en botón cerrar
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarModal);
    }
    
    // Click en botón entendido
    if (btnEntendido) {
        btnEntendido.addEventListener('click', cerrarModal);
    }
    
    // ESC para cerrar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            cerrarModal();
        }
    });
}

/**
 * Muestra el modal con contenido personalizado
 * @param {string} titulo - Título del modal
 * @param {string} mensaje - Mensaje principal
 * @param {Array<string>} lista - Lista opcional de elementos
 */
export function mostrarModal(titulo, mensaje, lista = null) {
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    const tituloEl = document.getElementById('modalTitulo');
    const mensajeEl = document.getElementById('modalMensaje');
    const listaEl = document.getElementById('modalLista');
    
    // Establecer contenido
    if (tituloEl) tituloEl.textContent = titulo;
    if (mensajeEl) mensajeEl.textContent = mensaje;
    
    // Manejar lista
    if (listaEl) {
        if (lista && lista.length > 0) {
            listaEl.innerHTML = '';
            lista.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                listaEl.appendChild(li);
            });
            listaEl.classList.remove('hidden');
        } else {
            listaEl.classList.add('hidden');
        }
    }
    
    // Mostrar modal
    if (overlay) overlay.classList.add('active');
    if (container) container.classList.add('active');
    isModalOpen = true;
}

/**
 * Cierra el modal
 */
export function cerrarModal() {
    const overlay = document.getElementById('modalOverlay');
    const container = document.getElementById('modalContainer');
    
    if (overlay) overlay.classList.remove('active');
    if (container) container.classList.remove('active');
    isModalOpen = false;
}

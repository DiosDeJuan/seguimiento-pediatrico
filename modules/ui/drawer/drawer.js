/**
 * ========================================
 * Módulo Drawer - Lógica Panel Opciones
 * ========================================
 * Gestiona el drawer de opciones (abrir/cerrar)
 */

let isDrawerOpen = false;

/**
 * Inicializa el módulo drawer
 */
export function initDrawer(callbacks) {
    const overlay = document.getElementById('drawerOverlay');
    const panel = document.getElementById('drawerPanel');
    const closeBtn = document.getElementById('drawerClose');
    
    // Cerrar drawer
    const cerrarDrawer = () => {
        overlay.classList.remove('active');
        panel.classList.remove('active');
        isDrawerOpen = false;
    };
    
    // Click en overlay
    if (overlay) {
        overlay.addEventListener('click', cerrarDrawer);
    }
    
    // Click en botón cerrar
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarDrawer);
    }
    
    // ESC para cerrar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isDrawerOpen) {
            cerrarDrawer();
        }
    });
    
    // Configurar callbacks de botones
    if (callbacks) {
        const btnCargarBorrador = document.getElementById('btnCargarBorrador');
        const btnEliminarBorrador = document.getElementById('btnEliminarBorrador');
        const btnGuardarBorrador = document.getElementById('btnGuardarBorrador');
        const btnExportarPDF = document.getElementById('btnExportarPDF');
        
        if (btnCargarBorrador && callbacks.onCargarBorrador) {
            btnCargarBorrador.addEventListener('click', callbacks.onCargarBorrador);
        }
        
        if (btnEliminarBorrador && callbacks.onEliminarBorrador) {
            btnEliminarBorrador.addEventListener('click', callbacks.onEliminarBorrador);
        }
        
        if (btnGuardarBorrador && callbacks.onGuardarBorrador) {
            btnGuardarBorrador.addEventListener('click', callbacks.onGuardarBorrador);
        }
        
        if (btnExportarPDF && callbacks.onExportarPDF) {
            btnExportarPDF.addEventListener('click', callbacks.onExportarPDF);
        }
        
        // Cambio de tamaño de página
        const radiosPaperSize = document.querySelectorAll('input[name="paperSize"]');
        radiosPaperSize.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (callbacks.onCambiarTamaño) {
                    callbacks.onCambiarTamaño(e.target.value);
                }
            });
        });
    }
}

/**
 * Abre el drawer
 */
export function abrirDrawer() {
    const overlay = document.getElementById('drawerOverlay');
    const panel = document.getElementById('drawerPanel');
    
    if (overlay) overlay.classList.add('active');
    if (panel) panel.classList.add('active');
    isDrawerOpen = true;
}

/**
 * Cierra el drawer
 */
export function cerrarDrawer() {
    const overlay = document.getElementById('drawerOverlay');
    const panel = document.getElementById('drawerPanel');
    
    if (overlay) overlay.classList.remove('active');
    if (panel) panel.classList.remove('active');
    isDrawerOpen = false;
}

/**
 * Actualiza la lista de borradores en el select
 */
export function actualizarListaBorradores(borradores) {
    const select = document.getElementById('selectBorrador');
    if (!select) return;
    
    // Limpiar opciones actuales (excepto la primera)
    select.innerHTML = '<option value="">Seleccionar borrador...</option>';
    
    // Agregar borradores
    if (borradores && typeof borradores === 'object') {
        Object.entries(borradores).forEach(([id, borrador]) => {
            const option = document.createElement('option');
            option.value = id;
            
            // Crear texto descriptivo
            const nombre = borrador.nombre || borrador.paciente || 'Sin nombre';
            const fecha = borrador.timestamp ? new Date(borrador.timestamp).toLocaleString('es-MX') : '';
            option.textContent = `${nombre} ${fecha ? '- ' + fecha : ''}`;
            
            select.appendChild(option);
        });
    }
}

/**
 * Obtiene el ID del borrador seleccionado
 */
export function getBorradorSeleccionado() {
    const select = document.getElementById('selectBorrador');
    return select ? select.value : null;
}

/**
 * Obtiene el nombre del PDF
 */
export function getNombrePDF() {
    const input = document.getElementById('pdfNombre');
    return input ? input.value || 'seguimiento_pediatrico' : 'seguimiento_pediatrico';
}

/**
 * Obtiene el tamaño de página seleccionado
 */
export function getTamañoPagina() {
    const radio = document.querySelector('input[name="paperSize"]:checked');
    return radio ? radio.value : 'carta';
}

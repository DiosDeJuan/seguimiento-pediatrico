/**
 * ========================================
 * INDEX.JS - Orquestador Principal
 * ========================================
 * Responsabilidades:
 * 1. Cargar módulos vía fetch()
 * 2. Mantener estado global
 * 3. Sincronizar formulario → receta en tiempo real
 * 4. Validar campos críticos
 * 5. Manejar drawer y modal
 * 6. Guardar/cargar/borrar borradores
 * 7. Exportar PDF (html2canvas + jsPDF)
 */

// ========================================
// Estado Global
// ========================================

let estadoFormulario = {};
const STORAGE_KEY = 'borradores_pediatrico';

// ========================================
// Módulos
// ========================================

let FormularioModule;
let RecetaModule;
let DrawerModule;
let ModalModule;

// ========================================
// Inicialización
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Cargar módulos
        await cargarModulos();
        
        // Configurar botón toggle drawer
        const btnToggleDrawer = document.getElementById('btnToggleDrawer');
        if (btnToggleDrawer) {
            btnToggleDrawer.addEventListener('click', () => {
                DrawerModule.abrirDrawer();
            });
        }
        
        console.log('✅ Aplicación iniciada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar aplicación:', error);
    }
});

// ========================================
// Carga de Módulos
// ========================================

async function cargarModulos() {
    // Cargar módulo formulario
    await cargarModulo(
        'formulario',
        'modules/formulario/formulario.html',
        'modules/formulario/formulario.css',
        'modules/formulario/formulario.js',
        'panelFormulario'
    );
    
    // Cargar módulo receta
    await cargarModulo(
        'receta',
        'modules/receta/receta.html',
        'modules/receta/receta.css',
        'modules/receta/receta.js',
        'panelReceta'
    );
    
    // Cargar módulo drawer
    await cargarModulo(
        'drawer',
        'modules/ui/drawer/drawer.html',
        'modules/ui/drawer/drawer.css',
        'modules/ui/drawer/drawer.js',
        'drawerContainer'
    );
    
    // Cargar módulo modal
    await cargarModulo(
        'modal',
        'modules/ui/modal/modal.html',
        'modules/ui/modal/modal.css',
        'modules/ui/modal/modal.js',
        'modalContainer'
    );
    
    // Inicializar módulos
    await inicializarModulos();
}

async function cargarModulo(nombre, htmlPath, cssPath, jsPath, containerId) {
    try {
        // Cargar HTML
        const htmlResponse = await fetch(htmlPath);
        const htmlContent = await htmlResponse.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = htmlContent;
        }
        
        // Cargar CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
        
        console.log(`✅ Módulo ${nombre} cargado`);
    } catch (error) {
        console.error(`❌ Error cargando módulo ${nombre}:`, error);
    }
}

async function inicializarModulos() {
    // Importar módulos JavaScript
    FormularioModule = await import('./modules/formulario/formulario.js');
    RecetaModule = await import('./modules/receta/receta.js');
    DrawerModule = await import('./modules/ui/drawer/drawer.js');
    ModalModule = await import('./modules/ui/modal/modal.js');
    
    // Inicializar formulario
    FormularioModule.initFormulario((data) => {
        estadoFormulario = data;
        RecetaModule.actualizarReceta(data);
    });
    
    // Inicializar receta
    RecetaModule.initReceta();
    
    // Inicializar modal
    ModalModule.initModal();
    
    // Inicializar drawer con callbacks
    DrawerModule.initDrawer({
        onCargarBorrador: cargarBorrador,
        onEliminarBorrador: eliminarBorrador,
        onGuardarBorrador: guardarBorrador,
        onExportarPDF: exportarPDF,
        onCambiarTamaño: cambiarTamañoPagina
    });
    
    // Actualizar lista de borradores
    actualizarListaBorradores();
}

// ========================================
// Validación
// ========================================

function validarCamposCriticos() {
    const camposFaltantes = [];
    
    if (!estadoFormulario.paciente || estadoFormulario.paciente.trim() === '') {
        camposFaltantes.push('Nombre del Paciente');
    }
    
    if (!estadoFormulario.fechaConsulta || estadoFormulario.fechaConsulta.trim() === '') {
        camposFaltantes.push('Fecha de Consulta');
    }
    
    if (!estadoFormulario.peso || estadoFormulario.peso.trim() === '') {
        camposFaltantes.push('Peso');
    }
    
    if (!estadoFormulario.talla || estadoFormulario.talla.trim() === '') {
        camposFaltantes.push('Talla');
    }
    
    if (!estadoFormulario.fc || estadoFormulario.fc.trim() === '') {
        camposFaltantes.push('FC (Frecuencia Cardíaca)');
    }
    
    if (!estadoFormulario.fr || estadoFormulario.fr.trim() === '') {
        camposFaltantes.push('FR (Frecuencia Respiratoria)');
    }
    
    return camposFaltantes;
}

// ========================================
// Gestión de Borradores
// ========================================

function guardarBorrador() {
    // Validar campos críticos
    const camposFaltantes = validarCamposCriticos();
    
    if (camposFaltantes.length > 0) {
        ModalModule.mostrarModal(
            'No se puede guardar todavía',
            'Faltan los siguientes campos obligatorios:',
            camposFaltantes
        );
        return;
    }
    
    // Solicitar nombre del borrador
    const nombreBorrador = prompt('Nombre del borrador:', estadoFormulario.paciente || 'Sin nombre');
    if (!nombreBorrador) return;
    
    // Obtener borradores existentes
    let borradores = {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            borradores = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error leyendo borradores:', e);
    }
    
    // Crear nuevo borrador
    const id = Date.now().toString();
    const borrador = {
        ...estadoFormulario,
        nombre: nombreBorrador,
        paperSize: DrawerModule.getTamañoPagina(),
        timestamp: new Date().toISOString()
    };
    
    borradores[id] = borrador;
    
    // Guardar en localStorage
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(borradores));
        ModalModule.mostrarModal(
            '✅ Borrador guardado',
            `El borrador "${nombreBorrador}" se guardó correctamente.`
        );
        actualizarListaBorradores();
    } catch (e) {
        console.error('Error guardando borrador:', e);
        ModalModule.mostrarModal(
            '❌ Error',
            'No se pudo guardar el borrador. Verifica el espacio disponible.'
        );
    }
}

function cargarBorrador() {
    const borradorId = DrawerModule.getBorradorSeleccionado();
    
    if (!borradorId) {
        ModalModule.mostrarModal(
            'Selecciona un borrador',
            'Por favor, selecciona un borrador de la lista.'
        );
        return;
    }
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        
        const borradores = JSON.parse(stored);
        const borrador = borradores[borradorId];
        
        if (!borrador) {
            ModalModule.mostrarModal(
                '❌ Error',
                'El borrador seleccionado no existe.'
            );
            return;
        }
        
        // Cargar datos en el formulario
        FormularioModule.setFormData(borrador);
        
        // Actualizar estado
        estadoFormulario = FormularioModule.getFormData();
        RecetaModule.actualizarReceta(estadoFormulario);
        
        // Cambiar tamaño de página si está guardado
        if (borrador.paperSize) {
            RecetaModule.cambiarTamañoPagina(borrador.paperSize);
            
            // Actualizar radio button
            const radio = document.querySelector(`input[name="paperSize"][value="${borrador.paperSize}"]`);
            if (radio) radio.checked = true;
        }
        
        DrawerModule.cerrarDrawer();
        
        ModalModule.mostrarModal(
            '✅ Borrador cargado',
            `El borrador "${borrador.nombre}" se cargó correctamente.`
        );
    } catch (e) {
        console.error('Error cargando borrador:', e);
        ModalModule.mostrarModal(
            '❌ Error',
            'No se pudo cargar el borrador.'
        );
    }
}

function eliminarBorrador() {
    const borradorId = DrawerModule.getBorradorSeleccionado();
    
    if (!borradorId) {
        ModalModule.mostrarModal(
            'Selecciona un borrador',
            'Por favor, selecciona un borrador de la lista para eliminar.'
        );
        return;
    }
    
    // Confirmar eliminación
    if (!confirm('¿Estás seguro de eliminar este borrador?')) {
        return;
    }
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        
        const borradores = JSON.parse(stored);
        const nombreBorrador = borradores[borradorId]?.nombre || 'Sin nombre';
        
        delete borradores[borradorId];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(borradores));
        
        actualizarListaBorradores();
        
        ModalModule.mostrarModal(
            '✅ Borrador eliminado',
            `El borrador "${nombreBorrador}" se eliminó correctamente.`
        );
    } catch (e) {
        console.error('Error eliminando borrador:', e);
        ModalModule.mostrarModal(
            '❌ Error',
            'No se pudo eliminar el borrador.'
        );
    }
}

function actualizarListaBorradores() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const borradores = stored ? JSON.parse(stored) : {};
        DrawerModule.actualizarListaBorradores(borradores);
    } catch (e) {
        console.error('Error actualizando lista de borradores:', e);
    }
}

// ========================================
// Cambiar Tamaño de Página
// ========================================

function cambiarTamañoPagina(tamaño) {
    RecetaModule.cambiarTamañoPagina(tamaño);
}

// ========================================
// Exportación PDF
// ========================================

async function exportarPDF() {
    try {
        // Obtener elemento a convertir
        const elemento = document.getElementById('recetaDocumento');
        if (!elemento) {
            throw new Error('No se encontró el documento a exportar');
        }
        
        // Obtener configuración
        const nombrePDF = DrawerModule.getNombrePDF();
        const tamañoPagina = DrawerModule.getTamañoPagina();
        
        // Dimensiones según tamaño de página (en mm)
        const dimensiones = {
            carta: { width: 215.9, height: 279.4 },
            a4: { width: 210, height: 297 }
        };
        
        const dim = dimensiones[tamañoPagina] || dimensiones.carta;
        
        // Mostrar mensaje de procesamiento
        ModalModule.mostrarModal(
            '⏳ Generando PDF',
            'Por favor espera mientras se genera el documento...'
        );
        
        // Generar canvas del elemento
        const canvas = await html2canvas(elemento, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Crear PDF con jsPDF
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        
        // Orientación portrait, unidades mm
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [dim.width, dim.height]
        });
        
        // Calcular dimensiones de la imagen
        const imgWidth = dim.width;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Agregar imagen al PDF
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= dim.height;
        
        // Si la imagen es más alta que una página, agregar páginas adicionales
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= dim.height;
        }
        
        // Guardar PDF
        pdf.save(`${nombrePDF}.pdf`);
        
        // Cerrar modal de procesamiento y mostrar éxito
        setTimeout(() => {
            ModalModule.mostrarModal(
                '✅ PDF generado',
                'El documento se descargó correctamente.'
            );
        }, 500);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        ModalModule.mostrarModal(
            '❌ Error',
            'No se pudo generar el PDF. Por favor, intenta nuevamente.'
        );
    }
}

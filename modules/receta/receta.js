/**
 * ========================================
 * Módulo Receta - Renderizado en Tiempo Real
 * ========================================
 * Actualiza el preview WYSIWYG con los datos del formulario
 */

/**
 * Inicializa el módulo de receta
 */
export function initReceta() {
    // Configuración inicial si es necesaria
    console.log('Módulo Receta inicializado');
}

/**
 * Actualiza el preview con los datos del formulario
 */
export function actualizarReceta(data) {
    if (!data) return;
    
    // Actualizar datos del paciente
    actualizarTexto('prevPaciente', data.paciente);
    actualizarTexto('prevEdad', data.edad);
    actualizarTexto('prevFechaNacimiento', formatearFecha(data.fechaNacimiento));
    actualizarTexto('prevFechaConsulta', formatearFecha(data.fechaConsulta));
    
    // Actualizar signos vitales
    const pesoTexto = data.peso ? `${data.peso} ${data.unidadPeso}` : '-';
    actualizarTexto('prevPeso', pesoTexto);
    
    const tallaTexto = data.talla ? `${data.talla} cm` : '-';
    actualizarTexto('prevTalla', tallaTexto);
    
    const fcTexto = data.fc ? `${data.fc} lpm` : '-';
    actualizarTexto('prevFC', fcTexto);
    
    const frTexto = data.fr ? `${data.fr} rpm` : '-';
    actualizarTexto('prevFR', frTexto);
    
    const tempTexto = data.temperatura ? `${data.temperatura} °C` : '-';
    actualizarTexto('prevTemperatura', tempTexto);
    
    // Actualizar diagnóstico
    actualizarTexto('prevDiagnostico', data.diagnostico);
    
    // Actualizar medicamentos
    actualizarMedicamentos(data.medicamentos);
    
    // Actualizar notas
    actualizarTexto('prevNotas', data.notas);
}

/**
 * Actualiza el texto de un elemento
 */
function actualizarTexto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor || '-';
    }
}

/**
 * Formatea una fecha en formato legible
 */
function formatearFecha(fecha) {
    if (!fecha) return '-';
    
    try {
        // Parse as local date to avoid timezone shifts
        const [year, month, day] = fecha.split('-');
        const date = new Date(year, month - 1, day);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-MX', opciones);
    } catch (e) {
        return fecha;
    }
}

/**
 * Actualiza la lista de medicamentos en el preview
 */
function actualizarMedicamentos(medicamentos) {
    const container = document.getElementById('prevMedicamentos');
    const section = document.getElementById('medicamentosSection');
    
    if (!container || !section) return;
    
    // Si no hay medicamentos, ocultar sección
    if (!medicamentos || medicamentos.length === 0) {
        section.classList.add('hidden');
        return;
    }
    
    // Mostrar sección
    section.classList.remove('hidden');
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Renderizar cada medicamento
    medicamentos.forEach((med, index) => {
        // Solo mostrar si tiene al menos el nombre
        if (!med.nombre || med.nombre.trim() === '') return;
        
        const medDiv = document.createElement('div');
        medDiv.className = 'medicamento-prev-item';
        
        let html = `<div class="med-prev-nombre">${index + 1}. ${med.nombre}</div>`;
        
        const detalles = [];
        if (med.dosis) detalles.push(`Dosis: ${med.dosis}`);
        if (med.frecuencia) detalles.push(`Frecuencia: ${med.frecuencia}`);
        if (med.duracion) detalles.push(`Duración: ${med.duracion}`);
        
        if (detalles.length > 0) {
            html += `<div class="med-prev-detalle">${detalles.join(' | ')}</div>`;
        }
        
        if (med.nota) {
            html += `<div class="med-prev-nota">Nota: ${med.nota}</div>`;
        }
        
        medDiv.innerHTML = html;
        container.appendChild(medDiv);
    });
    
    // Si no se renderizó ningún medicamento, ocultar sección
    if (container.children.length === 0) {
        section.classList.add('hidden');
    }
}

/**
 * Cambia el tamaño de página del documento
 */
export function cambiarTamañoPagina(tamaño) {
    const documento = document.getElementById('recetaDocumento');
    if (!documento) return;
    
    if (tamaño === 'a4') {
        documento.classList.add('a4');
    } else {
        documento.classList.remove('a4');
    }
}

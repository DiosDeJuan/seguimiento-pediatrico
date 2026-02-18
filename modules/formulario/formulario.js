/**
 * ========================================
 * Módulo Formulario - Lógica de Captura
 * ========================================
 * Gestiona la captura de datos del formulario
 * y notifica cambios al orquestador
 */

let medicamentos = [];
let medicamentoIdCounter = 1;

/**
 * Inicializa el módulo del formulario
 */
export function initFormulario(onFormChange) {
    // Configurar fecha de consulta por defecto (hoy)
    const fechaConsultaInput = document.getElementById('fechaConsulta');
    if (fechaConsultaInput && !fechaConsultaInput.value) {
        const today = new Date().toISOString().split('T')[0];
        fechaConsultaInput.value = today;
    }
    
    // Agregar listeners a todos los inputs
    const inputs = document.querySelectorAll('#panelFormulario input, #panelFormulario select, #panelFormulario textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (onFormChange) {
                onFormChange(getFormData());
            }
        });
    });
    
    // Configurar botón de agregar medicamento
    const btnAgregarMedicamento = document.getElementById('btnAgregarMedicamento');
    if (btnAgregarMedicamento) {
        btnAgregarMedicamento.addEventListener('click', () => {
            agregarMedicamento();
            if (onFormChange) {
                onFormChange(getFormData());
            }
        });
    }
    
    // Notificar estado inicial
    if (onFormChange) {
        onFormChange(getFormData());
    }
}

/**
 * Obtiene todos los datos del formulario
 */
export function getFormData() {
    return {
        paciente: document.getElementById('paciente')?.value || '',
        edad: document.getElementById('edad')?.value || '',
        fechaNacimiento: document.getElementById('fechaNacimiento')?.value || '',
        fechaConsulta: document.getElementById('fechaConsulta')?.value || '',
        peso: document.getElementById('peso')?.value || '',
        unidadPeso: document.getElementById('unidadPeso')?.value || 'kg',
        talla: document.getElementById('talla')?.value || '',
        fc: document.getElementById('fc')?.value || '',
        fr: document.getElementById('fr')?.value || '',
        temperatura: document.getElementById('temperatura')?.value || '',
        diagnostico: document.getElementById('diagnostico')?.value || '',
        medicamentos: medicamentos,
        notas: document.getElementById('notas')?.value || ''
    };
}

/**
 * Carga datos en el formulario
 */
export function setFormData(data) {
    if (!data) return;
    
    // Campos simples
    const fields = ['paciente', 'edad', 'fechaNacimiento', 'fechaConsulta', 
                    'peso', 'unidadPeso', 'talla', 'fc', 'fr', 
                    'temperatura', 'diagnostico', 'notas'];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && data[field] !== undefined) {
            element.value = data[field];
        }
    });
    
    // Medicamentos
    medicamentos = [];
    medicamentoIdCounter = 1;
    const container = document.getElementById('medicamentosContainer');
    if (container) {
        container.innerHTML = '';
    }
    
    if (data.medicamentos && Array.isArray(data.medicamentos)) {
        data.medicamentos.forEach(med => {
            agregarMedicamento(med);
        });
    }
}

/**
 * Agrega un nuevo medicamento al formulario
 */
function agregarMedicamento(datos = null) {
    const id = medicamentoIdCounter++;
    const medicamento = datos || {
        id: id,
        nombre: '',
        dosis: '',
        frecuencia: '',
        duracion: '',
        nota: ''
    };
    
    if (!medicamento.id) {
        medicamento.id = id;
    }
    
    medicamentos.push(medicamento);
    renderMedicamentos();
}

/**
 * Elimina un medicamento
 */
function eliminarMedicamento(id) {
    medicamentos = medicamentos.filter(m => m.id !== id);
    renderMedicamentos();
    
    // Notificar cambio
    const event = new Event('input', { bubbles: true });
    document.getElementById('panelFormulario').dispatchEvent(event);
}

/**
 * Mueve un medicamento arriba
 */
function moverMedicamentoArriba(id) {
    const index = medicamentos.findIndex(m => m.id === id);
    if (index > 0) {
        [medicamentos[index - 1], medicamentos[index]] = [medicamentos[index], medicamentos[index - 1]];
        renderMedicamentos();
        
        // Notificar cambio
        const event = new Event('input', { bubbles: true });
        document.getElementById('panelFormulario').dispatchEvent(event);
    }
}

/**
 * Mueve un medicamento abajo
 */
function moverMedicamentoAbajo(id) {
    const index = medicamentos.findIndex(m => m.id === id);
    if (index < medicamentos.length - 1) {
        [medicamentos[index], medicamentos[index + 1]] = [medicamentos[index + 1], medicamentos[index]];
        renderMedicamentos();
        
        // Notificar cambio
        const event = new Event('input', { bubbles: true });
        document.getElementById('panelFormulario').dispatchEvent(event);
    }
}

/**
 * Renderiza la lista de medicamentos
 */
function renderMedicamentos() {
    const container = document.getElementById('medicamentosContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    medicamentos.forEach((med, index) => {
        const medDiv = document.createElement('div');
        medDiv.className = 'medicamento-item';
        medDiv.innerHTML = `
            <div class="medicamento-header">
                <span class="medicamento-numero">Medicamento ${index + 1}</span>
                <div class="medicamento-controles">
                    <button type="button" class="btn-reorder" data-id="${med.id}" data-action="up" title="Mover arriba">⬆️</button>
                    <button type="button" class="btn-reorder" data-id="${med.id}" data-action="down" title="Mover abajo">⬇️</button>
                    <button type="button" class="btn-eliminar-med" data-id="${med.id}" title="Eliminar">🗑️</button>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group full">
                    <label>Nombre del Medicamento</label>
                    <input type="text" class="med-nombre" data-id="${med.id}" value="${med.nombre || ''}" placeholder="Nombre">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Dosis</label>
                    <input type="text" class="med-dosis" data-id="${med.id}" value="${med.dosis || ''}" placeholder="Ej: 5ml">
                </div>
                <div class="form-group">
                    <label>Frecuencia</label>
                    <input type="text" class="med-frecuencia" data-id="${med.id}" value="${med.frecuencia || ''}" placeholder="Ej: c/8h">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Duración</label>
                    <input type="text" class="med-duracion" data-id="${med.id}" value="${med.duracion || ''}" placeholder="Ej: 7 días">
                </div>
                <div class="form-group">
                    <label>Nota</label>
                    <input type="text" class="med-nota" data-id="${med.id}" value="${med.nota || ''}" placeholder="Opcional">
                </div>
            </div>
        `;
        
        container.appendChild(medDiv);
    });
    
    // Agregar event listeners
    container.querySelectorAll('.btn-eliminar-med').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            eliminarMedicamento(id);
        });
    });
    
    container.querySelectorAll('.btn-reorder').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            if (action === 'up') {
                moverMedicamentoArriba(id);
            } else {
                moverMedicamentoAbajo(id);
            }
        });
    });
    
    // Event listeners para inputs de medicamentos
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = parseInt(e.target.dataset.id);
            const med = medicamentos.find(m => m.id === id);
            if (med) {
                if (e.target.classList.contains('med-nombre')) med.nombre = e.target.value;
                if (e.target.classList.contains('med-dosis')) med.dosis = e.target.value;
                if (e.target.classList.contains('med-frecuencia')) med.frecuencia = e.target.value;
                if (e.target.classList.contains('med-duracion')) med.duracion = e.target.value;
                if (e.target.classList.contains('med-nota')) med.nota = e.target.value;
                
                // Notificar cambio
                const event = new Event('input', { bubbles: true });
                document.getElementById('panelFormulario').dispatchEvent(event);
            }
        });
    });
}

/**
 * Limpia el formulario
 */
export function limpiarFormulario() {
    medicamentos = [];
    medicamentoIdCounter = 1;
    
    const inputs = document.querySelectorAll('#panelFormulario input, #panelFormulario select, #panelFormulario textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
        } else {
            input.value = '';
        }
    });
    
    // Configurar fecha de consulta por defecto
    const fechaConsultaInput = document.getElementById('fechaConsulta');
    if (fechaConsultaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaConsultaInput.value = today;
    }
    
    // Limpiar medicamentos
    const container = document.getElementById('medicamentosContainer');
    if (container) {
        container.innerHTML = '';
    }
}

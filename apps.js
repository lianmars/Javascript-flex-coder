const montoInput = document.getElementById("monto");
const mesesInput = document.getElementById("meses");
const tipoPrestamoSelect = document.getElementById("tipo-prestamo");

const cuotaText = document.getElementById("cuota");
const totalText = document.getElementById("total");
const interesesText = document.getElementById("intereses");

const boton = document.getElementById("calcular");
const botonConfirmar = document.getElementById("confirmar");
const botonHistorial = document.getElementById("ver-historial");
const historialContainer = document.getElementById("historial-container");
const historialLista = document.getElementById("historial-lista");
const botonLimpiar = document.getElementById("limpiar-historial");

let ultimaSimulacion = null;

// Cargar datos al iniciar usando Fetch, Async/Await y Promesas
document.addEventListener("DOMContentLoaded", cargarTiposDePrestamo);

async function cargarTiposDePrestamo() {
    try {
        const respuesta = await fetch("data.json");
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar la data de préstamos");
        }
        const datos = await respuesta.json();

        // Limpiar y llenar el select
        tipoPrestamoSelect.innerHTML = '<option value="" disabled selected>Seleccioná un préstamo...</option>';
        datos.forEach(prestamo => {
            const option = document.createElement("option");
            option.value = prestamo.tasa;
            option.textContent = `${prestamo.nombre} (TNA: ${prestamo.tasa}%)`;
            tipoPrestamoSelect.appendChild(option);
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Hubo un problema al cargar los tipos de préstamo.',
            background: '#1e293b',
            color: '#fff',
            confirmButtonColor: '#0ea5e9'
        });
    }
}


// Evento para calcular el préstamo
boton.addEventListener("click", calcularPrestamo);

function calcularPrestamo() {
    const monto = parseFloat(montoInput.value);
    const meses = parseInt(mesesInput.value);
    const interes = parseFloat(tipoPrestamoSelect.value);
    const tipoNombre = tipoPrestamoSelect.options[tipoPrestamoSelect.selectedIndex].textContent;

    // Validación con SweetAlert2 en lugar de alert()
    if (isNaN(monto) || isNaN(meses) || isNaN(interes)) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor completá todos los campos y seleccioná un tipo de préstamo.',
            background: '#1e293b',
            color: '#fff',
            confirmButtonColor: '#0ea5e9'
        });
        return;
    }

    if (monto <= 0 || meses <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Valores inválidos',
            text: 'El monto y los meses deben ser mayores a 0.',
            background: '#1e293b',
            color: '#fff',
            confirmButtonColor: '#0ea5e9'
        });
        return;
    }

    // Cálculo de amortización (sistema francés aproximado)
    const i = interes / 100 / 12;
    const cuota = monto * (i * Math.pow(1 + i, meses)) / (Math.pow(1 + i, meses) - 1);
    const total = cuota * meses;
    const intereses = total - monto;

    // Guardar la simulación actual para confirmarla después
    ultimaSimulacion = {
        tipo: tipoNombre,
        monto: monto,
        meses: meses,
        cuota: cuota,
        intereses: intereses,
        total: total,
        fecha: new Date().toLocaleString("es-AR")
    };

    mostrarResultados(cuota, total, intereses);
}


function mostrarResultados(cuota, total, intereses) {
    cuotaText.textContent = `$${cuota.toFixed(2)}`;
    totalText.textContent = `$${total.toFixed(2)}`;
    interesesText.textContent = `$${intereses.toFixed(2)}`;

    // Mostrar botón de confirmar
    botonConfirmar.style.display = "block";

    animarResultado();
}


function animarResultado() {
    const card = document.querySelector(".result-card");

    card.style.opacity = 0;
    card.style.transform = "translateY(20px)";

    setTimeout(() => {
        card.style.transition = "all 0.5s ease";
        card.style.opacity = 1;
        card.style.transform = "translateY(0)";
    }, 100);
}


// Evento para confirmar y guardar el préstamo
botonConfirmar.addEventListener("click", confirmarPrestamo);

function confirmarPrestamo() {
    if (!ultimaSimulacion) return;

    Swal.fire({
        title: '¿Confirmar préstamo?',
        html: `
            <div style="text-align:left; font-size:0.95rem; line-height:1.8;">
                <strong>Tipo:</strong> ${ultimaSimulacion.tipo}<br>
                <strong>Capital:</strong> $${ultimaSimulacion.monto.toFixed(2)}<br>
                <strong>Plazo:</strong> ${ultimaSimulacion.meses} meses<br>
                <strong>Cuota mensual:</strong> $${ultimaSimulacion.cuota.toFixed(2)}<br>
                <strong>Total a pagar:</strong> $${ultimaSimulacion.total.toFixed(2)}
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            guardarEnHistorial(ultimaSimulacion);
            ultimaSimulacion = null;
            botonConfirmar.style.display = "none";

            // Resetear formulario y resultados
            montoInput.value = "";
            mesesInput.value = "";
            tipoPrestamoSelect.selectedIndex = 0;
            cuotaText.textContent = "$0.00";
            totalText.textContent = "$0.00";
            interesesText.textContent = "$0.00";

            Swal.fire({
                icon: 'success',
                title: '¡Préstamo confirmado!',
                text: 'Tu solicitud fue guardada en el historial.',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#0ea5e9'
            });
        }
    });
}


// Funciones de historial con localStorage
function guardarEnHistorial(simulacion) {
    const historial = obtenerHistorial();
    historial.push(simulacion);
    localStorage.setItem("historialPrestamos", JSON.stringify(historial));
}

function obtenerHistorial() {
    const data = localStorage.getItem("historialPrestamos");
    return data ? JSON.parse(data) : [];
}


// Evento para ver el historial
botonHistorial.addEventListener("click", toggleHistorial);

function toggleHistorial() {
    const estaVisible = historialContainer.style.display === "block";

    if (estaVisible) {
        historialContainer.style.display = "none";
        botonHistorial.textContent = "📋 Ver historial";
    } else {
        renderizarHistorial();
        historialContainer.style.display = "block";
        botonHistorial.textContent = "✖ Cerrar historial";

        // Animación de entrada
        historialContainer.style.opacity = 0;
        historialContainer.style.transform = "translateY(20px)";
        setTimeout(() => {
            historialContainer.style.transition = "all 0.5s ease";
            historialContainer.style.opacity = 1;
            historialContainer.style.transform = "translateY(0)";
        }, 50);
    }
}


function renderizarHistorial() {
    const historial = obtenerHistorial();
    historialLista.innerHTML = "";

    if (historial.length === 0) {
        historialLista.innerHTML = '<p class="historial-vacio">No hay préstamos confirmados aún.</p>';
        return;
    }

    historial.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "historial-item";
        div.innerHTML = `
            <div class="historial-header">
                <span class="historial-numero">#${index + 1}</span>
                <span class="historial-fecha">${item.fecha}</span>
            </div>
            <div class="historial-detalle">
                <span>${item.tipo}</span>
                <span>Capital: <strong>$${item.monto.toFixed(2)}</strong></span>
                <span>Cuota: <strong>$${item.cuota.toFixed(2)}</strong></span>
                <span>Total: <strong>$${item.total.toFixed(2)}</strong></span>
            </div>
        `;
        historialLista.appendChild(div);
    });
}


// Evento para limpiar historial
botonLimpiar.addEventListener("click", limpiarHistorial);

function limpiarHistorial() {
    const historial = obtenerHistorial();

    if (historial.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Historial vacío',
            text: 'No hay préstamos para eliminar.',
            background: '#1e293b',
            color: '#fff',
            confirmButtonColor: '#0ea5e9'
        });
        return;
    }

    Swal.fire({
        title: '¿Limpiar historial?',
        text: 'Se eliminarán todos los préstamos guardados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("historialPrestamos");
            renderizarHistorial();
            Swal.fire({
                icon: 'success',
                title: 'Historial limpio',
                text: 'Todos los préstamos fueron eliminados.',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#0ea5e9'
            });
        }
    });
}

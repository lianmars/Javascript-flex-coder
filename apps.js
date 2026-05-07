const montoInput = document.getElementById("monto");
const mesesInput = document.getElementById("meses");
const tipoPrestamoSelect = document.getElementById("tipo-prestamo");

const cuotaText = document.getElementById("cuota");
const totalText = document.getElementById("total");
const interesesText = document.getElementById("intereses");

const boton = document.getElementById("calcular");

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
        console.error(error);
    }
}


boton.addEventListener("click", calcularPrestamo);

function calcularPrestamo() {
  const monto = parseFloat(montoInput.value);
  const meses = parseInt(mesesInput.value);
  const interes = parseFloat(tipoPrestamoSelect.value);


  // Uso de SweetAlert2 en lugar de alert()
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


  mostrarResultados(cuota, total, intereses, monto);
}


function mostrarResultados(cuota, total, intereses, capital) {
  cuotaText.textContent = `$${cuota.toFixed(2)}`;
  totalText.textContent = `$${total.toFixed(2)}`;
  interesesText.textContent = `$${intereses.toFixed(2)}`;

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

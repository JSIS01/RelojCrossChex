const dropArea = document.getElementById('dropArea');

// Función para manejar el archivo cargado
function handleDrop(event){
	dropArea.classList.remove('bg-indigo-500')
	dropArea.classList.add('bg-indigo-800')
	event.preventDefault();

	const reader = new FileReader()
	reader.onload = function (e) {
		try {
			const data = e.target.result;
			const workbook = XLSX.read(data, { type: 'binary' });
			const first_sheet_name = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[first_sheet_name];
			const json_data = XLSX.utils.sheet_to_json(worksheet);

			if (!json_data || json_data.length === 0) {
				console.error('No se encontraron datos en el archivo Excel');
				return;
			}

			json_data.forEach((fila) => {
				if (!fila || typeof fila.Hora === 'undefined' || typeof fila.Fecha === 'undefined') {
					console.warn('Fila inválida o sin campo Hora/Fecha:', fila);
					return;
				}

				try {
					let [horas, minutos] = fila.Hora.toString().split(":");
					const formattedTime = `${horas.padStart(2, "0")}:${minutos.padStart(2, "0")}`
					fila.Time = formattedTime

					let [day, month, year] = fila.Fecha.toString().split("/");
					let FechaFromString = new Date(year, month - 1, day);
					
					fila.Date = FechaFromString.toISOString().slice(0, 10)
				} catch (error) {
					console.error('Error procesando fila:', fila, error);
				}
			})

			const DatosAgrupadosPorNombre = json_data.reduce((acumulador, objeto) => {
				const nombre = objeto.Nombre;
				const fecha = objeto.Date;

				if (!acumulador[nombre]) {
					acumulador[nombre] = {};
				}

				if (!acumulador[nombre][fecha]) {
					acumulador[nombre][fecha] = [];
				}

				// Ordenamos las horas de manera ascendente
				acumulador[nombre][fecha].push(objeto);
				acumulador[nombre][fecha].sort((a, b) => {
					return a.Time.localeCompare(b.Time);
				});

				return acumulador;
			}, {});

			for (let Nombre in DatosAgrupadosPorNombre) {
				let Persona = DatosAgrupadosPorNombre[Nombre];
				let totalMinutosPorPersona = 0;

				for (let Fecha in Persona) {
					let registros = Persona[Fecha];
					let MinutosTrabajados = 0;

					// Procesamos los registros en pares (entrada/salida)
					for (let i = 0; i < registros.length - 1; i += 2) {
						const entrada = new Date(`2000-01-01T${registros[i].Time}`);
						const salida = new Date(`2000-01-01T${registros[i + 1]?.Time || registros[i].Time}`);
						
						const diferencia = salida.getTime() - entrada.getTime();
						const minutos = diferencia / (1000 * 60);
						
						if (minutos > 0) {
							MinutosTrabajados += minutos;
						}
					}

					// Guardamos los minutos trabajados en el día
					DatosAgrupadosPorNombre[Nombre][Fecha] = {
						registros: registros,
						MinutosTrabajados: MinutosTrabajados,
						HorasTrabajadas: Math.floor(MinutosTrabajados / 60),
						MinutosRestantes: Math.round(MinutosTrabajados % 60)
					};

					totalMinutosPorPersona += MinutosTrabajados;
				}

				// Agregamos el total de horas por persona
				DatosAgrupadosPorNombre[Nombre].TotalHoras = Math.floor(totalMinutosPorPersona / 60);
				DatosAgrupadosPorNombre[Nombre].TotalMinutos = Math.round(totalMinutosPorPersona % 60);
			}

			PlanillaTrabajadores = DatosAgrupadosPorNombre
		} catch (error) {
			console.error('Error procesando el archivo:', error);
		}
	}

	const files = event.dataTransfer.files;
    if (files.length > 0) {
		reader.readAsArrayBuffer(files[0])
    }
}

function handleDragOver(e) {
	e.preventDefault();
}

document.addEventListener("DOMContentLoaded", function () {
	document.getElementById("SubmitExcel").addEventListener("change", handleFile, false)
})

// Función para manejar el archivo cargado
function handleFile() {
	const input = document.getElementById("SubmitExcel")
	const reader = new FileReader()
	reader.onload = function (e) {
		try {
			const data = e.target.result;
			const workbook = XLSX.read(data, { type: 'binary' });
			const first_sheet_name = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[first_sheet_name];
			const json_data = XLSX.utils.sheet_to_json(worksheet);

			if (!json_data || json_data.length === 0) {
				console.error('No se encontraron datos en el archivo Excel');
				return;
			}

			json_data.forEach((fila) => {
				if (!fila || typeof fila.Hora === 'undefined' || typeof fila.Fecha === 'undefined') {
					console.warn('Fila inválida o sin campo Hora/Fecha:', fila);
					return;
				}

				try {
					let [horas, minutos] = fila.Hora.toString().split(":");
					const formattedTime = `${horas.padStart(2, "0")}:${minutos.padStart(2, "0")}`
					fila.Time = formattedTime

					let [day, month, year] = fila.Fecha.toString().split("/");
					let FechaFromString = new Date(year, month - 1, day);
					
					fila.Date = FechaFromString.toISOString().slice(0, 10)
				} catch (error) {
					console.error('Error procesando fila:', fila, error);
				}
			})

			const DatosAgrupadosPorNombre = json_data.reduce((acumulador, objeto) => {
				const nombre = objeto.Nombre;
				const fecha = objeto.Date;

				if (!acumulador[nombre]) {
					acumulador[nombre] = {};
				}

				if (!acumulador[nombre][fecha]) {
					acumulador[nombre][fecha] = [];
				}

				// Ordenamos las horas de manera ascendente
				acumulador[nombre][fecha].push(objeto);
				acumulador[nombre][fecha].sort((a, b) => {
					return a.Time.localeCompare(b.Time);
				});

				return acumulador;
			}, {});

			for (let Nombre in DatosAgrupadosPorNombre) {
				let Persona = DatosAgrupadosPorNombre[Nombre];
				let totalMinutosPorPersona = 0;

				for (let Fecha in Persona) {
					let registros = Persona[Fecha];
					let MinutosTrabajados = 0;

					// Procesamos los registros en pares (entrada/salida)
					for (let i = 0; i < registros.length - 1; i += 2) {
						const entrada = new Date(`2000-01-01T${registros[i].Time}`);
						const salida = new Date(`2000-01-01T${registros[i + 1]?.Time || registros[i].Time}`);
						
						const diferencia = salida.getTime() - entrada.getTime();
						const minutos = diferencia / (1000 * 60);
						
						if (minutos > 0) {
							MinutosTrabajados += minutos;
						}
					}

					// Guardamos los minutos trabajados en el día
					DatosAgrupadosPorNombre[Nombre][Fecha] = {
						registros: registros,
						MinutosTrabajados: MinutosTrabajados,
						HorasTrabajadas: Math.floor(MinutosTrabajados / 60),
						MinutosRestantes: Math.round(MinutosTrabajados % 60)
					};

					totalMinutosPorPersona += MinutosTrabajados;
				}

				// Agregamos el total de horas por persona
				DatosAgrupadosPorNombre[Nombre].TotalHoras = Math.floor(totalMinutosPorPersona / 60);
				DatosAgrupadosPorNombre[Nombre].TotalMinutos = Math.round(totalMinutosPorPersona % 60);
			}

			PlanillaTrabajadores = DatosAgrupadosPorNombre
		} catch (error) {
			console.error('Error procesando el archivo:', error);
		}
	}
	// Lee el archivo como un array buffer
	reader.readAsArrayBuffer(input.files[0])
}

let PlanillaTrabajadores;

function mostrarResumenEnTarjetas(DatosAgrupadosPorNombre) {
    const contenedor = document.getElementById('TarjetaInfo');
    let html = "";

    for (let Nombre in DatosAgrupadosPorNombre) {
        let Persona = DatosAgrupadosPorNombre[Nombre];
        let diasRegistrados = {};
        let totalMinutos = 0;

        // Procesar todos los días del empleado
        for (let Fecha in Persona) {
            if (Fecha === 'TotalHoras' || Fecha === 'TotalMinutos') continue;
            
            const registros = Persona[Fecha].registros;
            diasRegistrados[Fecha] = {
                esCorrecto: registros.length % 2 === 0,
                minutos: Persona[Fecha].MinutosTrabajados
            };
            totalMinutos += Persona[Fecha].MinutosTrabajados;
        }

        const horasTotales = Math.floor(totalMinutos / 60);
        const minutosTotales = Math.round(totalMinutos % 60);

        // Generar calendario
        const calendario = generarCalendario(diasRegistrados);

        html += `
            <div class="bg-white rounded-lg shadow-xl py-6 px-4 sm:w-1/4 w-11/12">
                <h2 class="text-indigo-800 text-lg font-bold mb-2">${Nombre}</h2>
                <p class="bg-gradient-to-l from-indigo-700 to-indigo-800 text-white py-1 px-2 rounded-lg inline-block text-sm mb-4">
                    Total: ${horasTotales}h ${minutosTotales}m
                </p>
                <div class="calendario grid grid-cols-7 gap-1 text-center">
                    <div class="font-bold">Do</div>
                    <div class="font-bold">Lu</div>
                    <div class="font-bold">Ma</div>
                    <div class="font-bold">Mi</div>
                    <div class="font-bold">Ju</div>
                    <div class="font-bold">Vi</div>
                    <div class="font-bold">Sa</div>
                    ${calendario}
                </div>
            </div>
        `;
    }

    contenedor.innerHTML = html;
}

function generarCalendario(diasRegistrados) {
    const hoy = new Date();
    const primerDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    let html = '';
    
    // Agregar espacios vacíos para los días antes del primer día del mes
    for (let i = 0; i < primerDiaDelMes.getDay(); i++) {
        html += '<div class="p-2"></div>';
    }

    // Generar los días del mes
    for (let dia = 1; dia <= ultimoDiaDelMes.getDate(); dia++) {
        const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const diaRegistrado = diasRegistrados[fecha];
        
        let claseColor = 'bg-gray-100'; // Día sin registro
        let horasMinutos = '';
        
        if (diaRegistrado) {
            const horas = Math.floor(diaRegistrado.minutos / 60);
            const minutos = Math.round(diaRegistrado.minutos % 60);
            horasMinutos = `${horas}h ${minutos}m`;
            claseColor = diaRegistrado.esCorrecto ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200';
        }

        html += `
            <div class="${claseColor} p-2 rounded text-xs relative group cursor-pointer">
                ${dia}
                ${diaRegistrado ? `
                    <div class="hidden group-hover:block absolute z-10 bg-white border border-gray-200 rounded p-2 shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        ${horasMinutos}
                    </div>
                ` : ''}
            </div>
        `;
    }

    return html;
}

function formatearFecha(fecha) {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
}

// Modificar los event listeners existentes
document.getElementById("BotonMensual").addEventListener("click", () => {
    if (!PlanillaTrabajadores) {
        alert("El archivo no tiene fichajes");
        return;
    }
    mostrarResumenEnTarjetas(PlanillaTrabajadores);
});

document.getElementById("BotonSemanal").addEventListener("click", () => {
    if (!PlanillaTrabajadores) {
        alert("El archivo no tiene fichajes");
        return;
    }
    mostrarResumenEnTarjetas(PlanillaTrabajadores);
});

document.getElementById("bg-change").addEventListener("click", () => {
	const img = document.createElement("img")
	img.id = "img-bg"
	img.classList.add("hidden")
	img.src = "./src/bg.jpg"
	img.style.position = "fixed"
	img.style.top = "0"
	img.style.left = "0"
	img.style.width = "135px"
	img.style.height = "90px"
	document.body.appendChild(img)
	let imagen_bg=document.getElementById("img-bg");
	if(imagen_bg.classList.contains("hidden")){
		imagen_bg.classList.remove("hidden")
	}else{
		imagen_bg.classList.add("hidden")
	}
})

function calcularTotalSemanal(DatosAgrupadosPorNombre) {
    const hoy = new Date();
    const inicioDeSemana = new Date(hoy);
    inicioDeSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo
    
    let totalMinutosSemana = 0;
    let resumenSemanal = [];

    for (let Nombre in DatosAgrupadosPorNombre) {
        let Persona = DatosAgrupadosPorNombre[Nombre];
        let minutosPersona = 0;

        for (let Fecha in Persona) {
            if (Fecha === 'TotalHoras' || Fecha === 'TotalMinutos') continue;
            
            const fechaRegistro = new Date(Fecha);
            if (fechaRegistro >= inicioDeSemana && fechaRegistro <= hoy) {
                minutosPersona += Persona[Fecha].MinutosTrabajados;
            }
        }

        if (minutosPersona > 0) {
            resumenSemanal.push({
                Nombre: Nombre,
                horas: Math.floor(minutosPersona / 60),
                minutos: Math.round(minutosPersona % 60)
            });
            totalMinutosSemana += minutosPersona;
        }
    }

    return {
        resumen: resumenSemanal,
        total: {
            horas: Math.floor(totalMinutosSemana / 60),
            minutos: Math.round(totalMinutosSemana % 60)
        }
    };
}

function calcularTotalMensual(DatosAgrupadosPorNombre) {
    const hoy = new Date();
    const inicioDeMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    let totalMinutosMes = 0;
    let resumenMensual = [];

    for (let Nombre in DatosAgrupadosPorNombre) {
        let Persona = DatosAgrupadosPorNombre[Nombre];
        let minutosPersona = 0;

        for (let Fecha in Persona) {
            if (Fecha === 'TotalHoras' || Fecha === 'TotalMinutos') continue;
            
            const fechaRegistro = new Date(Fecha);
            if (fechaRegistro >= inicioDeMes && fechaRegistro <= hoy) {
                minutosPersona += Persona[Fecha].MinutosTrabajados;
            }
        }

        if (minutosPersona > 0) {
            resumenMensual.push({
                Nombre: Nombre,
                horas: Math.floor(minutosPersona / 60),
                minutos: Math.round(minutosPersona % 60)
            });
            totalMinutosMes += minutosPersona;
        }
    }

    return {
        resumen: resumenMensual,
        total: {
            horas: Math.floor(totalMinutosMes / 60),
            minutos: Math.round(totalMinutosMes % 60)
        }
    };
}

// Agregar event listeners para los botones
document.addEventListener('DOMContentLoaded', function() {
    const btnSemanal = document.getElementById('btnSemanal');
    const btnMensual = document.getElementById('btnMensual');
    
    if (btnSemanal) {
        btnSemanal.addEventListener('click', function() {
            const resumenSemanal = calcularTotalSemanal(PlanillaTrabajadores);
            mostrarResumen(resumenSemanal, 'Resumen Semanal');
        });
    }
    
    if (btnMensual) {
        btnMensual.addEventListener('click', function() {
            const resumenMensual = calcularTotalMensual(PlanillaTrabajadores);
            mostrarResumen(resumenMensual, 'Resumen Mensual');
        });
    }
});

function mostrarResumen(datos, titulo) {
    // Asumiendo que tienes un elemento para mostrar los resultados
    const contenedor = document.getElementById('resultados');
    if (!contenedor) return;

    let html = `<h2>${titulo}</h2>`;
    html += '<ul>';
    
    datos.resumen.forEach(persona => {
        html += `<li>${persona.Nombre}: ${persona.horas}h ${persona.minutos}m</li>`;
    });
    
    html += '</ul>';
    html += `<p>Total: ${datos.total.horas}h ${datos.total.minutos}m</p>`;
    
    contenedor.innerHTML = html;
}
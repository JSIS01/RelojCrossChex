document.addEventListener("DOMContentLoaded", function () {
	document
		.getElementById("SubmitExcel")
		.addEventListener("change", handleFile, false)
})

// Función para manejar el archivo cargado
function handleFile() {
	const input = document.getElementById("SubmitExcel")

	const reader = new FileReader()
	reader.onload = function (e) {
		const data = new Uint8Array(e.target.result)
		const workbook = XLSX.read(data, { type: "array" })

		// Selecciona la primera hoja del archivo Excel
		const sheet_name_list = workbook.SheetNames
		const sheet = workbook.Sheets[sheet_name_list[0]]

		// Convierte la hoja a JSON
		const json_data = XLSX.utils.sheet_to_json(sheet)

		// Haz lo que quieras con el JSON, por ejemplo, imprímelo en la consola
		json_data.forEach((fila) => {
			const number = fila.Time
			const hours = Math.floor(number * 24)
			const minutes = Math.round((number * 24 - hours) * 60)

			const formattedTime = `${hours
				.toString()
				.padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
			fila.Time = formattedTime

			const baseDate = new Date("1900-01-01")
			const targetDate = new Date(
				baseDate.getTime() + (fila.Date - 2) * 24 * 60 * 60 * 1000
			)
			fila.Date = targetDate.toISOString().slice(0, 10)
		})

		const DatosAgrupadosPorNombre = json_data.reduce(
			(acumulador, objeto) => {
				const nombre = objeto.Name
				const fecha = objeto.Date

				if (!acumulador[nombre]) {
					acumulador[nombre] = {}
				}

				if (!acumulador[nombre][fecha]) {
					acumulador[nombre][fecha] = []
				}

				acumulador[nombre][fecha].push(objeto)
				return acumulador
			},
			{}
		)

		for (let Nombre in DatosAgrupadosPorNombre) {
			let Persona = DatosAgrupadosPorNombre[Nombre]
			for (let Fichaje in Persona) {
				let Fecha = DatosAgrupadosPorNombre[Nombre][Fichaje]
				let FichajesEnLaFecha = []
				for (let Dia in Fecha) {
					FichajesEnLaFecha.push(Fecha[Dia].Time)
				}

				let MinutosTrabajados = []
				// Calcula la diferencia de tiempo entre cada fichaje
				for (
					let index = 0;
					index < FichajesEnLaFecha.length;
					index += 2
				){
					let Hora1
					if (FichajesEnLaFecha[index]) {
						Hora1 = new Date(
							`2000-01-01T${FichajesEnLaFecha[index]}`
						)
					} else {
						Hora1 = new Date(`2000-01-01T00:00`)
					}

					let Hora2
					if (FichajesEnLaFecha[index + 1]) {
						Hora2 = new Date(
							`2000-01-01T${FichajesEnLaFecha[index + 1]}`
						)
					} else {
						Hora2 = isNaN(
							new Date(
								`2000-01-01T${FichajesEnLaFecha[index - 1]}`
							)
						)
							? new Date(`2000-01-01T${FichajesEnLaFecha[index]}`)
							: new Date(
									`2000-01-01T${FichajesEnLaFecha[index - 1]}`
							  )
					}

					const diferenciaMilisegundos =
						Hora1.getTime() - Hora2.getTime()
					let diferenciaEnMinutos =
						diferenciaMilisegundos / (1000 * 60)

					if (diferenciaEnMinutos < 0) {
						diferenciaEnMinutos = diferenciaEnMinutos * -1
					}

					MinutosTrabajados.push(diferenciaEnMinutos)
				}

				MinutosTrabajados = MinutosTrabajados.reduce((a, b) => a + b, 0)

				DatosAgrupadosPorNombre[Nombre][Fichaje].MinutosTrabajados=MinutosTrabajados
			}
		}

		PlanillaTrabajadores = DatosAgrupadosPorNombre
	}
	// Lee el archivo como un array buffer
	reader.readAsArrayBuffer(input.files[0])
}

let PlanillaTrabajadores;

document.getElementById("BotonMensual").addEventListener("click", () => {
	if (PlanillaTrabajadores == undefined) {
		alert("El archivo no tiene fichajes")
		return
	} else {
		CalcularMinutosTotales(PlanillaTrabajadores)
	}
})

function CalcularMinutosTotales(PlanillaTrabajadores_) {
	for (let Nombre in PlanillaTrabajadores_) {
		let TotalMinutosTrabajados = 0
		let Persona = PlanillaTrabajadores_[Nombre]
		let Errores = []
		for (let Fichaje in Persona) {
			if(Fichaje=="Errores"||Fichaje=="Semana"||Fichaje=="TotalMinutosTrabajados"){
				continue
			}
			let FichajeEnLaFecha = Persona[Fichaje]
			if (FichajeEnLaFecha.MinutosTrabajados == 0) {
				Errores.push(Persona[Fichaje][0].Date)
			}
			TotalMinutosTrabajados += FichajeEnLaFecha.MinutosTrabajados
		}
		Persona.Errores = Errores
		Persona.TotalMinutosTrabajados = TotalMinutosTrabajados
	}
	RellenarFront(PlanillaTrabajadores_)
}

function RellenarFront(PlanillaTrabajadores) {
	let html = ""
	function convertirMinutosAHorasYMinutos(minutos) {
		var horas = Math.floor(minutos / 60)
		var minutosRestantes = minutos % 60
		return { horas: horas, minutos: minutosRestantes }
	}

	for (let Nombre in PlanillaTrabajadores) {
		var resultado = convertirMinutosAHorasYMinutos(
			PlanillaTrabajadores[Nombre].TotalMinutosTrabajados
		)
		var errores = PlanillaTrabajadores[Nombre].Errores.length > 0
		html += `
		<div class="bg-white rounded-lg shadow-xl py-6 px-2 sm:w-1/6 w-5/12">
			<h2 class="text-purple-800 text-lg font-bold mb-2">${Nombre}</h2>
			${
				errores
					? PlanillaTrabajadores[Nombre].Errores.map(
							(element) =>
								`<p class="text-red-600 mb-4">${element}</p>`
					  ).join("")
					: `<p class="text-gray-600 mb-4">Fichaje correcto</p>`
			}
			<h3 class="bg-gradient-to-l from-purple-700 to-purple-800 text-white py-1 px-2 rounded-lg inline-block text-sm">${
				resultado.horas
			} Horas <span class="opacity-50">|</span> ${
			resultado.minutos
		} Minutos</h3>
		</div>
		`
	}

	document.getElementById("TarjetaInfo").innerHTML = html
}

//#region Semanales

document.getElementById("BotonSemanal").addEventListener("click", () => {
	if (PlanillaTrabajadores == undefined) {
		alert("El archivo no tiene fichajes")
		return
	} else {
		CalcularMinutosSemanales(PlanillaTrabajadores)
	}
})

function CalcularMinutosSemanales(PlanillaTrabajadores) {
	for (let Nombre in PlanillaTrabajadores) {
		let Persona = PlanillaTrabajadores[Nombre]
		//Fichajes dividos por dia de la semana
		let Semana = []
		//Errores de fichaje
		let Errores = []

		//Contador de dias de la semana
		let Contador =0
		//Numero de semana en el mes
		let NumeroDeSemana=0

		//Recorrer todos los fichajes de la persona
		for (let Fichaje in Persona) {
			if(Fichaje=="Errores"||Fichaje=="Semana"||Fichaje=="TotalMinutosTrabajados"){
				continue
			}

			if(Contador==0){
				Semana[NumeroDeSemana] = 0
			}
			//Fichaje en x fecha
			let FichajeEnLaFecha = Persona[Fichaje]
			//Si olvido fichar
			if(FichajeEnLaFecha.MinutosTrabajados==0){
				Errores.push(Persona[Fichaje][0].Date)
			}

			Semana[NumeroDeSemana]+=FichajeEnLaFecha.MinutosTrabajados
			Contador++
			if(Contador==6){
				Contador=0
				NumeroDeSemana++
			}
		}
		
		//Guarda en el objeto persona la semana
		Persona.Semana = Semana

		Persona.Errores=Errores
	}

	RellenarMinutosSemanales(PlanillaTrabajadores)
}

function RellenarMinutosSemanales(PlanillaTrabajadores) {
	console.log(PlanillaTrabajadores);
	let html = ""
	
	for(let Nombre in PlanillaTrabajadores){
		let Persona = PlanillaTrabajadores[Nombre]
		
		for(let IndexMinutos in Persona.Semana){
			Persona.Semana[IndexMinutos]=convertirMinutosAHorasYMinutos(Persona.Semana[IndexMinutos])
		}
		
		html += `
			<div class="bg-white rounded-lg shadow-xl py-6 px-2 sm:w-1/6 w-5/12">
				<h2 class="text-purple-800 text-lg font-bold mb-2">${Nombre}</h2>
				${
					Persona.Errores.length > 0
						? Persona.Errores.map(
								(element) =>
									`<p class="text-red-600 mb-4">${element}</p>`
						).join("")
						: `<p class="text-gray-600 mb-4">Fichaje correcto</p>`
				}
				${
					Persona.Semana.map((semana) =>
						`<p class="bg-gradient-to-l from-purple-700 to-purple-800 text-white py-1 px-2 rounded-lg inline-block text-sm" >En la semana ${Persona.Semana.indexOf(semana)+1} ficho <span class="text-white-700"> ${semana.horas} horas | Minutos: ${semana.minutos}</span></p>`
					)
				}
			</div>
		`
	}
	document.getElementById("TarjetaInfo").innerHTML = html

	// convertirMinutosAHorasYMinutos()
	function convertirMinutosAHorasYMinutos(minutos) {
		var horas = Math.floor(minutos / 60)
		var minutosRestantes = minutos % 60
		return { horas: horas, minutos: minutosRestantes }
	}

}

//#endregion

document.getElementById("bg-change").addEventListener("click", () => {
	const img = document.createElement("img")
	img.id = "img-bg"
	img.classList.add("hidden")
	img.src = "./src/bg.jpg"
	img.style.position = "absolute"
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
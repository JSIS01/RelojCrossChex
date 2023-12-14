document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('SubmitExcel').addEventListener('change', handleFile, false);
})

// Función para manejar el archivo cargado
function handleFile() {
    const input = document.getElementById('SubmitExcel');
  
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
  
      // Selecciona la primera hoja del archivo Excel
      const sheet_name_list = workbook.SheetNames;
      const sheet = workbook.Sheets[sheet_name_list[0]];
  
      // Convierte la hoja a JSON
      const json_data = XLSX.utils.sheet_to_json(sheet);
  
      // Haz lo que quieras con el JSON, por ejemplo, imprímelo en la consola
      json_data.forEach(fila => {
        const number = fila.Time;
        const hours = Math.floor(number * 24);
        const minutes = Math.round((number * 24 - hours) * 60);

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        fila.Time = formattedTime;

        const baseDate = new Date('1900-01-01');
        const targetDate = new Date(baseDate.getTime() + (fila.Date - 2) * 24 * 60 * 60 * 1000);
        fila.Date = targetDate.toISOString().slice(0, 10);
    })

    const DatosAgrupadosPorNombre = json_data.reduce((acumulador, objeto) => {
        const nombre = objeto.Name;
        const fecha = objeto.Date;

        if (!acumulador[nombre]) {
            acumulador[nombre] = {};
        }

        if (!acumulador[nombre][fecha]) {
            acumulador[nombre][fecha] = [];
        }

        acumulador[nombre][fecha].push(objeto);
        return acumulador;
    }, {}); 

    for (let Nombre in DatosAgrupadosPorNombre) {
        let Persona=DatosAgrupadosPorNombre[Nombre];
        for (let Fichaje in Persona) {
            let Fecha = DatosAgrupadosPorNombre[Nombre][Fichaje];
            let MinutosTrabajados=0;
            let Auxiliar=0;
            for(let Dia in Fecha){
                if (Auxiliar==0) {
                    Auxiliar=Fecha[Dia].Time;
                }else{
                    (Fecha[Dia].Time-=Auxiliar)*-1;
                }
            }
            DatosAgrupadosPorNombre[Nombre][Fichaje].push(MinutosTrabajados);
        }
    }

    console.log(DatosAgrupadosPorNombre);
 
};

// Lee el archivo como un array buffer
reader.readAsArrayBuffer(input.files[0]);

}
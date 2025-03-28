import dayjs from 'dayjs';

export function cantidadQuincenas(fecha1) {
  const fechaInicio = dayjs(fecha1);
  const fechaActual = dayjs();

  /* Quisiera hacer una función parecida a esta que reciba dos parámetros fecha1 y cantQuincenas
    Teniendo en cuenta que los cortes de fecha tal como en esta función son los 15 y 30 de cada mes
    (con la excepción de febrero que serían 29 o 28 días), y los meses que terminan en 31 igualmente se toma el 30 como fecha de corte
    si fecha 1 es una fecha de corte, es decir un 15 o 30, comenzamos a contar a partir de la siguiente fecha de corte
    y vas a contar el valor de cantQuincenas
    el valor resultante es la fecha de corte en la que se termina, y ese es el valor a retornar
    Te pondré 2 ejemplos
    suponemos que fecha1 es 15 de enero 2024 y cantQuincenas es 6, entonces
    15 de enero 2024 "no se cuenta, ya que es fecha de corte" contador = 0
    30 de enero - contador = 1
    15 de febrero - contador = 2
    29 de febrero - contador = 3
    15 de marzo - contador = 4
    30 de marzo - contador = 5
    15 de abril - contador = 6 (termina) y devuelve 15-04-2024

    ahora suponemos otro ejemplo
    fecha1 es 29 de enero 2024 y cantQuincenas es 6, entonces
    29 de enero 2024 "no se cuenta, ya que es no es fecha de corte, busca siguiente corte- contador = 0
    30 de enero - contador = 1
    15 de febrero - contador = 2
    29 de febrero - contador = 3
    15 de marzo - contador = 4
    30 de marzo - contador = 5
    15 de abril - contador = 6 (termina) y devuelve 15-04-2024
  */
  // Inicializar contador de quincenas
  let quincenasTranscurridas = 0;
  
  // Calcular la primera fecha quincena después de fecha1
  let fechaIteracion;
  
  // Si estamos en un día 15 o 30/último día del mes, comenzamos desde la siguiente fecha
  if (fechaInicio.date() === 15) {
    // Si es día 15, la próxima fecha quincena es el fin de mes
    const ultimoDia = fechaInicio.endOf('month').date();
    fechaIteracion = fechaInicio.date(ultimoDia > 30 ? 30 : ultimoDia);
  } else if (fechaInicio.date() === 30 || fechaInicio.date() === fechaInicio.endOf('month').date()) {
    // Si es fin de mes (30 o último día), la próxima fecha quincena es el 15 del siguiente mes
    fechaIteracion = fechaInicio.add(1, 'month').date(15);
  } else if (fechaInicio.date() < 15) {
    // Si es antes del 15, la próxima fecha quincena es el 15 del mes actual
    fechaIteracion = fechaInicio.date(15);
  } else {
    // Si es después del 15 (pero no el 30 o último día), la próxima fecha es fin de mes
    const ultimoDia = fechaInicio.endOf('month').date();
    fechaIteracion = fechaInicio.date(ultimoDia > 30 ? 30 : ultimoDia);
  }
  
  // Iterar y contar quincenas hasta la fecha actual
  while (fechaIteracion.isBefore(fechaActual)) {
    quincenasTranscurridas++;
    
    // Avanzar a la siguiente fecha quincena
    if (fechaIteracion.date() === 15) {
      // Si estamos en el 15, avanzamos al fin de mes
      const ultimoDia = fechaIteracion.endOf('month').date();
      fechaIteracion = fechaIteracion.date(ultimoDia > 30 ? 30 : ultimoDia);
    } else {
      // Si estamos en fin de mes, avanzamos al 15 del siguiente mes
      fechaIteracion = fechaIteracion.add(1, 'month').date(15);
    }
  }

  return quincenasTranscurridas;
}

export const calcularDiasAtraso = (cantLetrasDebe, fechasCorte) => {
  if (cantLetrasDebe <= 0) return 0;
  if (!fechasCorte) return 0;


  const today = dayjs();
  const todayDate = today.date();
  
  // Check if today matches one of the cut-off dates
  if (todayDate === fechasCorte.primero || todayDate === fechasCorte.segundo) {
    if (cantLetrasDebe > 0) {
      cantLetrasDebe -= 1;
    }
    
    // If no more overdue payments after reduction, return 0
    if (cantLetrasDebe <= 0) return 0;
  }
  
  const ayer = today.subtract(1, 'day');
  let fechaActual = ayer;
  let diasTotal = 0;
  let letrasContadas = 0;
  
  while (letrasContadas < cantLetrasDebe) {
    // Encontrar la fecha de corte anterior más cercana
    let fechaCorteAnterior;
    const dia = fechaActual.date();
    const mes = fechaActual.month();
    const anio = fechaActual.year();
    
    if (dia <= fechasCorte.primero) {
      // Si estamos antes o en el primer corte del mes, ir al segundo corte del mes anterior
      const mesAnterior = fechaActual.subtract(1, 'month');
      if (mesAnterior.daysInMonth() < fechasCorte.segundo) {
        // Si el mes anterior no tiene suficientes días (ej. febrero)
        fechaCorteAnterior = dayjs(new Date(mesAnterior.year(), mesAnterior.month(), mesAnterior.daysInMonth()));
      } else {
        fechaCorteAnterior = dayjs(new Date(mesAnterior.year(), mesAnterior.month(), fechasCorte.segundo));
      }
    } else if (dia <= fechasCorte.segundo) {
      // Si estamos entre el primer y segundo corte, ir al primer corte del mismo mes
      fechaCorteAnterior = dayjs(new Date(anio, mes, fechasCorte.primero));
    } else {
      // Si estamos después del segundo corte, ir al segundo corte del mismo mes
      fechaCorteAnterior = dayjs(new Date(anio, mes, fechasCorte.segundo));
    }
    
    // Calcular días entre la fecha actual y la fecha de corte anterior
    const diasEntreFechas = fechaActual.diff(fechaCorteAnterior, 'day');
    diasTotal += diasEntreFechas;
    
    // Mover la fecha actual a la fecha de corte anterior (sin restar un día)
    fechaActual = fechaCorteAnterior;
    letrasContadas++;
  }
  
  return diasTotal;
};

export function cantidadQuincenasJubilados(fecha1, fechasCorte = { primero: 5, segundo: 20 }) {
  const fechaInicio = dayjs(fecha1);
  const fechaActual = dayjs();

  // Inicializar contador de quincenas
  let quincenasTranscurridas = 0;
  let fechaIteracion = fechaInicio.clone();
  
  // Función para obtener la fecha del segundo corte (ajustada si es necesario)
  const getFechaSegundoCorte = (fecha) => {
    const ultimoDia = fecha.endOf('month').date();
    // Si el segundo corte es mayor que los días del mes, usamos el último día
    if (fechasCorte.segundo > ultimoDia) {
      return fecha.endOf('month');
    }
    // Si el mes tiene más días que el segundo corte, usamos ese valor
    return fecha.date(fechasCorte.segundo);
  };
  
  // Determinar la primera fecha quincenal a considerar
  if (fechaInicio.date() <= fechasCorte.primero) {
    // Si es el día del primer corte o anterior, contamos a partir del primer corte
    fechaIteracion = fechaInicio.date(fechasCorte.primero);
    // Si la fecha de inicio es exactamente el primer corte, avanzamos a la siguiente quincena
    if (fechaInicio.date() === fechasCorte.primero) {
      // Avanzamos al segundo corte
      fechaIteracion = getFechaSegundoCorte(fechaInicio);
    }
  } else {
    // Si es posterior al primer corte, contamos a partir del segundo corte
    fechaIteracion = getFechaSegundoCorte(fechaInicio);
  }
  
  // Si la fecha ajustada es menor o igual a la fecha de inicio, no la contamos y avanzamos
  if (fechaIteracion.isSame(fechaInicio) || fechaIteracion.isBefore(fechaInicio)) {
    if (fechaIteracion.date() === fechasCorte.primero) {
      fechaIteracion = getFechaSegundoCorte(fechaIteracion);
    } else {
      fechaIteracion = fechaIteracion.add(1, 'month').date(fechasCorte.primero);
    }
  }
  
  // Iterar hasta la fecha actual, contando quincenas
  while (fechaIteracion.isBefore(fechaActual) || fechaIteracion.isSame(fechaActual, 'day')) {
    quincenasTranscurridas++;
    
    if (fechaIteracion.date() === fechasCorte.primero) {
      fechaIteracion = getFechaSegundoCorte(fechaIteracion);
    } else {
      fechaIteracion = fechaIteracion.add(1, 'month').date(fechasCorte.primero);
    }
  } 

  return quincenasTranscurridas;
}

export function redondear(num) {
  return (num % 1) >= 0.9 ? Math.ceil(num) : Math.floor(num);
}

export function quitarCentavo(montoNum, cuotaNum) {
  if (cuotaNum === 0) return 0; // Evitar división por cero

  let resultado = montoNum / cuotaNum;
  let decimal = resultado - Math.floor(resultado);

  if (decimal > 0 && decimal <= 0.01) {
    return Math.floor(resultado); // Quitar el centavo si es exactamente un centavo extra
  } else {
    return Math.ceil(resultado); // Redondear hacia arriba si es mayor a un centavo
  }
}



export const calcularDiasAtrasoJubilados = (cantLetrasDebe, fechasCorte) => {
  if (cantLetrasDebe <= 0) return 0;
  if (!fechasCorte) return 0;
  
  const today = dayjs();
  const todayDate = today.date();
  
  // Crear un array de fechas de corte ordenadas hacia atrás en el tiempo
  let fechasDeCorte = [];
  let fechaActual = today.clone();
  let mesActual = fechaActual.month();
  let anioActual = fechaActual.year();
  
  // Generar suficientes fechas de corte hacia atrás para cubrir cantLetrasDebe
  for (let i = 0; i < cantLetrasDebe + 2; i++) {
    // Añadir el segundo corte del mes (normalmente día 20)
    let segundoCorte = dayjs(new Date(anioActual, mesActual, fechasCorte.segundo));
    
    // Verificar si el segundo corte es válido (por ejemplo, febrero podría no tener día 30)
    if (fechasCorte.segundo > segundoCorte.daysInMonth()) {
      segundoCorte = dayjs(new Date(anioActual, mesActual, segundoCorte.daysInMonth()));
    }
    
    fechasDeCorte.push(segundoCorte);
    
    // Añadir el primer corte del mes (normalmente día 5)
    fechasDeCorte.push(dayjs(new Date(anioActual, mesActual, fechasCorte.primero)));
    
    // Retroceder al mes anterior
    mesActual--;
    if (mesActual < 0) {
      mesActual = 11; // Diciembre
      anioActual--;
    }
  }
  
  // Ordenar fechas de más reciente a más antigua
  fechasDeCorte.sort((a, b) => b.valueOf() - a.valueOf());
  
  // Filtrar fechas que sean mayores que hoy
  fechasDeCorte = fechasDeCorte.filter(fecha => 
    fecha.isBefore(today) || fecha.isSame(today, 'day')
  );
  
  // Si hoy coincide con una fecha de corte, no contarla como atraso
  let indiceInicial = 0;
  if (fechasDeCorte.length > 0 && fechasDeCorte[0].date() === todayDate) {
    indiceInicial = 1;
    cantLetrasDebe--; // Reducimos una letra si hoy es fecha de corte
    
    // Si ya no quedan letras por contar, retornamos 0
    if (cantLetrasDebe <= 0) return 0;
  }
  
  // Calcular días de atraso
  let diasTotal = 0;
  let letrasContadas = 0;
  
  for (let i = indiceInicial; i < fechasDeCorte.length && letrasContadas < cantLetrasDebe; i++) {
    let diasAtraso = 0;
    
    if (i === indiceInicial) {
      // Para la primera fecha, contar días desde hoy hasta esa fecha
      diasAtraso = today.diff(fechasDeCorte[i], 'day');
    } else {
      // Para el resto, contar días entre la fecha anterior y esta
      diasAtraso = fechasDeCorte[i-1].diff(fechasDeCorte[i], 'day');
    }
    
    diasTotal += diasAtraso;
    letrasContadas++;
  }
  
  return diasTotal;
};

export function calcularFechaVencida(fecha1, cantQuincenas) {
  let fechaIteracion = dayjs(fecha1);
  let contador = 1;
  if(cantQuincenas <= 1) return fechaIteracion.format("DD-MM-YYYY");

  // Determinar la primera fecha de corte
  const dia = fechaIteracion.date();
  const ultimoDiaMes = fechaIteracion.endOf("month").date();

  if (dia === 15) {
    // Si es día 15, empezamos a contar desde el 30 o el último día del mes
    fechaIteracion = fechaIteracion.date(ultimoDiaMes > 30 ? 30 : ultimoDiaMes);
  } else if (dia >= 28 && dia <= 31) {
    // Si es día 30 o el último día del mes, empezamos desde el 15 del próximo mes
    fechaIteracion = fechaIteracion.add(1, "month").date(15);
  } else if (dia < 15) {
    // Si es antes del 15, la próxima fecha quincena es el 15 del mes actual
    fechaIteracion = fechaIteracion.date(15);
  } else {
    // Si está entre 16 y 29, la siguiente quincena es el fin de mes
    fechaIteracion = fechaIteracion.date(ultimoDiaMes > 30 ? 30 : ultimoDiaMes);
  }

  // Contar quincenas
  while (contador < cantQuincenas) {
    contador++;

    if (fechaIteracion.date() === 15) {
      // Si estamos en el 15, avanzamos al 30 o al último día del mes
      const ultimoDia = fechaIteracion.endOf("month").date();
      fechaIteracion = fechaIteracion.date(ultimoDia > 30 ? 30 : ultimoDia);
    } else {
      // Si estamos en el 30 o fin de mes, avanzamos al 15 del siguiente mes
      fechaIteracion = fechaIteracion.add(1, "month").date(15);
    }
  }

  return fechaIteracion.format("DD-MM-YYYY");
}

export function calcularFechaVencidaJubilados(fecha1, cantQuincenas) {
  let fechaIteracion = dayjs(fecha1);
  let contador = 1;

  if (cantQuincenas <= 1) return fechaIteracion.format("DD-MM-YYYY");

  // Determinar la primera fecha de corte
  const dia = fechaIteracion.date();

  if (dia === 5) {
    // Si la fecha es un día 5, empezamos a contar desde el 20 del mes
    fechaIteracion = fechaIteracion.date(20);
  } else if (dia === 20) {
    // Si la fecha es un día 20, empezamos a contar desde el 5 del siguiente mes
    fechaIteracion = fechaIteracion.add(1, "month").date(5);
  } else if (dia < 5) {
    // Si es antes del 5, la próxima fecha quincena es el 5 del mes actual
    fechaIteracion = fechaIteracion.date(5);
  } else if (dia > 5 && dia < 20) {
    // Si es después del 5 pero antes del 20, la siguiente fecha es el 20 del mes actual
    fechaIteracion = fechaIteracion.date(20);
  } else {
    // Si es después del 20, la siguiente fecha es el 5 del siguiente mes
    fechaIteracion = fechaIteracion.add(1, "month").date(5);
  }

  // Contar quincenas
  while (contador < cantQuincenas) {
    contador++;

    if (fechaIteracion.date() === 5) {
      // Si estamos en el 5, avanzamos al 20 del mismo mes
      fechaIteracion = fechaIteracion.date(20);
    } else {
      // Si estamos en el 20, avanzamos al 5 del siguiente mes
      fechaIteracion = fechaIteracion.add(1, "month").date(5);
    }
  }

  return fechaIteracion.format("DD-MM-YYYY");
}

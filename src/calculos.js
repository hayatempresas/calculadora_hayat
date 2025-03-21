import dayjs from 'dayjs';

export function cantidadQuincenas(fecha1) {
  const fechaInicio = dayjs(fecha1);
  const fechaActual = dayjs();

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
  
  /*En esta función estoy calculando mal los cuando los cortes son 5 y 20, pondré un ejemplo
    si la fecha1 = 14 diciembre 2024, la primera fecha de inicio debería ser el 20 de diciembre por lo tanto se contaría
    quincenasTranscurridas = 0
    20 diciembre 2024 sería quincenasTranscurridas = 1
    05 enero 2025 sería quincenasTranscurridas = 2
    20 enero 2025 sería quincenasTranscurridas = 3
    05 febrero 2025 sería quincenasTranscurridas = 4
    20 febrero 2025 sería quincenasTranscurridas = 5
    05 marzo 2025 sería quincenasTranscurridas = 6
    20 marzo 2025 sería quincenasTranscurridas = 7
  */

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

import './calculadora.css';
import { useState, useRef, useEffect } from 'react';
import { Radio, RadioGroup, FormControlLabel, FormControl, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs'; 
import 'dayjs/locale/es';
import { cantidadQuincenas, calcularDiasAtraso, cantidadQuincenasJubilados, redondear, calcularDiasAtrasoJubilados, quitarCentavo} from './calculos';

function Calculadora() {
  const [monto, setMonto] = useState('');
  const [fechaCredito, setFechaCredito] = useState(null);
  const [cuota, setCuota] = useState('');
  const [saldo, setSaldo] = useState('');
  const [esJubilado, setEsJubilado] = useState("no");
  const [omitirLetra, setOmitirLetra] = useState("no");
  const [letraOmitida, setLetraOmitida] = useState(0);
  const montoRef = useRef(null);

  const [letras, setLetras] = useState('');
  const [plan, setPlan] = useState('');
  const [letrasPasadas, setLetrasPasadas] = useState('');
  const [estado, setEstado] = useState('');
  const [letrasPagas, setLetrasPagas] = useState('');
  const [letrasAtraso, setLetrasAtraso] = useState('');
  const [diasAtraso, setDiasAtraso] = useState('');
  const [montoAtraso, setMontoAtraso] = useState('');
  const [errores, setErrores] = useState({ monto: false, fechaCredito: false, cuota: false, saldo: false });


  const [open, setOpen] = useState(false);
  const [mensaje, setMensaje] = useState('')

  const handleMonto = (e) => {
    setErrores(prev => ({ ...prev, monto: false }));
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setMonto(value);
    }
  };
  const handleCuota = (e) => {
    setErrores(prev => ({ ...prev, cuota: false }));
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCuota(value);
    }
  };

  const handleJubilado = (e) => {
    const value = e.target.value;
    setEsJubilado(value)
  }

  const handleOmitirLetra = (e) => {
    const value = e.target.value;
    setOmitirLetra(value)
    if(value === "si"){
      setLetraOmitida(1)
    }else if(value === "no"){
      setLetraOmitida(0)
    }
  }

  const handleSaldo = (e) => {
    setErrores(prev => ({ ...prev, saldo: false }));
    const value = e.target.value;
    limpiaAdeudo();
    if (/^\d*\.?\d*$/.test(value)) {
      setSaldo(value);
    }
  };
  const handleClose = () => setOpen(false);

  const validarMonto = () => {
    if (!monto || monto < 10 || monto > 20000) {
      setMensaje("Monto Crédito no válido");
      //setOpen(true);
      setErrores(prev => ({ ...prev, monto: true }));
    } else{
      setErrores(prev => ({ ...prev, monto: false }));
    }
  };

  const validarFechaCredito = () => {
    const yearActual = dayjs().year();
    const yearCredito = dayjs(fechaCredito).year();
    if (!fechaCredito || !dayjs(fechaCredito).isValid() || yearCredito < 2020 || yearCredito > yearActual) {
      setMensaje("Fecha del crédito incorrecta");
      //setOpen(true);
      setErrores(prev => ({ ...prev, fechaCredito: true }));
    } else{
      setErrores(prev => ({ ...prev, fechaCredito: false }));
    }
  };

  const validarCuota = () => {
    const cuotaNum = parseFloat(cuota);
    if (isNaN(cuotaNum) || cuotaNum < 1 || cuotaNum > 10000 || cuotaNum > parseFloat(monto)) {
      setMensaje("Cuota incorrecta");
      //setOpen(true);
      setErrores(prev => ({ ...prev, cuota: true }));
    }else{
      setErrores(prev => ({ ...prev, cuota: false }));
    }
  };

  const validarSaldo = () => {
    const saldoNum = parseFloat(saldo);
    if (isNaN(saldoNum) || saldoNum < 0 || saldoNum > 20000 || saldoNum > parseFloat(monto)) {
      setMensaje("Saldo incorrecto");
      //setOpen(true);
      setErrores(prev => ({ ...prev, saldo: true }));
    }else{
      setErrores(prev => ({ ...prev, saldo: false }));
    }
  };

  
  const handleReset = () => {
    setTimeout(() => {
      if (montoRef.current) {
        montoRef.current.focus();
      }
    }, 0);
    setMonto('');
    setFechaCredito(null);
    setCuota('');
    setSaldo('');
    setEsJubilado('no');
    setOmitirLetra('no');
    setLetrasPagas('');
    setLetrasPasadas('')
    setEstado('')
    setLetrasAtraso('');
    setMontoAtraso('');
    setDiasAtraso('');
  
    
    setErrores({ monto: false, fechaCredito: false, cuota: false, saldo: false });
    setOpen(false);    
  };

  const calculaPlan = (monto1, cuota1) => {
    const cuotaNum = parseFloat(cuota1);
    const montoNum = parseFloat(monto);
    /*let montoNum = parseFloat(monto);
    if (montoNum % 1 !== 0) {
        montoNum = Math.floor(montoNum * 100 - 1) / 100; 
    }*/
  
    const cantidadLetras = quitarCentavo(montoNum , cuotaNum);
    if(cantidadLetras > 80){
      setLetras('');
      setPlan('');
      return;
    }
    setLetras(cantidadLetras);
    const planMeses = Math.ceil(cantidadLetras / 2);    
    setPlan(`${planMeses} ${planMeses === 1 ? 'Mes' : 'Meses'}`);
  }
  const calculaEstado = () => {

    let montoNum = parseFloat(monto);
    const cuotaNum = parseFloat(cuota);

    if (montoNum % 1 !== 0) {
        montoNum = Math.floor(montoNum * 100 - 1) / 100; 
    }
    const cantidadLetras = Math.ceil(montoNum / cuotaNum);
    let quincenasTranscurridas = 0;
    
    if(esJubilado === "no"){
      quincenasTranscurridas = cantidadQuincenas(fechaCredito);
    }else if (esJubilado === "si"){
      console.log("jubilado")
      quincenasTranscurridas = cantidadQuincenasJubilados(fechaCredito);
    }
    
    setLetrasPasadas(quincenasTranscurridas.toString());
    
    if (quincenasTranscurridas > cantidadLetras) {
      setEstado("Cuenta Vencida");
    } else {
      setEstado("Plan Vigente");
    }

    if (saldo) {
      calcularSaldo()
    } else {
      limpiaAdeudo();
    }
        
  }

  const calcularSaldo = () =>{
    const saldoNum = parseFloat(saldo);
    const montoNum = parseFloat(monto);
    /*let montoNum = parseFloat(monto);
    if (montoNum % 1 !== 0) {
        montoNum = Math.floor(montoNum * 100 - 1) / 100; 
    }*/
    const cuotaNum = parseFloat(cuota);
    const cantidadLetras = Math.ceil(montoNum / cuotaNum);    


    let quincenasTranscurridas = 0;
    
    if(esJubilado === "no"){
      quincenasTranscurridas = cantidadQuincenas(fechaCredito);
    }else if (esJubilado === "si"){
      quincenasTranscurridas = cantidadQuincenasJubilados(fechaCredito);
    }

    
      //console.log(`Saldo ${saldoNum} Monto ${montoNum}`)
      if(saldoNum > montoNum){
        limpiaAdeudo();
        return;
      }
      const pagado = montoNum - saldoNum;
      console.log(`pagado de verdad ${pagado / cuotaNum}`)
      const letrasPagadas = redondear(pagado / cuotaNum);
      let cantLetrasDebe = 0;
      console.log(`quincenas ${quincenasTranscurridas} monto ${montoNum} saldo ${saldoNum} pagado ${pagado} letras pagadas ${letrasPagadas}`)

      const remanenteMonto = Math.max(0, pagado - (cuotaNum * letrasPagadas));
      console.log(`remanente ${remanenteMonto}`)

      cantLetrasDebe =  Math.max(0, quincenasTranscurridas - letrasPagadas - letraOmitida);
      
      setLetrasPagas(letrasPagadas.toString());
      // Calcular letras en atraso
      const letrasDeberiaPagar = Math.min(quincenasTranscurridas, cantidadLetras);
      const letrasAtrasadas = Math.max(0, letrasDeberiaPagar - letrasPagadas - letraOmitida);
      setLetrasAtraso(letrasAtrasadas.toString());

      if (letrasAtrasadas > 0) {
        let montoAtrasado = 0;

        if(quincenasTranscurridas > cantidadLetras){
          montoAtrasado = saldoNum;
        }else{
          montoAtrasado = Math.min(saldoNum, ((letrasAtrasadas * cuotaNum) - remanenteMonto));
        }
        
        setMontoAtraso(montoAtrasado.toFixed(2));
        
        //const diasAtrasados = calcularDiasAtraso(cantLetrasDebe);

        console.log(`cantLetrasDebe ${cantLetrasDebe}`)
        let diasAtrasados = 0;
        if(esJubilado==="si"){
          diasAtrasados = calcularDiasAtrasoJubilados(cantLetrasDebe, { primero: 5, segundo: 20 });
        }else{
          diasAtrasados = calcularDiasAtraso(cantLetrasDebe, { primero: 15, segundo: 30 });
        }
        
        setDiasAtraso(diasAtrasados.toString());

      } else {
        setMontoAtraso('0.00');
        setDiasAtraso('0');
      }
  }

  const handleCalcular = () => {    
    if (!monto || !cuota || errores.monto || errores.cuota) {
      return;
    }

    if (monto && cuota && fechaCredito && !errores.monto && !errores.cuota && !errores.fechaCredito){
      calculaPlan(monto, cuota);
      calculaEstado();
    }else if (monto && cuota && !errores.monto && !errores.cuota){
      limpiaFechas();
      calculaPlan(monto, cuota);
    }   
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const limpiaPlanes = () =>{
      setLetras('');
      setPlan('');
  }
  const limpiaFechas = () =>{
    setLetrasPasadas('');
    setEstado('');
  }
  const limpiaAdeudo = () =>{
      setLetrasPagas('');
      setLetrasAtraso('');
      setMontoAtraso('');
      setDiasAtraso('');
  }

  useEffect(()=>{
    if (monto && cuota && fechaCredito && !errores.monto && !errores.cuota && !errores.fechaCredito) {
      const montoNum = parseFloat(monto);
      const cuotaNum = parseFloat(cuota);
      if(montoNum > cuotaNum){        
        handleCalcular();
      }else{
        limpiaPlanes()
        limpiaAdeudo()
        return;
      }
      handleCalcular();
    }else if(monto && cuota && !errores.monto && !errores.cuota) {
      const montoNum = parseFloat(monto);
      const cuotaNum = parseFloat(cuota);
      if(montoNum > cuotaNum){        
        handleCalcular();
      }else{
        setLetras('');
        setPlan('');
        return;
      }
    }else{
      setLetras('');
      setPlan('');
      return;
    }
  },[monto, fechaCredito, cuota, esJubilado, letraOmitida])

  return (
    <section className="section-calculadora">
      <div className="container-calculadora">
        <div className="calc-mensaje">
          <Snackbar
              open={open}
              autoHideDuration={2500}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top', // Ajusta la posición vertical dentro del contenedor
                horizontal: 'center', // Ajusta la posición horizontal dentro del contenedor
              }}
              sx={{
                position: 'absolute',
                top: '0', 
                left: '50%',
                width: '70%',
                transform: 'translateX(-50%)', 
                transform: 'translateY(-100%)'
              }}
            >
            <Alert onClose={handleClose} severity="warning" variant="filled" sx={{ width: '100%' }}>
              {mensaje}
            </Alert>
          </Snackbar>
        </div>
        <div className="calc-header">
          <div className="calc-header-logo">
            <picture>
              <source srcSet="./logo.webp" type="image/webp" />
              <img src="./logo.png" alt="Logo" />
            </picture>
          </div>
        </div>
        <h1>Calculadora Hayat</h1>
        <section className="section-entradas">
          <div className="calc-row-reset">
            <button onClick={handleReset}>Reset | Esc</button>
          </div>
          <div className="row-input">
            <span>Monto Crédito</span>
            <input 
              type="text" 
              name="monto" 
              id="monto" 
              placeholder="Total Crédito" 
              value={monto} 
              maxLength={8} 
              onChange={handleMonto}
              onBlur={validarMonto}
              ref={montoRef}
              className={errores.monto ? "input-warning" : ""}
            />
          </div>
          <div className="row-input">
            <span>Fecha Crédito</span>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker
                value={fechaCredito}
                onChange={(newValue) => setFechaCredito(newValue)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    variant: "outlined",
                    className: errores.fechaCredito ? "input-warning custom-datepicker" : "custom-datepicker",
                    sx: { input: { cursor: "pointer" } },
                    onBlur: validarFechaCredito
                  },
                  popper: {
                    disablePortal: false
                  },
                  field: {
                    clearable: true,
                    readOnly: false
                  }
                }}
                format="DD/MM/YYYY"
              />
            </LocalizationProvider>
          </div>
          <div className="row-input">
            <span>Cuota</span>
            <input 
              type="text" 
              name="cuota" 
              id="cuota" 
              placeholder="Monto Cuota" 
              value={cuota} 
              maxLength={6}
              onChange={handleCuota}
              onBlur={validarCuota}
              className={errores.cuota ? "input-warning" : ""}
            />
          </div>
          <div className="row-separador"></div>
          <div className="row-input-saldo">
            <span>Saldo Actual</span>
            <input 
              type="text" 
              name="saldo" 
              id="saldo" 
              placeholder="Saldo" 
              value={saldo} 
              maxLength={8}
              onChange={handleSaldo}
              onBlur={validarSaldo}
              onKeyDown={(e) => e.key === "Enter" && handleCalcular()}
              className={errores.saldo ? "input-warning" : ""}
            />
            <button onClick={handleCalcular}>=</button>
          </div>

          <div className="row-input">
            <span>¿Es Jubilado?</span>
            <div className="row-radios">
              <FormControl component="fieldset">
                <RadioGroup row value={esJubilado} onChange={handleJubilado}>
                  <FormControlLabel value="no" control={<Radio className="custom-radio" />} label="No" />
                  <FormControlLabel value="si" control={<Radio className="custom-radio" />} label="Sí" />
                </RadioGroup>
              </FormControl>
            </div>
          </div>
          <div className="row-input">
            <span>¿Omitir última letra?</span>
            <div className="row-radios">
              <FormControl component="fieldset">
                <RadioGroup row value={omitirLetra} onChange={handleOmitirLetra}>
                  <FormControlLabel value="no" control={<Radio className="custom-radio" />} label="No" />
                  <FormControlLabel value="si" control={<Radio className="custom-radio" />} label="Sí" />
                </RadioGroup>
              </FormControl> 
            </div>
          </div>
        </section>
      </div>
      <div className="container-resultados">
        <div className="resultados-h1">
          <h1>Resultados</h1>
        </div>
        <div className="row-resultados-sub">
          <div className="resultado-sub1"></div>
          <div className="resultado-sub2">Letras/Quincenas</div>
          <div className="resultado-sub3">Plan</div>
        </div>
        <div className="row-resultados-des">
          <div className="resultado-des1">Plan Crediticio</div>
          <div className="resultado-des2">{letras}</div>
          <div className="resultado-des3">{plan}</div>
        </div>
        <div className="row-resultados-sub">
          <div className="resultado-sub1"></div>
          <div className="resultado-sub2">Quincenas Transcurridas</div>
          <div className="resultado-sub3">Estado</div>
        </div>
        <div className="row-resultados-des">
          <div className="resultado-des1">Estado del Crédito</div>
          <div className="resultado-des2">{letrasPasadas}</div>
          <div className="resultado-des3">{estado}</div>
        </div>        
        <div className="row-resultados-sub">
          <div className="resultado-sub1"></div>
          <div className="resultado-sub2">Quincenas Pagas</div>
          <div className="resultado-sub3">Letras Atrasadas</div>
        </div>
        <div className="row-resultados-des">
          <div className="resultado-des1">Del Compromiso</div>
          <div className="resultado-des2">{letrasPagas}</div>
          <div className="resultado-des3">{letrasAtraso}</div>
        </div>
        <div className="row-resultados-sub">
          <div className="resultado-sub1"></div>
          <div className="resultado-sub2">Días de atraso</div>
          <div className="resultado-sub3">Monto Atrasado</div>
        </div>
        <div className="row-resultados-des">
          <div className="resultado-des1">Datos de atraso</div>
          <div className="resultado-des2">{diasAtraso}</div>
          <div className="resultado-des3">{montoAtraso}</div>
        </div>
      </div>
    </section>
  );
}

export default Calculadora;
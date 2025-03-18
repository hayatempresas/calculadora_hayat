import './calculadora.css';
import { useState } from 'react';
import { Radio, RadioGroup, FormControlLabel, FormControl, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

function Calculadora() {
  const [monto, setMonto] = useState('');
  const [fechaCredito, setFechaCredito] = useState(null);
  const [cuota, setCuota] = useState('');
  const [saldo, setSaldo] = useState('');
  const [ultimoPago, setUltimoPago] = useState(null);
  const [esJubilado, setEsJubilado] = useState("no");
  const [omitirLetra, setOmitirLetra] = useState("no");

  // Función para manejar cambios en los inputs numéricos
  const handleChangeNumerico = (setter) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleReset = () => {
    setMonto('');
    setFechaCredito(null);
    setCuota('');
    setSaldo('');
    setUltimoPago(null);
    setEsJubilado('no');
    setOmitirLetra('no');
  };

  return (
    <section className="section-calculadora">
      <div className="container-calculadora">
        <div className="calc-header">
          <div className="calc-header-logo">
            <picture>
              <source srcSet="./logo.webp" type="image/webp" />
              <img src="./logo.png" alt="Logo" />
            </picture>
          </div>
        </div>
        <h1>Calculadora</h1>
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
              onChange={handleChangeNumerico(setMonto)}
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
                    className: "custom-datepicker",
                    sx: { input: { cursor: "pointer" } }
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
              onChange={handleChangeNumerico(setCuota)}
            />
          </div>
          <div className="row-separador"></div>
          <div className="row-input">
            <span>Saldo Actual</span>
            <input 
              type="text" 
              name="saldo" 
              id="saldo" 
              placeholder="Saldo" 
              value={saldo} 
              maxLength={8}
              onChange={handleChangeNumerico(setSaldo)}
            />
          </div>
          <div className="row-input">
            <span>Último Pago</span>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker
                value={ultimoPago}
                onChange={(newValue) => setUltimoPago(newValue)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    variant: "outlined",
                    className: "custom-datepicker",
                    sx: { input: { cursor: "pointer" } }
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
            <span>¿Es Jubilado?</span>
            <div className="row-radios">
              <FormControl component="fieldset">
                <RadioGroup row value={esJubilado} onChange={(e) => setEsJubilado(e.target.value)}>
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
                <RadioGroup row value={omitirLetra} onChange={(e) => setOmitirLetra(e.target.value)}>
                  <FormControlLabel value="no" control={<Radio className="custom-radio" />} label="No" />
                  <FormControlLabel value="si" control={<Radio className="custom-radio" />} label="Sí" />
                </RadioGroup>
              </FormControl>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default Calculadora;
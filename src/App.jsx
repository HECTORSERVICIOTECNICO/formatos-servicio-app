import React, { useState } from 'react';
import PanelFacturacion from './PanelFacturacion';
import PanelServicio from './PanelServicio';
import './App.css';

function App() {
  const [vista, setVista] = useState('');

  return (
    <div className="contenedor">
      {vista === '' && (
        <>
          <img src="/logo.png" alt="Logo STG" className="logo" />
          <h1 className="titulo">Formatos de Servicio</h1>
          <div className="botones">
            <button className="boton" onClick={() => setVista('factura')}>Cuenta de Cobro</button>
            <button className="boton" onClick={() => setVista('servicio')}>Formato Técnico de Servicio</button>
          </div>
        </>
      )}
      {vista === 'factura' && <PanelFacturacion />}
      {vista === 'servicio' && <PanelServicio />}
    </div>
  );
}

export default App;

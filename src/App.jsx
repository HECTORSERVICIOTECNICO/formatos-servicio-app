import React, { useState } from "react";
import PanelFacturacion from "./PanelFacturacion";
import PanelServicio from "./PanelServicio";


export default function App() {
  const [vista, setVista] = useState(null);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center space-y-8 p-6">
      {!vista && (
        <div className="text-center space-y-6">
          <img src="/logo.png" alt="Logo" style={{ height: "160px", width: "auto" }} />
          <h1 className="text-3xl font-bold">Formatos de Servicio</h1>
          <div className="space-x-4">
            <button
              onClick={() => setVista("factura")}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cuenta de Cobro
            </button>
            <button
              onClick={() => setVista("servicio")}
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Formato Técnico de Servicio
            </button>
          </div>
        </div>
      )}

      {vista === "factura" && <PanelFacturacion />}
      {vista === "servicio" && <PanelServicio />}
    </div>
  );
}

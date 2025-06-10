import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";

const ComponenteParaImprimir = React.forwardRef(({ servicio }, ref) => (
  <div ref={ref} className="p-4">
    <img src="/logo.png" alt="Logo" style={{ height: "90px", marginBottom: "10px" }} />
    <h2 className="text-2xl font-bold mb-4">Formato Técnico de Servicio</h2>
    <table className="w-full border border-black">
      <tbody>
        {[
          ["cliente", "telefono", "direccion"],
          ["ciudad", "articulo", "marca"],
          ["modelo", "serie", "color"],
          ["estado", "falla", "modeloRefrig"],
          ["tpRefrig", "capacidad", "cgRefrig"],
          ["motor", "amperios", "unidad"],
          ["observacion", "valor", "abono"],
          ["saldo", "diagnostico", ""],
          ["tipo", "", ""]
        ].map((fila, i) => (
          <tr key={i}>
            {fila.map((campo, j) => (
              <>
                <td className="border p-1 font-bold">{campo.charAt(0).toUpperCase() + campo.slice(1)}:</td>
                <td className="border p-1">{servicio[campo]}</td>
              </>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

export default function PanelServicio() {
  const [servicio, setServicio] = useState({
    cliente: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    articulo: "",
    marca: "",
    modelo: "",
    serie: "",
    color: "",
    estado: "",
    falla: "",
    modeloRefrig: "",
    tpRefrig: "",
    capacidad: "",
    cgRefrig: "",
    motor: "",
    amperios: "",
    unidad: "",
    observacion: "",
    valor: "",
    abono: "",
    saldo: "",
    diagnostico: "",
    tipo: "",
  });

  const [servicios, setServicios] = useState(() => {
    const data = localStorage.getItem("servicios");
    return data ? JSON.parse(data) : [];
  });

  const [consecutivo, setConsecutivo] = useState(() => {
    const ultimo = localStorage.getItem("consecutivoServicio");
    return ultimo ? parseInt(ultimo) + 1 : 1;
  });

  const ref = useRef();
  const handlePrint = useReactToPrint({ content: () => ref.current });

  const handleChange = (e) => {
    setServicio({ ...servicio, [e.target.name]: e.target.value });
  };

  const guardarServicio = () => {
    const nuevo = {
      ...servicio,
      id: Date.now(),
      consecutivo,
      timestamp: new Date(),
    };
    const nuevosServicios = [...servicios, nuevo];
    setServicios(nuevosServicios);
    localStorage.setItem("servicios", JSON.stringify(nuevosServicios));
    localStorage.setItem("consecutivoServicio", consecutivo);
    setConsecutivo(consecutivo + 1);
    setServicio({
      cliente: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      articulo: "",
      marca: "",
      modelo: "",
      serie: "",
      color: "",
      estado: "",
      falla: "",
      modeloRefrig: "",
      tpRefrig: "",
      capacidad: "",
      cgRefrig: "",
      motor: "",
      amperios: "",
      unidad: "",
      observacion: "",
      valor: "",
      abono: "",
      saldo: "",
      diagnostico: "",
      tipo: "",
    });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="border p-4">
        <ComponenteParaImprimir ref={ref} servicio={servicio} />
      </div>

      <table className="w-full border border-black">
        <tbody>
          {[
            ["cliente", "telefono", "direccion"],
            ["ciudad", "articulo", "marca"],
            ["modelo", "serie", "color"],
            ["estado", "falla", "modeloRefrig"],
            ["tpRefrig", "capacidad", "cgRefrig"],
            ["motor", "amperios", "unidad"],
            ["observacion", "valor", "abono"],
            ["saldo", "diagnostico", ""],
            ["tipo", "", ""]
          ].map((fila, i) => (
            <tr key={i}>
              {fila.map((campo, j) => (
                <>
                  <td className="border p-1 font-bold">{campo.charAt(0).toUpperCase() + campo.slice(1)}:</td>
                  <td className="border p-1">
                    <input
                      name={campo}
                      value={servicio[campo] || ""}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </td>
                </>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-x-2 mt-4">
        <button onClick={guardarServicio} className="px-4 py-2 bg-green-500 text-white rounded">
          Guardar Servicio
        </button>
        <button onClick={handlePrint} className="px-4 py-2 bg-blue-500 text-white rounded">
          Imprimir PDF Servicio
        </button>
      </div>

      <h2 className="font-bold text-xl mt-10">Historial de servicios</h2>
      {servicios.map((s) => (
        <div key={s.id} className="border p-2 mt-2 rounded bg-white shadow">
          <strong>Cliente:</strong> {s.cliente} <br />
          <strong>Artículo:</strong> {s.articulo} <br />
          <strong>Diagnóstico:</strong> {s.diagnostico} <br />
          <strong>Consecutivo:</strong> {s.consecutivo} <br />
          <strong>Fecha:</strong> {new Date(s.timestamp).toLocaleString()}
        </div>
      ))}
    </div>
  );
}

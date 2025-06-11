import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ComponenteParaImprimir = React.forwardRef(({ servicio }, ref) => {
  const secciones = [
    { titulo: "Datos del Cliente", campos: ["cliente", "telefono", "direccion", "ciudad"] },
    { titulo: "Características del Equipo", campos: ["articulo", "marca", "modelo", "serie", "color"] },
    { titulo: "Diagnóstico y Estado", campos: ["estado", "falla", "modeloRefrig", "tpRefrig", "capacidad", "cgRefrig", "motor", "amperios", "unidad"] },
    { titulo: "Valores y Observaciones", campos: ["observacion", "valor", "abono", "saldo", "diagnostico", "tipo"] }
  ];

  return (
    <div ref={ref} style={{ padding: "30px", backgroundColor: "white", width: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
      <img src="/logo.png" alt="Logo" style={{ height: "90px", marginBottom: "10px" }} />
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>Formato Técnico de Servicio</h2>
      <div style={{ fontSize: "14px", marginBottom: "20px" }}>
        <p><strong>Consecutivo:</strong> {servicio.consecutivo}</p>
        <p><strong>Fecha:</strong> {servicio.timestamp ? new Date(servicio.timestamp).toLocaleString() : ""}</p>
      </div>
      {secciones.map((seccion, i) => (
        <div key={i} style={{ marginBottom: "16px" }}>
          <h3 style={{ fontWeight: "bold", fontSize: "16px", borderBottom: "1px solid black", paddingBottom: "4px", marginBottom: "8px" }}>{seccion.titulo}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <tbody>
              {seccion.campos.map((campo, j) => (
                <tr key={j}>
                  <td style={{ border: "1px solid black", padding: "4px", fontWeight: "bold", width: "35%" }}>{campo.charAt(0).toUpperCase() + campo.slice(1)}:</td>
                  <td style={{ border: "1px solid black", padding: "4px" }}>{servicio[campo]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
});

export default function PanelServicio() {
  const secciones = [
    { titulo: "Datos del Cliente", campos: ["cliente", "telefono", "direccion", "ciudad"] },
    { titulo: "Características del Equipo", campos: ["articulo", "marca", "modelo", "serie", "color"] },
    { titulo: "Diagnóstico y Estado", campos: ["estado", "falla", "modeloRefrig", "tpRefrig", "capacidad", "cgRefrig", "motor", "amperios", "unidad"] },
    { titulo: "Valores y Observaciones", campos: ["observacion", "valor", "abono", "saldo", "diagnostico", "tipo"] }
  ];

  const campos = secciones.flatMap(sec => sec.campos);
  const [servicio, setServicio] = useState(Object.fromEntries(campos.map(c => [c, ""])));
  const [servicios, setServicios] = useState(() => JSON.parse(localStorage.getItem("servicios")) || []);
  const [consecutivo, setConsecutivo] = useState(() => parseInt(localStorage.getItem("consecutivoServicio")) + 1 || 1);
  const [detalleServicio, setDetalleServicio] = useState(null);
  const [servicioParaImprimir, setServicioParaImprimir] = useState(servicio);
  const printServicioRef = useRef();

  const handlePrintFromForm = async () => {
    const nuevoServicio = { ...servicio, consecutivo, timestamp: new Date() };
    setServicioParaImprimir(nuevoServicio);
    await new Promise(resolve => setTimeout(resolve, 0));
    exportarPDF(printServicioRef, "servicio", nuevoServicio.consecutivo);
  };

  const handleHistorialPrint = async (serv) => {
    setServicioParaImprimir(serv);
    await new Promise(resolve => setTimeout(resolve, 0));
    exportarPDF(printServicioRef, "servicio", serv.consecutivo);
  };

  const exportarPDF = async (ref, nombre, consecutivo) => {
    const input = ref.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let position = 0;
    if (imgHeight < pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
        if (heightLeft > 0) {
          pdf.addPage();
          position = -pdfHeight;
        }
      }
    }
    pdf.save(`${nombre}-${consecutivo}.pdf`);
  };

  const handleChange = (e) => setServicio({ ...servicio, [e.target.name]: e.target.value });

  const guardarServicio = () => {
    const nuevo = { ...servicio, id: Date.now(), consecutivo, timestamp: new Date() };
    const nuevosServicios = [...servicios, nuevo];
    setServicios(nuevosServicios);
    localStorage.setItem("servicios", JSON.stringify(nuevosServicios));
    localStorage.setItem("consecutivoServicio", consecutivo);
    setConsecutivo(consecutivo + 1);
    setServicio(Object.fromEntries(campos.map(c => [c, ""])));
  };

  return (
    <div className="p-6 space-y-8">
      {secciones.map((seccion, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-lg font-bold border-b pb-1">{seccion.titulo}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {seccion.campos.map((campo, i) => (
              <div key={i} className="grid grid-cols-5 items-center">
                <label className="col-span-2 font-semibold text-sm text-right pr-2">
                  {campo.charAt(0).toUpperCase() + campo.slice(1)}:
                </label>
                <input
                  name={campo}
                  value={servicio[campo] || ""}
                  onChange={handleChange}
                  className="col-span-3 border border-gray-300 p-2 rounded text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2 mt-4">
        <button onClick={guardarServicio} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow">
          Guardar Servicio
        </button>
        <button onClick={handlePrintFromForm} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow">
          Imprimir PDF Servicio
        </button>
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <ComponenteParaImprimir ref={printServicioRef} servicio={servicioParaImprimir} />
        </div>
      </div>

      <h2 className="font-bold text-xl mt-10">Historial de servicios</h2>
      {servicios.map((s) => (
        <div key={s.id} className="border p-4 mt-2 rounded bg-white shadow-md">
          <strong>Consecutivo:</strong> <button onClick={() => setDetalleServicio(s)} className="text-blue-600 underline hover:text-blue-800">{s.consecutivo}</button><br />
          <strong>Cliente:</strong> {s.cliente}<br />
          <strong>Artículo:</strong> {s.articulo}<br />
          <strong>Fecha:</strong> {new Date(s.timestamp).toLocaleString()}<br />
          <button onClick={() => handleHistorialPrint(s)} className="mt-2 text-sm text-white bg-blue-500 px-2 py-1 rounded shadow hover:bg-blue-700">
            Imprimir PDF
          </button>
        </div>
      ))}

      {detalleServicio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-h-[90vh] overflow-auto w-full max-w-2xl">
            <div>
              <h3 className="text-xl font-bold mb-4">Detalle del Servicio #{detalleServicio.consecutivo}</h3>
              <table className="w-full border border-black mb-4">
                <tbody>
                  {Object.entries(detalleServicio).map(([campo, valor], i) => (
                    campo !== "id" && (
                      <tr key={i}>
                        <td className="border p-1 font-bold w-1/3">{campo.charAt(0).toUpperCase() + campo.slice(1)}:</td>
                        <td className="border p-1">{valor?.toString()}</td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right space-x-2">
              <button onClick={() => handleHistorialPrint(detalleServicio)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow">
                Imprimir
              </button>
              <button onClick={() => setDetalleServicio(null)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <button
          onClick={() => (window.location.href = "/")}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded shadow"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}

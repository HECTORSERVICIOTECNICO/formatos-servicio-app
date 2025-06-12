// Panel principal con formularios y vista
import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  Timestamp,
  query,
  orderBy
} from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const firebaseConfig = {
  apiKey: "AIzaSyBSPOaw1y70xDxtvismCdNR-7i_CbgHG50",
  authDomain: "formatos-60a3d.firebaseapp.com",
  projectId: "formatos-60a3d",
  storageBucket: "formatos-60a3d.appspot.com",
  messagingSenderId: "923203404268",
  appId: "1:923203404268:web:a8224ee258c996a16680c9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function PanelServicio() {
  const camposIniciales = {
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
    tipo: ""
  };

  const [formServicio, setFormServicio] = useState(camposIniciales);
  const [servicios, setServicios] = useState([]);
  const [consecutivoServicio, setConsecutivoServicio] = useState(1);
  const servicioRef = useRef();
  const [detalleServicio, setDetalleServicio] = useState(null);
  const [verServiciosGuardados, setVerServiciosGuardados] = useState(false);

  const guardarServicio = async () => {
    const nuevo = {
      ...formServicio,
      tipo: "servicio",
      consecutivo: consecutivoServicio,
      timestamp: Timestamp.now()
    };
    await addDoc(collection(db, "registros"), nuevo);
    setFormServicio(camposIniciales);
    setConsecutivoServicio((prev) => prev + 1);
    obtenerRegistros();
  };

  const obtenerRegistros = async () => {
    const ref = collection(db, "registros");
    const q = query(ref, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setServicios(data.filter((d) => d.tipo === "servicio"));
  };

  useEffect(() => {
    obtenerRegistros();
  }, []);

  const exportarPDF = async (ref, nombre, consecutivo) => {
    const input = ref.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${nombre}-${consecutivo}.pdf`);
  };

  const handleHistorialPrint = async (servicio) => {
    const ref = servicioRef;
    await new Promise((res) => setTimeout(res, 0));
    exportarPDF(ref, "servicio", servicio.consecutivo);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      {!verServiciosGuardados && (
        <>
          <div ref={servicioRef} className="p-6 bg-white shadow border mt-4">
            <img src="/logo.png" alt="Logo" style={{ height: "160px", width: "auto", marginBottom: "1rem" }} />
            <h1 className="text-2xl font-bold mb-4 text-center">Formato Técnico de Servicio</h1>
            <p><strong>Consecutivo:</strong> {consecutivoServicio}</p>
            <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {Object.entries(formServicio).map(([campo, valor]) => (
                <input
                  key={campo}
                  placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                  className="w-full border p-2 rounded"
                  value={valor}
                  onChange={(e) => setFormServicio({ ...formServicio, [campo]: e.target.value })}
                />
              ))}
            </div>
          </div>

          <div className="space-x-2 mt-4">
            <button onClick={guardarServicio} className="bg-green-600 text-white px-4 py-2 rounded">
              Guardar Servicio
            </button>
            <button onClick={() => exportarPDF(servicioRef, "servicio", consecutivoServicio)} className="bg-gray-800 text-white px-4 py-2 rounded">
              Imprimir PDF Servicio
            </button>
            <button
              onClick={() => setVerServiciosGuardados(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Servicios Guardados
            </button>
          </div>
        </>
      )}

      {verServiciosGuardados && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Servicios Guardados</h2>
          {servicios.map((s) => (
            <div key={s.id} className="border p-4 mt-2 rounded bg-white shadow-md">
              <p><strong>Consecutivo:</strong> <button onClick={() => setDetalleServicio(s)} className="text-blue-600 underline hover:text-blue-800">{s.consecutivo}</button></p>
              <p><strong>Cliente:</strong> {s.cliente}</p>
              <p><strong>Artículo:</strong> {s.articulo}</p>
              <p><strong>Fecha:</strong> {s.timestamp?.toDate().toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {detalleServicio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-h-[90vh] overflow-auto w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Detalle del Servicio #{detalleServicio.consecutivo}</h3>
            <table className="w-full border border-black mb-4">
              <tbody>
                {Object.entries(detalleServicio).map(([campo, valor], i) => (
                  campo !== "id" && campo !== "tipo" && (
                    <tr key={i}>
                      <td className="border p-1 font-bold w-1/3">{campo.charAt(0).toUpperCase() + campo.slice(1)}:</td>
                      <td className="border p-1">{valor?.toString()}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
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
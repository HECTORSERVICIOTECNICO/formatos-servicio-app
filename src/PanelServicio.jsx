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
    tipo: "",
    capacidad: "",
    carga: "",
    motor: "",
    amperios: "",
    unidad: "",
    observacion: "",
    valor: "",
    abono: "",
    saldo: "",
    diagnostico: ""
  };

  const [formServicio, setFormServicio] = useState(camposIniciales);
  const [servicios, setServicios] = useState([]);
  const [consecutivoServicio, setConsecutivoServicio] = useState(1);
  const servicioRef = useRef();
  const firmaRef = useRef();
  const [servicioParaImprimir, setServicioParaImprimir] = useState(null);
  const [detalleServicio, setDetalleServicio] = useState(null);
  const [verServiciosGuardados, setVerServiciosGuardados] = useState(false);
  const [firma, setFirma] = useState(null);

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
    setServicioParaImprimir(servicio);
    await new Promise((res) => setTimeout(res, 0));
    exportarPDF(servicioRef, "servicio", servicio.consecutivo);
  };

  const getValor = (campo) => servicioParaImprimir?.[campo] ?? formServicio[campo];

  const filas = [
    ["Cliente", "cliente"],
    ["Teléfono", "telefono"],
    ["Dirección", "direccion"],
    ["Ciudad", "ciudad"],
    ["Artículo", "articulo"],
    ["Marca", "marca"],
    ["Modelo", "modelo"],
    ["Serie", "serie"],
    ["Color", "color"],
    ["Estado", "estado"],
    ["Falla", "falla"],
    ["Diagnóstico", "diagnostico"],
    ["Observación", "observacion"],
    ["Motor", "motor"],
    ["Amperios", "amperios"],
    ["Unidad", "unidad"],
    ["Capacidad", "capacidad"],
    ["Tipo", "tipo"],
    ["Carga", "carga"],
    ["Valor", "valor"],
    ["Abono", "abono"],
    ["Saldo", "saldo"]
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      {!verServiciosGuardados && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(formServicio).map(([campo, valor]) => (
              <input
                key={campo}
                placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                className="w-full border p-2 rounded text-sm"
                style={{ maxWidth: "100%" }}
                value={valor}
                onChange={(e) => setFormServicio({ ...formServicio, [campo]: e.target.value })}
              />
            ))}
          </div>

          <div ref={servicioRef} className="p-6 bg-white shadow border mt-4 text-sm text-left space-y-4 print:block">
            <img src="/logo.png" alt="Logo" style={{ height: "90px", width: "auto" }} />
            <h1 className="text-xl font-bold mb-2">Formato Técnico de Servicio</h1>
            <p><strong>Consecutivo:</strong> {getValor("consecutivo")}</p>
            <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>

            <table className="w-full text-sm border border-black table-fixed">
              <tbody>
                {filas.map(([label, key], index) => (
                  index % 2 === 0 ? (
                    <tr key={index} className="align-top border-t border-black">
                      <td className="p-2 w-1/4 font-semibold align-top border-r border-black break-words">{label}:</td>
                      <td className="p-2 w-1/4 border-r border-black">
                        <div className="min-h-[3rem] overflow-hidden" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>{getValor(key)}</div>
                      </td>
                      {filas[index + 1] ? (
                        <>
                          <td className="p-2 w-1/4 font-semibold align-top border-r border-black break-words">{filas[index + 1][0]}:</td>
                          <td className="p-2 w-1/4">
                            <div className="min-h-[3rem] overflow-hidden" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>{getValor(filas[index + 1][1])}</div>
                          </td>
                        </>
                      ) : (
                        <td colSpan={2}></td>
                      )}
                    </tr>
                  ) : null
                ))}
              </tbody>
            </table>

            <div className="mt-6">
              <h2 className="font-semibold">Firma del Cliente</h2>
              <div className="border border-gray-400 h-24 w-64 mt-2" ref={firmaRef} contentEditable={!servicioParaImprimir}>
                {firma ? <img src={firma} alt="Firma" /> : <span className="text-gray-400">Firma aquí...</span>}
              </div>
            </div>

            <div className="mt-10 hidden print:block text-sm">
              <p><strong>Héctor Maya</strong> - MZ 12 CS 13 Barrio las Violetas - Dosquebradas/RDA</p>
              <p>TELEFONOS: 320 408 3173 - 311 384 9609</p>
              <p>CORREO: reparacionlavadorashector@gmail.com</p>
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
    </div>
  );
}

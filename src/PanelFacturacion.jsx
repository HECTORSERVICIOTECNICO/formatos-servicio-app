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
  storageBucket: "formatos-60a3d.firebasestorage.app",
  messagingSenderId: "923203404268",
  appId: "1:923203404268:web:a8224ee258c996a16680c9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function PanelFacturacion() {
  const [formFactura, setFormFactura] = useState({ cliente: "", valor: "", observacion: "" });
  const [formServicio, setFormServicio] = useState({
    fecha: "", nombre: "", telefono: "", direccion: "", ciudad: "",
    articulo: "", marca: "", modelo: "", serie: "", color: "",
    estado: "", falla: "", modeloRefrig: "", tpRefrig: "",
    capacidad: "", cgRefrig: "", mantenimiento: false,
    reparacion: false, revision: false, motor: "", amperios: "",
    unidad: "", voltaje: "", cotizacion: false, diagnostico: "",
    observacion: "", valor: "", abono: "", saldo: ""
  });
  const [facturas, setFacturas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [consecutivoFactura, setConsecutivoFactura] = useState(1);
  const [consecutivoServicio, setConsecutivoServicio] = useState(1);
  const printRef = useRef();
  const facturaRef = useRef();

  const guardarFactura = async () => {
    const nueva = {
      ...formFactura,
      tipo: "factura",
      consecutivo: consecutivoFactura,
      timestamp: Timestamp.now()
    };
    await addDoc(collection(db, "registros"), nueva);
    setFormFactura({ cliente: "", valor: "", observacion: "" });
    setConsecutivoFactura((prev) => prev + 1);
    obtenerRegistros();
  };

  const guardarServicio = async () => {
    const nuevo = {
      ...formServicio,
      tipo: "servicio",
      consecutivo: consecutivoServicio,
      timestamp: Timestamp.now()
    };
    await addDoc(collection(db, "registros"), nuevo);
    setConsecutivoServicio((prev) => prev + 1);
    obtenerRegistros();
  };

  const obtenerRegistros = async () => {
    const ref = collection(db, "registros");
    const q = query(ref, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setFacturas(data.filter((d) => d.tipo === "factura"));
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Formato Técnico de Servicio */}
      <div ref={printRef} className="border p-6 bg-white shadow text-sm">
        <img src="/logo.png" alt="Logo" className="h-20 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Formato Técnico de Servicio</h1>
        <p><strong>No:</strong> {consecutivoServicio}</p>
        <p><strong>Fecha:</strong> {formServicio.fecha}</p>
        <p><strong>Cliente:</strong> {formServicio.nombre}</p>
        <p><strong>Teléfono:</strong> {formServicio.telefono}</p>
        <p><strong>Dirección:</strong> {formServicio.direccion}</p>
        <p><strong>Ciudad:</strong> {formServicio.ciudad}</p>
        <p><strong>Artículo:</strong> {formServicio.articulo}</p>
        <p><strong>Marca:</strong> {formServicio.marca}</p>
        <p><strong>Modelo:</strong> {formServicio.modelo}</p>
        <p><strong>Serie:</strong> {formServicio.serie}</p>
        <p><strong>Color:</strong> {formServicio.color}</p>
        <p><strong>Estado:</strong> {formServicio.estado}</p>
        <p><strong>Falla:</strong> {formServicio.falla}</p>
        <p><strong>Modelo Refrigeración:</strong> {formServicio.modeloRefrig}</p>
        <p><strong>Tipo Refrigeración:</strong> {formServicio.tpRefrig}</p>
        <p><strong>Capacidad:</strong> {formServicio.capacidad}</p>
        <p><strong>Carga:</strong> {formServicio.cgRefrig}</p>
        <p><strong>Servicios:</strong> {formServicio.mantenimiento ? "Mantenimiento " : ""}{formServicio.reparacion ? "Reparación " : ""}{formServicio.revision ? "Revisión" : ""}</p>
        <p><strong>Motor:</strong> {formServicio.motor}</p>
        <p><strong>Amperios:</strong> {formServicio.amperios}</p>
        <p><strong>Unidad:</strong> {formServicio.unidad}</p>
        <p><strong>Voltaje:</strong> {formServicio.voltaje}</p>
        <p><strong>Cotización:</strong> {formServicio.cotizacion ? "Sí" : "No"}</p>
        <p><strong>Diagnóstico:</strong> {formServicio.diagnostico}</p>
        <p><strong>Observaciones:</strong> {formServicio.observacion}</p>
        <p><strong>Valor:</strong> {formServicio.valor}</p>
        <p><strong>Abono:</strong> {formServicio.abono}</p>
        <p><strong>Saldo:</strong> {formServicio.saldo}</p>
        <p className="mt-6">Firma Técnico: _____________________________</p>
        <p className="mt-2">Firma Cliente: _____________________________</p>
      </div>

      <div className="space-y-2">
        {Object.entries(formServicio).map(([campo, valor]) => (
          typeof valor === "boolean" ? (
            <label key={campo} className="block">
              <input
                type="checkbox"
                checked={valor}
                onChange={(e) => setFormServicio({ ...formServicio, [campo]: e.target.checked })}
              /> {campo}
            </label>
          ) : (
            <input
              key={campo}
              placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
              className="w-full border p-2 rounded"
              value={valor}
              onChange={(e) => setFormServicio({ ...formServicio, [campo]: e.target.value })}
            />
          )
        ))}
        <button onClick={guardarServicio} className="bg-blue-500 text-white px-4 py-2 rounded">
          Guardar Servicio
        </button>
        <button onClick={() => exportarPDF(printRef, "servicio", consecutivoServicio)} className="bg-gray-700 text-white px-4 py-2 rounded">
          Imprimir PDF Servicio
        </button>
      </div>

      {/* Cuenta de cobro */}
      <div ref={facturaRef} className="border p-6 bg-white shadow">
        <img src="/logo.png" alt="Logo" className="h-20 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Cuenta de Cobro</h2>
        <p><strong>No:</strong> {consecutivoFactura}</p>
        <p><strong>Cliente:</strong> {formFactura.cliente}</p>
        <p><strong>Valor:</strong> {formFactura.valor}</p>
        <p><strong>Observación:</strong> {formFactura.observacion}</p>
      </div>
      <div className="space-y-2">
        <input
          placeholder="Cliente"
          className="w-full border p-2 rounded"
          value={formFactura.cliente}
          onChange={(e) => setFormFactura({ ...formFactura, cliente: e.target.value })}
        />
        <input
          placeholder="Valor"
          className="w-full border p-2 rounded"
          value={formFactura.valor}
          onChange={(e) => setFormFactura({ ...formFactura, valor: e.target.value })}
        />
        <textarea
          placeholder="Observación"
          className="w-full border p-2 rounded"
          value={formFactura.observacion}
          onChange={(e) => setFormFactura({ ...formFactura, observacion: e.target.value })}
        />
        <button onClick={guardarFactura} className="bg-green-500 text-white px-4 py-2 rounded">
          Guardar Factura
        </button>
        <button onClick={() => exportarPDF(facturaRef, "factura", consecutivoFactura)} className="bg-gray-700 text-white px-4 py-2 rounded">
          Enviar como PDF
        </button>
      </div>

      <h2 className="font-bold text-xl mt-10">Historial de servicios</h2>
      {servicios.map((s) => (
        <div key={s.id} className="border p-2 mt-2 rounded bg-white shadow">
          <strong>Cliente:</strong> {s.nombre} <br />
          <strong>Artículo:</strong> {s.articulo} <br />
          <strong>Diagnóstico:</strong> {s.diagnostico} <br />
          <strong>Consecutivo:</strong> {s.consecutivo} <br />
          <strong>Fecha:</strong> {s.timestamp.toDate().toLocaleString()}
        </div>
      ))}
    </div>
  );
}


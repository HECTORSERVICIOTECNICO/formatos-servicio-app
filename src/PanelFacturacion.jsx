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

export default function PanelFacturacion() {
  const [formFactura, setFormFactura] = useState({
    cliente: "",
    cedula: "",
    concepto: "",
    valor: "",
    banco: "",
    cuenta: "",
    tipoCuenta: "",
    titular: ""
  });

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
    setFormFactura({ cliente: "", cedula: "", concepto: "", valor: "", banco: "", cuenta: "", tipoCuenta: "", titular: "" });
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
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      {/* Formulario Cuenta de Cobro */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(formFactura).map(([campo, valor]) => (
          <input
            key={campo}
            placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
            className="w-full border p-2 rounded"
            value={valor}
            onChange={(e) => setFormFactura({ ...formFactura, [campo]: e.target.value })}
          />
        ))}
      </div>
      <div ref={facturaRef} className="p-6 bg-white shadow border">
        <img src="/logo.png" alt="Logo" style={{ height: "160px", width: "auto", marginBottom: "1rem" }} />
        <h1 className="text-2xl font-bold mb-4">CUENTA DE COBRO</h1>
        <p className="mb-1 font-semibold">Héctor Maya</p>
        <p className="mb-4 font-semibold">C.C. 9.969.799 de Anserma Caldas</p>
        <p><strong>No:</strong> {consecutivoFactura}</p>
        <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
        <br />
        <p><strong>Cliente:</strong> {formFactura.cliente}</p>
        <p><strong>Cédula:</strong> {formFactura.cedula}</p>
        <p><strong>Concepto:</strong> {formFactura.concepto}</p>
        <p><strong>Valor:</strong> ${formFactura.valor}</p>
        <br />
        <p><strong>Favor realizar el pago a:</strong></p>
        <p>Banco: {formFactura.banco} | Cuenta: {formFactura.cuenta} ({formFactura.tipoCuenta})</p>
        <p>Titular: {formFactura.titular}</p>
        <br />
        <p className="mt-6">Firma: _____________________________</p>
      </div>
      <div className="space-x-2">
        <button onClick={guardarFactura} className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar Cuenta de Cobro
        </button>
        <button onClick={() => exportarPDF(facturaRef, "factura", consecutivoFactura)} className="bg-gray-800 text-white px-4 py-2 rounded">
          Imprimir PDF Cuenta de Cobro
        </button>
      </div>
    </div>
  );
}

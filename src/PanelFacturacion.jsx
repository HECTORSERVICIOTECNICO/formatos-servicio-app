// Panel principal con formularios y vista
import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
  updateDoc
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
    titular: "",
    observaciones: ""
  });

  const [facturas, setFacturas] = useState([]);
  const [consecutivoFactura, setConsecutivoFactura] = useState(1);
  const [facturaEditandoId, setFacturaEditandoId] = useState(null);
  const facturaRef = useRef();
  const [facturaParaImprimir, setFacturaParaImprimir] = useState(null);
  const [verFacturasGuardadas, setVerFacturasGuardadas] = useState(false);
  const [detalleFactura, setDetalleFactura] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const guardarFactura = async () => {
    const nueva = {
      ...formFactura,
      tipo: "factura",
      timestamp: Timestamp.now()
    };

    if (facturaEditandoId) {
      const ref = doc(db, "registros", facturaEditandoId);
      await updateDoc(ref, nueva);
    } else {
      nueva.consecutivo = consecutivoFactura;
      await addDoc(collection(db, "registros"), nueva);
      setConsecutivoFactura((prev) => prev + 1);
    }

    setFormFactura({ cliente: "", cedula: "", concepto: "", valor: "", banco: "", cuenta: "", tipoCuenta: "", titular: "", observaciones: "" });
    setFacturaEditandoId(null);
    obtenerRegistros();
  };

  const eliminarHistorial = async () => {
    const snapshot = await getDocs(collection(db, "registros"));
    const batch = snapshot.docs.map((docu) => deleteDoc(doc(db, "registros", docu.id)));
    await Promise.all(batch);
    setFacturas([]);
    setConsecutivoFactura(1);
  };

  const obtenerRegistros = async () => {
    const ref = collection(db, "registros");
    const q = query(ref, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setFacturas(data.filter((d) => d.tipo === "factura"));
  };

  useEffect(() => {
    obtenerRegistros();
  }, []);

  const exportarPDF = async (ref, nombre, consecutivo) => {
    const input = ref.current;
    const canvas = await html2canvas(input, {
      scale: 2,
      scrollY: -window.scrollY
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${nombre}-${consecutivo}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      {verFacturasGuardadas ? (
        <>
          <h2 className="text-xl font-bold mb-4">Facturas Guardadas</h2>
          {facturas.map((f) => (
            <div key={f.id} className="border p-4 mt-2 rounded bg-white shadow-md">
              <p><strong>Consecutivo:</strong> <button onClick={() => setDetalleFactura(f)} className="text-blue-600 underline hover:text-blue-800">{f.consecutivo}</button></p>
              <p><strong>Cliente:</strong> {f.cliente}</p>
              <p><strong>Concepto:</strong> {f.concepto}</p>
              <p><strong>Fecha:</strong> {f.timestamp?.toDate().toLocaleString()}</p>
              <div className="mt-2 space-x-2">
                <button onClick={() => { setFacturaParaImprimir(f); setVerFacturasGuardadas(false); setFormFactura({ cliente: "", cedula: "", concepto: "", valor: "", banco: "", cuenta: "", tipoCuenta: "", titular: "", observaciones: "" }); setFacturaEditandoId(null); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">Imprimir</button>
                <button onClick={() => { setFormFactura(f); setFacturaEditandoId(f.id); setFacturaParaImprimir(null); setVerFacturasGuardadas(false); }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">Editar</button>
                <button onClick={async () => { await deleteDoc(doc(db, "registros", f.id)); obtenerRegistros(); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">Eliminar</button>
              </div>
            </div>
          ))}

          <div className="mt-6 space-x-2">
            <button onClick={() => setVerFacturasGuardadas(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded shadow">Volver al Inicio</button>
            <button onClick={eliminarHistorial} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow">Eliminar Historial</button>
          </div>

          {detalleFactura && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg max-h-[90vh] overflow-auto w-full max-w-2xl">
                <h3 className="text-xl font-bold mb-4">Detalle Cuenta de Cobro #{detalleFactura.consecutivo}</h3>
                <table className="w-full border border-black mb-4">
                  <tbody>
                    {Object.entries(detalleFactura).map(([campo, valor], i) => (
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
                  <button onClick={() => exportarPDF(facturaRef, 'factura', detalleFactura.consecutivo)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow">Imprimir</button>
                  <button onClick={() => setDetalleFactura(null)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow">Cerrar</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
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

          <div
            ref={facturaRef}
            className="p-6 bg-white shadow border mt-4 text-center"
            style={{
              width: '794px',
              minHeight: isSmallScreen ? '600px' : '1123px',
              margin: '0 auto',
              transform: isSmallScreen ? 'scale(0.85)' : 'scale(1)',
              transformOrigin: 'top center'
            }}
          >
            <img src="/logo.png" alt="Logo" style={{ height: "160px", width: "auto", marginBottom: "1rem" }} />
            <h1 className="text-2xl font-bold mb-4">CUENTA DE COBRO</h1>
            <p className="mb-1 font-semibold">Héctor Maya</p>
            <p className="mb-4 font-semibold">C.C. 9.969.799 de Anserma Caldas</p>
            <p><strong>No:</strong> {facturaParaImprimir?.consecutivo ?? consecutivoFactura}</p>
            <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
            <br />
            <p><strong>Cliente:</strong> {facturaParaImprimir?.cliente ?? formFactura.cliente}</p>
            <p><strong>Cédula:</strong> {facturaParaImprimir?.cedula ?? formFactura.cedula}</p>
            <p><strong>Concepto:</strong> {facturaParaImprimir?.concepto ?? formFactura.concepto}</p>
            <p><strong>Valor:</strong> ${facturaParaImprimir?.valor ?? formFactura.valor}</p>
            <br />
            <p><strong>Favor realizar el pago a:</strong></p>
            <p>Banco: {facturaParaImprimir?.banco ?? formFactura.banco} | Cuenta: {facturaParaImprimir?.cuenta ?? formFactura.cuenta} ({facturaParaImprimir?.tipoCuenta ?? formFactura.tipoCuenta})</p>
            <p>Titular: {facturaParaImprimir?.titular ?? formFactura.titular}</p>
            <br />
            <p><strong>Observaciones:</strong> {facturaParaImprimir?.observaciones ?? formFactura.observaciones}</p>
            <br />
            <p className="mt-6">Firma: _____________________________</p>
          </div>

          <div className="space-x-2 mt-4">
            <button onClick={guardarFactura} className="bg-green-600 text-white px-4 py-2 rounded">Guardar Cuenta de Cobro</button>
            <button onClick={() => exportarPDF(facturaRef, "factura", facturaParaImprimir?.consecutivo ?? consecutivoFactura)} className="bg-gray-800 text-white px-4 py-2 rounded">Imprimir PDF Cuenta de Cobro</button>
            <button onClick={() => setVerFacturasGuardadas(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Facturas Guardadas</button>
          </div>
        </>
      )}

      <div className="mt-10">
        <button onClick={() => (window.location.href = "/")} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded shadow">Volver al Inicio</button>
      </div>
    </div>
  );
}
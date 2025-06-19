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
  updateDoc,
  Timestamp,
  query,
  orderBy
} from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { openDB } from "idb";

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

const dbLocalPromise = openDB("servicioDB", 1, {
  upgrade(db) {
    db.createObjectStore("servicios", { keyPath: "id", autoIncrement: true });
  }
});

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
  const [servicioEditandoId, setServicioEditandoId] = useState(null);
  const servicioRef = useRef();
  const firmaRef = useRef();
  const [servicioParaImprimir, setServicioParaImprimir] = useState(null);
  const [verServiciosGuardados, setVerServiciosGuardados] = useState(false);

  const guardarServicio = async () => {
    const nuevo = {
      ...formServicio,
      tipo: "servicio",
      timestamp: Timestamp.now()
    };

    if (navigator.onLine) {
      if (servicioEditandoId) {
        const ref = doc(db, "registros", servicioEditandoId);
        await updateDoc(ref, nuevo);
      } else {
        nuevo.consecutivo = consecutivoServicio;
        await addDoc(collection(db, "registros"), nuevo);
        setConsecutivoServicio((prev) => prev + 1);
      }
      obtenerRegistros();
    } else {
      const dbLocal = await dbLocalPromise;
      nuevo.local = true;
      nuevo.consecutivo = consecutivoServicio;
      await dbLocal.add("servicios", nuevo);
      alert("Sin conexión: el servicio se guardó localmente y se sincronizará cuando haya internet.");
    }

    setFormServicio(camposIniciales);
    setServicioEditandoId(null);
  };

  const sincronizarLocales = async () => {
    if (!navigator.onLine) return;
    const dbLocal = await dbLocalPromise;
    const todas = await dbLocal.getAll("servicios");
    for (const s of todas) {
      await addDoc(collection(db, "registros"), s);
      await dbLocal.delete("servicios", s.id);
    }
    obtenerRegistros();
  };

  const eliminarHistorial = async () => {
    const snapshot = await getDocs(collection(db, "registros"));
    const batch = snapshot.docs.map((docu) => deleteDoc(doc(db, "registros", docu.id)));
    await Promise.all(batch);
    setServicios([]);
  };

  const obtenerRegistros = async () => {
    const ref = collection(db, "registros");
    const q = query(ref, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setServicios(data.filter((d) => d.tipo === "servicio"));
  };

  useEffect(() => {
    sincronizarLocales();
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
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let position = 0;

    while (position < imgHeight) {
      pdf.addImage(imgData, "PNG", 0, position * -1, pdfWidth, imgHeight);
      if (position + pageHeight < imgHeight) {
        pdf.addPage();
      }
      position += pageHeight;
    }

    pdf.save(`${nombre}-${consecutivo}.pdf`);
  };

  const getValor = (campo) => servicioParaImprimir?.[campo] ?? formServicio[campo];

  const renderDato = (etiqueta, campo) => (
    <p><strong className="uppercase">{etiqueta}:</strong> {getValor(campo)}</p>
  );

  const estiloVistaPrevia = {
    width: '100%',
    maxWidth: '794px',
    minHeight: window.innerWidth < 768 ? '600px' : '1123px',
    margin: '0 auto',
    transform: window.innerWidth < 768 ? 'scale(0.85)' : 'scale(1)',
    transformOrigin: 'top center'
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {!verServiciosGuardados && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(formServicio).map(([campo, valor]) => (
              <input
                key={campo}
                placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                className="w-full border p-2 rounded text-sm"
                value={valor}
                onChange={(e) => setFormServicio({ ...formServicio, [campo]: e.target.value })}
              />
            ))}
          </div>

          <div ref={servicioRef} className="p-8 bg-white shadow border mt-4 text-sm print:block print:p-0" style={estiloVistaPrevia}>
            <div className="text-center">
              <img src="/logo.png" alt="Logo" style={{ height: "90px", margin: "0 auto" }} />
              <h1 className="text-2xl font-bold mt-2">Formato Técnico de Servicio</h1>
              <p className="mt-2"><strong>Consecutivo:</strong> {getValor("consecutivo")}</p>
              <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
            </div>

            <div className="mt-4 space-y-2">
              <h2 className="font-bold">📌 Información del Cliente</h2>
              {renderDato("Cliente", "cliente")}
              {renderDato("Teléfono", "telefono")}
              {renderDato("Dirección", "direccion")}
              {renderDato("Ciudad", "ciudad")}

              <h2 className="font-bold mt-4">📦 Datos del Artículo</h2>
              {renderDato("Artículo", "articulo")}
              {renderDato("Marca", "marca")}
              {renderDato("Modelo", "modelo")}
              {renderDato("Serie", "serie")}
              {renderDato("Color", "color")}
              {renderDato("Estado", "estado")}
              {renderDato("Falla", "falla")}

              <h2 className="font-bold mt-4">❄️ Especificaciones Técnicas</h2>
              {renderDato("Motor", "motor")}
              {renderDato("Amperios", "amperios")}
              {renderDato("Unidad", "unidad")}
              {renderDato("Capacidad", "capacidad")}
              {renderDato("Tipo", "tipo")}
              {renderDato("Carga", "carga")}

              <h2 className="font-bold mt-4">💲 Valores</h2>
              {renderDato("Valor", "valor")}
              {renderDato("Abono", "abono")}
              {renderDato("Saldo", "saldo")}

              <h2 className="font-bold uppercase mt-4">Diagnóstico:</h2>
              <p>{getValor("diagnostico")}</p>

              <h2 className="font-bold uppercase mt-4">Observación:</h2>
              <p>{getValor("observacion")}</p>

              <div className="mt-6">
                <h2 className="font-bold">Firma del Cliente</h2>
                <div className="border-b border-black w-64 mt-6" ref={firmaRef} style={{ height: '3rem' }}></div>
              </div>

              <div className="mt-10 print:block text-sm text-center">
                <p><strong>Héctor Maya</strong> - MZ 12 CS 13 Barrio las Violetas - Dosquebradas/RDA</p>
                <p>TELEFONOS: 320 408 3173 - 311 384 9609</p>
                <p>CORREO: reparacionlavadorashector@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="space-x-2 mt-4">
            <button onClick={guardarServicio} className="bg-green-600 text-white px-4 py-2 rounded">
              Guardar Servicio
            </button>
            <button onClick={() => exportarPDF(servicioRef, "servicio", consecutivoServicio)} className="bg-gray-800 text-white px-4 py-2 rounded">
              Imprimir PDF Servicio
            </button>
            <button onClick={() => setVerServiciosGuardados(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
              Ver Servicios Guardados
            </button>
          </div>
        </>
      )}

      {verServiciosGuardados && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Servicios Guardados</h2>
          {servicios.length === 0 ? (
            <p className="text-gray-600">No hay servicios registrados.</p>
          ) : (
            servicios.map((s) => (
              <div key={s.id} className="border p-4 mt-2 rounded bg-white shadow-md">
                <p><strong>Consecutivo:</strong> {s.consecutivo}</p>
                <p><strong>Cliente:</strong> {s.cliente}</p>
                <p><strong>Artículo:</strong> {s.articulo}</p>
                <p><strong>Fecha:</strong> {s.timestamp?.toDate().toLocaleString()}</p>

                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => {
                      setFormServicio(s);
                      setServicioEditandoId(s.id);
                      setServicioParaImprimir(null);
                      setVerServiciosGuardados(false);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={async () => {
                      await deleteDoc(doc(db, "registros", s.id));
                      obtenerRegistros();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="mt-6 space-x-2">
            <button onClick={() => setVerServiciosGuardados(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded shadow">
              Volver al Inicio
            </button>
            <button onClick={eliminarHistorial} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow">
              Eliminar Historial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";

const FIXED_EXPENSES = [
  { id: "wifi", label: "WiFi", amount: 55000, icon: "📶", category: "fijo" },
  { id: "arriendo", label: "Arriendo", amount: 692000, icon: "🏠", category: "fijo" },
  { id: "gas", label: "Gas", amount: 10000, icon: "🔥", category: "servicios" },
  { id: "luz", label: "Luz", amount: 15000, icon: "💡", category: "servicios" },
  { id: "agua", label: "Agua", amount: 60000, icon: "💧", category: "servicios" },
];

const INITIAL_STATE = {
  tutoriasMate: 0,
  tutoriasPsico: 0,
  apoyoPadre: 500000,
  gastosMercado: [],
  gastosGato: [],
  gastosExtras: [],
  serviciosAjuste: { gas: 10000, luz: 15000, agua: 60000 },
  tutoriasGuardadas: [],
};

function fmt(n) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

export default function App() {
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("finanzas-tp") || "null") || INITIAL_STATE;
    } catch { return INITIAL_STATE; }
  });
  const [tab, setTab] = useState("resumen");
  const [newGasto, setNewGasto] = useState({ tipo: "mercado", desc: "", monto: "" });
  const [newTutoria, setNewTutoria] = useState({ tipo: "mate", cantidad: 1 });
  const [flash, setFlash] = useState("");

  useEffect(() => {
    localStorage.setItem("finanzas-tp", JSON.stringify(data));
  }, [data]);

  function showFlash(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 2000);
  }

  const totalFijos = FIXED_EXPENSES.reduce((s, e) => s + e.amount, 0)
    - 10000 - 15000 - 60000
    + data.serviciosAjuste.gas + data.serviciosAjuste.luz + data.serviciosAjuste.agua;

  const totalMercado = data.gastosMercado.reduce((s, g) => s + g.monto, 0);
  const totalGato = data.gastosGato.reduce((s, g) => s + g.monto, 0);
  const totalExtras = data.gastosExtras.reduce((s, g) => s + g.monto, 0);
  const totalGastos = totalFijos + totalMercado + totalGato + totalExtras;
  const ingresosBrutos = data.apoyoPadre + data.tutoriasGuardadas.reduce((s, t) => s + t.ingreso, 0);
  const saldo = ingresosBrutos - totalGastos;
  const totalAhorrado = data.tutoriasGuardadas.reduce((s, t) => s + 10000, 0);

  function agregarGasto() {
    if (!newGasto.desc || !newGasto.monto) return;
    const g = { id: Date.now(), desc: newGasto.desc, monto: parseInt(newGasto.monto), fecha: new Date().toLocaleDateString("es-CO") };
    if (newGasto.tipo === "mercado") setData(d => ({ ...d, gastosMercado: [g, ...d.gastosMercado] }));
    else if (newGasto.tipo === "gato") setData(d => ({ ...d, gastosGato: [g, ...d.gastosGato] }));
    else setData(d => ({ ...d, gastosExtras: [g, ...d.gastosExtras] }));
    setNewGasto({ tipo: newGasto.tipo, desc: "", monto: "" });
    showFlash("✓ Gasto registrado");
  }

  function registrarTutorias() {
    const cant = parseInt(newTutoria.cantidad);
    if (!cant || cant < 1) return;
    const t = {
      id: Date.now(),
      tipo: newTutoria.tipo,
      cantidad: cant,
      ingreso: 0,
      ahorro: cant * 10000,
      fecha: new Date().toLocaleDateString("es-CO"),
    };
    setData(d => ({ ...d, tutoriasGuardadas: [t, ...d.tutoriasGuardadas] }));
    showFlash(`✓ ${cant} tutoría${cant > 1 ? "s" : ""} registrada${cant > 1 ? "s" : ""}`);
  }

  function eliminar(lista, id) {
    setData(d => ({ ...d, [lista]: d[lista].filter(g => g.id !== id) }));
  }

  const tabs = [
    { id: "resumen", label: "Resumen", icon: "◈" },
    { id: "gastos", label: "Gastos", icon: "↓" },
    { id: "tutorias", label: "Tutorías", icon: "✦" },
    { id: "ajustes", label: "Ajustes", icon: "⊙" },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#0f0e0c", color: "#e8e0d0" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1916; }
        ::-webkit-scrollbar-thumb { background: #b5935a; border-radius: 2px; }
        input, select { background: #1e1d1a; border: 1px solid #3a3830; color: #e8e0d0; padding: 10px 14px; border-radius: 6px; font-family: inherit; font-size: 14px; width: 100%; outline: none; }
        input:focus, select:focus { border-color: #b5935a; }
        .btn { background: #b5935a; color: #0f0e0c; border: none; padding: 10px 20px; border-radius: 6px; font-family: inherit; font-size: 14px; font-weight: bold; cursor: pointer; letter-spacing: 0.5px; transition: opacity 0.15s; }
        .btn:hover { opacity: 0.85; }
        .btn-ghost { background: transparent; color: #b5935a; border: 1px solid #b5935a; }
        .btn-danger { background: transparent; color: #c0392b; border: none; cursor: pointer; font-size: 16px; padding: 2px 6px; }
        .card { background: #1a1916; border: 1px solid #2e2d29; border-radius: 12px; padding: 20px; }
        .pos { color: #4caf50; } .neg { color: #e57373; } .gold { color: #b5935a; }
        .flash { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #4caf50; color: white; padding: 10px 24px; border-radius: 20px; font-size: 14px; z-index: 999; pointer-events: none; }
        .separator { border: none; border-top: 1px solid #2e2d29; margin: 16px 0; }
        .list-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #1e1d1a; font-size: 14px; }
        .list-item:last-child { border-bottom: none; }
        .meter { height: 6px; background: #2e2d29; border-radius: 3px; overflow: hidden; margin-top: 8px; }
        .meter-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
      `}</style>

      <div style={{ padding: "28px 20px 16px", borderBottom: "1px solid #2e2d29" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#b5935a", textTransform: "uppercase", marginBottom: 4 }}>Teorema Pedagógico</div>
        <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: 1 }}>Finanzas del hogar</div>
      </div>

      <div style={{ padding: "20px 16px 100px", maxWidth: 540, margin: "0 auto" }}>

        {tab === "resumen" && (
          <div>
            <div className="card" style={{ marginBottom: 16, background: saldo >= 0 ? "#131f14" : "#1f1313", borderColor: saldo >= 0 ? "#2d4a2e" : "#4a2d2d" }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9a9080", marginBottom: 8 }}>Saldo estimado del mes</div>
              <div style={{ fontSize: 36, fontWeight: "bold", color: saldo >= 0 ? "#4caf50" : "#e57373" }}>{fmt(saldo)}</div>
              <div style={{ fontSize: 13, color: "#9a9080", marginTop: 4 }}>
                Ingresos: {fmt(ingresosBrutos)} — Gastos: {fmt(totalGastos)}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9a9080", marginBottom: 8 }}>Hucha de tutorías</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#b5935a" }}>{fmt(totalAhorrado)}</div>
              <div style={{ fontSize: 13, color: "#9a9080", marginTop: 4 }}>
                {data.tutoriasGuardadas.length} tutoría{data.tutoriasGuardadas.length !== 1 ? "s" : ""} registrada{data.tutoriasGuardadas.length !== 1 ? "s" : ""} × $10.000
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 12, color: "#b5935a" }}>Desglose de gastos</div>
              {[
                { label: "Fijos (arriendo, wifi, servicios)", v: totalFijos },
                { label: "Mercado diario", v: totalMercado },
                { label: "Gatito 🐱", v: totalGato },
                { label: "Extras", v: totalExtras },
              ].map(({ label, v }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                    <span>{label}</span>
                    <span style={{ color: "#e57373" }}>{fmt(v)}</span>
                  </div>
                  <div className="meter">
                    <div className="meter-fill" style={{ width: `${totalGastos > 0 ? Math.min(100, (v / totalGastos) * 100) : 0}%`, background: "#e57373" }} />
                  </div>
                  <div style={{ height: 10 }} />
                </div>
              ))}
              <hr className="separator" />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                <span>Total gastos</span>
                <span style={{ color: "#e57373" }}>{fmt(totalGastos)}</span>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 12, color: "#b5935a" }}>Ingresos del mes</div>
              <div className="list-item">
                <span>Apoyo papá de Johan</span>
                <span style={{ color: "#4caf50" }}>{fmt(data.apoyoPadre)}</span>
              </div>
            </div>
          </div>
        )}

        {tab === "gastos" && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 14, color: "#b5935a" }}>Registrar gasto</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <select value={newGasto.tipo} onChange={e => setNewGasto(g => ({ ...g, tipo: e.target.value }))}>
                  <option value="mercado">🛒 Mercado</option>
                  <option value="gato">🐱 Gato</option>
                  <option value="extra">📌 Extra</option>
                </select>
                <input placeholder="Descripción (ej: pollo, aguacates…)" value={newGasto.desc} onChange={e => setNewGasto(g => ({ ...g, desc: e.target.value }))} />
                <input type="number" placeholder="Monto en pesos" value={newGasto.monto} onChange={e => setNewGasto(g => ({ ...g, monto: e.target.value }))} />
                <button className="btn" onClick={agregarGasto}>Agregar</button>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 12, color: "#b5935a" }}>Gastos fijos del mes</div>
              {FIXED_EXPENSES.map(e => (
                <div className="list-item" key={e.id}>
                  <span>{e.icon} {e.label}</span>
                  <span style={{ color: "#e57373" }}>{fmt(e.id === "gas" ? data.serviciosAjuste.gas : e.id === "luz" ? data.serviciosAjuste.luz : e.id === "agua" ? data.serviciosAjuste.agua : e.amount)}</span>
                </div>
              ))}
              <div className="list-item" style={{ fontWeight: "bold" }}>
                <span>Subtotal fijos</span>
                <span style={{ color: "#e57373" }}>{fmt(totalFijos)}</span>
              </div>
            </div>

            {data.gastosMercado.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 12, color: "#b5935a" }}>🛒 Mercado — {fmt(totalMercado)}</div>
                {data.gastosMercado.map(g => (
                  <div className="list-item" key={g.id}>
                    <div><div>{g.desc}</div><div style={{ fontSize: 12, color: "#9a9080" }}>{g.fecha}</div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#e57373" }}>{fmt(g.monto)}</span>
                      <button className="btn-danger" onClick={() => eliminar("gastosMercado", g.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.gastosGato.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 12, color: "#b5935a" }}>🐱 Gatito — {fmt(totalGato)}</div>
                {data.gastosGato.map(g => (
                  <div className="list-item" key={g.id}>
                    <div><div>{g.desc}</div><div style={{ fontSize: 12, color: "#9a9080" }}>{g.fecha}</div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#e57373" }}>{fmt(g.monto)}</span>
                      <button className="btn-danger" onClick={() => eliminar("gastosGato", g.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.gastosExtras.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 12, color: "#b5935a" }}>📌 Extras — {fmt(totalExtras)}</div>
                {data.gastosExtras.map(g => (
                  <div className="list-item" key={g.id}>
                    <div><div>{g.desc}</div><div style={{ fontSize: 12, color: "#9a9080" }}>{g.fecha}</div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#e57373" }}>{fmt(g.monto)}</span>
                      <button className="btn-danger" onClick={() => eliminar("gastosExtras", g.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.gastosMercado.length === 0 && data.gastosGato.length === 0 && data.gastosExtras.length === 0 && (
              <div style={{ textAlign: "center", color: "#9a9080", padding: "40px 0", fontSize: 14 }}>
                Sin gastos variables registrados aún.<br />¡Van bien por ahora! 🎉
              </div>
            )}
          </div>
        )}

        {tab === "tutorias" && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 14, color: "#b5935a" }}>Registrar tutoría(s)</div>
              <div style={{ fontSize: 13, color: "#9a9080", marginBottom: 14 }}>
                Cada tutoría aparta $10.000 a la hucha de ahorro.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <select value={newTutoria.tipo} onChange={e => setNewTutoria(t => ({ ...t, tipo: e.target.value }))}>
                  <option value="mate">📐 Matemáticas (Johan)</option>
                  <option value="psico">🧠 Psicopedagogía (tu pareja)</option>
                </select>
                <input type="number" min="1" placeholder="Cantidad de tutorías" value={newTutoria.cantidad} onChange={e => setNewTutoria(t => ({ ...t, cantidad: e.target.value }))} />
                <button className="btn" onClick={registrarTutorias}>Registrar</button>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16, background: "#141210", borderColor: "#3a2e1a" }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9a9080", marginBottom: 8 }}>Hucha 🏺</div>
              <div style={{ fontSize: 32, fontWeight: "bold", color: "#b5935a" }}>{fmt(totalAhorrado)}</div>
              <div style={{ fontSize: 13, color: "#9a9080", marginTop: 4 }}>
                {data.tutoriasGuardadas.length} tutoría{data.tutoriasGuardadas.length !== 1 ? "s" : ""} registradas en total
              </div>
            </div>

            {data.tutoriasGuardadas.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 12, color: "#b5935a" }}>Historial</div>
                {data.tutoriasGuardadas.map(t => (
                  <div className="list-item" key={t.id}>
                    <div>
                      <div>{t.tipo === "mate" ? "📐 Matemáticas" : "🧠 Psicopedagogía"} × {t.cantidad}</div>
                      <div style={{ fontSize: 12, color: "#9a9080" }}>{t.fecha}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#b5935a" }}>+{fmt(t.ahorro)}</span>
                      <button className="btn-danger" onClick={() => eliminar("tutoriasGuardadas", t.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "ajustes" && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 14, color: "#b5935a" }}>Ajustar servicios del mes</div>
              <div style={{ fontSize: 13, color: "#9a9080", marginBottom: 16 }}>Los servicios varían; actualiza cuando llegue el recibo.</div>
              {[
                { key: "gas", label: "🔥 Gas" },
                { key: "luz", label: "💡 Luz" },
                { key: "agua", label: "💧 Agua" },
              ].map(s => (
                <div key={s.key} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>{s.label}</div>
                  <input type="number" value={data.serviciosAjuste[s.key]} onChange={e => setData(d => ({ ...d, serviciosAjuste: { ...d.serviciosAjuste, [s.key]: parseInt(e.target.value) || 0 } }))} />
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 14, color: "#b5935a" }}>Apoyo mensual papá de Johan</div>
              <input type="number" value={data.apoyoPadre} onChange={e => setData(d => ({ ...d, apoyoPadre: parseInt(e.target.value) || 0 }))} />
            </div>

            <div className="card" style={{ borderColor: "#4a2d2d" }}>
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 10, color: "#e57373" }}>Zona de peligro</div>
              <div style={{ fontSize: 13, color: "#9a9080", marginBottom: 14 }}>Esto borra TODOS los registros variables. Los gastos fijos no se borran.</div>
              <button className="btn btn-ghost" style={{ borderColor: "#c0392b", color: "#e57373" }} onClick={() => {
                if (confirm("¿Seguro? Esto reinicia el mes.")) {
                  setData(d => ({ ...d, gastosMercado: [], gastosGato: [], gastosExtras: [], tutoriasGuardadas: [] }));
                  showFlash("Mes reiniciado ✓");
                }
              }}>Reiniciar mes</button>
            </div>
          </div>
        )}
      </div>

      {flash && <div className="flash">{flash}</div>}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#141311", borderTop: "1px solid #2e2d29", display: "flex", justifyContent: "space-around", padding: "8px 0 16px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", color: tab === t.id ? "#b5935a" : "#9a9080", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 16px", fontSize: tab === t.id ? 18 : 16, transition: "color 0.15s" }}>
            <span>{t.icon}</span>
            <span style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

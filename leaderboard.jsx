import { useState, useEffect } from "react";

const INITIAL_ENTRIES = [
  {
    id: "pr-baseline",
    pr: "baseline",
    branch: "main",
    author: "sneha",
    date: "2025-01-01",
    model: "SVM",
    accuracy: 0.7800,
    precision: 0.7806,
    recall: 0.7800,
    f1: 0.7803,
    auc: 0.8496,
    note: "Initial baseline",
  },
  {
    id: "pr-baseline-rf",
    pr: "baseline",
    branch: "main",
    author: "sneha",
    date: "2025-01-01",
    model: "Random Forest",
    accuracy: 0.7708,
    precision: 0.7605,
    recall: 0.7708,
    f1: 0.7649,
    auc: null,
    note: "Initial baseline",
  },
  {
    id: "pr-baseline-lr",
    pr: "baseline",
    branch: "main",
    author: "sneha",
    date: "2025-01-01",
    model: "Logistic Regression",
    accuracy: 0.7600,
    precision: 0.7739,
    recall: 0.7600,
    f1: 0.7659,
    auc: null,
    note: "Initial baseline",
  },
];

const MODEL_COLORS = {
  "SVM": "#00e5ff",
  "Random Forest": "#76ff03",
  "Logistic Regression": "#ff6d00",
  "XGBoost": "#e040fb",
  "Neural Net": "#ff4081",
  "Other": "#ffeb3b",
};

const fmt = (v) => (v != null ? (v * 100).toFixed(2) + "%" : "—");
const fmtRaw = (v) => (v != null ? (v * 100).toFixed(2) : "—");

const METRIC_KEYS = ["accuracy", "precision", "recall", "f1", "auc"];

function MiniBar({ value, max = 1, color }) {
  const pct = value != null ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 80, height: 6, background: "rgba(255,255,255,0.08)",
        borderRadius: 3, overflow: "hidden", flexShrink: 0
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color, borderRadius: 3,
          transition: "width 0.6s cubic-bezier(.23,1,.32,1)"
        }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#ccc", minWidth: 40 }}>
        {value != null ? fmtRaw(value) : "—"}
      </span>
    </div>
  );
}

function Delta({ current, best }) {
  if (current == null || best == null) return null;
  const d = ((current - best) * 100).toFixed(2);
  const pos = parseFloat(d) >= 0;
  if (Math.abs(parseFloat(d)) < 0.001) return <span style={{ color: "#888", fontSize: 10 }}>—</span>;
  return (
    <span style={{
      fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
      color: pos ? "#76ff03" : "#ff4444",
      background: pos ? "rgba(118,255,3,0.1)" : "rgba(255,68,68,0.1)",
      padding: "1px 4px", borderRadius: 3
    }}>
      {pos ? "+" : ""}{d}
    </span>
  );
}

function Modal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    pr: "", branch: "", author: "", date: new Date().toISOString().split("T")[0],
    model: "SVM", accuracy: "", precision: "", recall: "", f1: "", auc: "", note: ""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.pr || !form.accuracy) return;
    onAdd({
      id: `pr-${Date.now()}`,
      pr: form.pr, branch: form.branch, author: form.author, date: form.date,
      model: form.model,
      accuracy: parseFloat(form.accuracy) / 100,
      precision: form.precision ? parseFloat(form.precision) / 100 : null,
      recall: form.recall ? parseFloat(form.recall) / 100 : null,
      f1: form.f1 ? parseFloat(form.f1) / 100 : null,
      auc: form.auc ? parseFloat(form.auc) / 100 : null,
      note: form.note,
    });
    onClose();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 6, padding: "8px 10px", color: "#fff", fontSize: 13,
    fontFamily: "'JetBrains Mono',monospace", width: "100%", boxSizing: "border-box",
    outline: "none",
  };
  const labelStyle = { fontSize: 11, color: "#888", marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.08em" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)"
    }} onClick={onClose}>
      <div style={{
        background: "#111820", border: "1px solid rgba(0,229,255,0.2)",
        borderRadius: 16, padding: 28, width: 480, maxWidth: "95vw",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,229,255,0.05)"
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 20px", color: "#00e5ff", fontSize: 16, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "0.05em" }}>
          + LOG PR RUN
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            ["PR / Commit", "pr", "e.g. #42 or abc1234"],
            ["Branch", "branch", "feature/tune-svm"],
            ["Author", "author", "github username"],
            ["Date", "date", "", "date"],
          ].map(([label, key, placeholder, type]) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input type={type || "text"} value={form[key]} placeholder={placeholder}
                onChange={e => set(key, e.target.value)} style={inputStyle} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Model</label>
          <select value={form.model} onChange={e => set("model", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {["SVM", "Random Forest", "Logistic Regression", "XGBoost", "Neural Net", "Other"].map(m =>
              <option key={m} value={m}>{m}</option>
            )}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          {[["Accuracy %", "accuracy"], ["Precision %", "precision"], ["Recall %", "recall"],
            ["F1 Score %", "f1"], ["AUC %", "auc"]].map(([label, key]) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input type="number" min="0" max="100" step="0.01"
                value={form[key]} onChange={e => set(key, e.target.value)}
                placeholder="e.g. 78.00" style={inputStyle} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Note</label>
          <input type="text" value={form.note} placeholder="What changed in this PR?"
            onChange={e => set("note", e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent", color: "#888", cursor: "pointer", fontSize: 13
          }}>Cancel</button>
          <button onClick={handleSubmit} style={{
            padding: "8px 22px", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg, #00e5ff, #0070ff)",
            color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 13,
            fontFamily: "'Space Grotesk',sans-serif"
          }}>Log Run</button>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [sortKey, setSortKey] = useState("accuracy");
  const [filterModel, setFilterModel] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("leaderboard-entries");
        if (res && res.value) {
          setEntries(JSON.parse(res.value));
        } else {
          setEntries(INITIAL_ENTRIES);
        }
      } catch {
        setEntries(INITIAL_ENTRIES);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("leaderboard-entries", JSON.stringify(entries)).catch(() => {});
  }, [entries, loaded]);

  const addEntry = (e) => setEntries(prev => [...prev, e]);
  const removeEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id));

  const models = ["All", ...Array.from(new Set(entries.map(e => e.model)))];
  const filtered = entries
    .filter(e => filterModel === "All" || e.model === filterModel)
    .sort((a, b) => (b[sortKey] ?? -1) - (a[sortKey] ?? -1));

  const bestByMetric = {};
  METRIC_KEYS.forEach(k => {
    const best = Math.max(...entries.map(e => e[k] ?? 0));
    bestByMetric[k] = best > 0 ? best : null;
  });

  const leader = filtered[0];

  if (!loaded) return (
    <div style={{ background: "#0a0f16", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#00e5ff", fontFamily: "monospace" }}>Loading…</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0f16; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .row-hover { transition: background 0.15s; }
        .row-hover:hover { background: rgba(0,229,255,0.04) !important; }
        .sort-btn { cursor: pointer; user-select: none; transition: color 0.15s; }
        .sort-btn:hover { color: #00e5ff !important; }
        .tag { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px;
          font-family: 'JetBrains Mono',monospace; font-weight: 500; }
        .chip { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px;
          font-size: 12px; cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
          font-family: 'Space Grotesk',sans-serif; font-weight: 500; }
        .chip:hover { border-color: rgba(0,229,255,0.4); color: #00e5ff !important; }
        .chip.active { background: rgba(0,229,255,0.12); border-color: rgba(0,229,255,0.4); color: #00e5ff; }
        .action-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #666;
          border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 12px;
          transition: all 0.15s; font-family: 'JetBrains Mono',monospace; }
        .action-btn:hover { border-color: #ff4444; color: #ff4444; background: rgba(255,68,68,0.08); }
      `}</style>

      <div style={{ background: "#0a0f16", minHeight: "100vh", padding: "32px 24px", fontFamily: "'Space Grotesk',sans-serif" }}>

        {/* Header */}
        <div style={{ maxWidth: 1100, margin: "0 auto 32px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
                <span style={{ fontSize: 11, color: "#00e5ff", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  Sonar Acoustic · ML Leaderboard
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                PR Performance Tracker
              </h1>
              <p style={{ margin: "6px 0 0", color: "#556", fontSize: 13 }}>
                Track model metric changes across pull requests · {entries.length} run{entries.length !== 1 ? "s" : ""} logged
              </p>
            </div>
            <button onClick={() => setShowModal(true)} style={{
              padding: "10px 22px", borderRadius: 10,
              background: "linear-gradient(135deg, #00e5ff 0%, #0070ff 100%)",
              border: "none", color: "#000", fontWeight: 700, cursor: "pointer",
              fontSize: 14, fontFamily: "'Space Grotesk',sans-serif",
              boxShadow: "0 4px 20px rgba(0,229,255,0.25)",
              display: "flex", alignItems: "center", gap: 6
            }}>
              + Log PR Run
            </button>
          </div>
        </div>

        {/* Top 3 Cards */}
        {filtered.length > 0 && (
          <div style={{ maxWidth: 1100, margin: "0 auto 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {filtered.slice(0, 3).map((e, i) => {
              const color = MODEL_COLORS[e.model] || MODEL_COLORS.Other;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={e.id} style={{
                  background: i === 0
                    ? "linear-gradient(135deg, rgba(0,229,255,0.08), rgba(0,112,255,0.06))"
                    : "rgba(255,255,255,0.02)",
                  border: i === 0 ? "1px solid rgba(0,229,255,0.25)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14, padding: 20,
                  boxShadow: i === 0 ? "0 0 40px rgba(0,229,255,0.07)" : "none"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{medals[i]}</span>
                    <span className="tag" style={{
                      background: `${color}18`, color, border: `1px solid ${color}44`
                    }}>{e.model}</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 500, color: "#fff", marginBottom: 2 }}>
                    {fmtRaw(e.accuracy)}<span style={{ fontSize: 14, color: "#556" }}>%</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#556", marginBottom: 10 }}>Accuracy</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    PR <span style={{ color: "#00e5ff" }}>{e.pr}</span>
                    {e.branch && <span style={{ color: "#556" }}> · {e.branch}</span>}
                  </div>
                  {e.note && <div style={{ fontSize: 11, color: "#445", marginTop: 4, fontStyle: "italic" }}>{e.note}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Filters + Sort */}
        <div style={{ maxWidth: 1100, margin: "0 auto 16px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {models.map(m => (
              <button key={m} className={`chip ${filterModel === m ? "active" : ""}`}
                onClick={() => setFilterModel(m)}
                style={{ color: filterModel === m ? "#00e5ff" : "#666", background: filterModel === m ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.03)" }}>
                {m}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#556", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sort:</span>
            {METRIC_KEYS.map(k => (
              <button key={k} onClick={() => setSortKey(k)}
                className="sort-btn"
                style={{
                  background: "none", border: "none", padding: "4px 8px",
                  fontSize: 12, color: sortKey === k ? "#00e5ff" : "#556",
                  fontFamily: "'JetBrains Mono',monospace",
                  borderBottom: sortKey === k ? "1px solid #00e5ff" : "1px solid transparent"
                }}>
                {k.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ maxWidth: 1100, margin: "0 auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["#", "PR", "Branch", "Author", "Model", "Accuracy", "Precision", "Recall", "F1", "AUC", "Note", ""].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 14px", fontSize: 10,
                    color: "#445", textTransform: "uppercase", letterSpacing: "0.1em",
                    fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", whiteSpace: "nowrap"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const color = MODEL_COLORS[e.model] || MODEL_COLORS.Other;
                const isLeader = i === 0;
                return (
                  <tr key={e.id} className="row-hover" style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: isLeader ? "rgba(0,229,255,0.03)" : "transparent"
                  }}>
                    <td style={{ padding: "12px 14px", color: "#445", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
                      {isLeader ? "★" : i + 1}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ color: "#00e5ff", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 500 }}>
                        {e.pr}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#556", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.branch || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#888", fontSize: 12 }}>
                      {e.author || "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="tag" style={{ background: `${color}15`, color, border: `1px solid ${color}35`, fontSize: 11 }}>
                        {e.model}
                      </span>
                    </td>
                    {["accuracy", "precision", "recall", "f1", "auc"].map(k => (
                      <td key={k} style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <MiniBar value={e[k]} color={color} />
                          {bestByMetric[k] != null && <Delta current={e[k]} best={bestByMetric[k]} />}
                        </div>
                      </td>
                    ))}
                    <td style={{ padding: "12px 14px", color: "#445", fontSize: 12, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.note || "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <button className="action-btn" onClick={() => removeEntry(e.id)} title="Remove">✕</button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ padding: "40px 14px", textAlign: "center", color: "#334", fontSize: 13 }}>
                    No runs logged yet. Click "+ Log PR Run" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer legend */}
        <div style={{ maxWidth: 1100, margin: "24px auto 0", display: "flex", gap: 20, flexWrap: "wrap" }}>
          {METRIC_KEYS.map(k => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#445" }}>
              <span style={{ color: "#00e5ff", fontFamily: "monospace" }}>▲</span>
              <span style={{ color: "#76ff03" }}>+Δ</span> / <span style={{ color: "#ff4444" }}>−Δ</span>
              <span>= diff from best {k.toUpperCase()}</span>
            </div>
          )).slice(0, 1)}
          <div style={{ fontSize: 11, color: "#334" }}>
            Bar width = metric value (0–100%). Δ shown relative to best logged run. Click ✕ to remove a row.
          </div>
        </div>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} onAdd={addEntry} />}
    </>
  );
}

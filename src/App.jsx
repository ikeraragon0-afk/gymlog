import { useState, useEffect, useRef } from "react";

// ── STORAGE HOOK ──────────────────────────────────────────────────────────────
function useLS(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)); }, [key, v]);
  return [v, setV];
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 8);
const oneRM = (w, r) => r === 1 ? w : Math.round(w * (1 + r / 30));
const fmtDate = (d) => new Date(d + "T12:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
const fmtDuration = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, "0")}`; };

// ── EXERCISE DATABASE ─────────────────────────────────────────────────────────
const EXERCISES = {
  "Pecho": ["Press banca plano", "Press banca inclinado", "Press banca declinado", "Aperturas cable", "Aperturas mancuernas", "Fondos pecho", "Press mancuernas plano", "Pullover"],
  "Espalda": ["Dominadas", "Dominadas agarre supino", "Remo barra", "Remo mancuerna", "Jalón polea", "Remo en polea", "Face pull", "Remo en máquina", "Peso muerto"],
  "Hombros": ["Press militar barra", "Press mancuernas", "Elevaciones laterales", "Elevaciones frontales", "Pájaros", "Press Arnold", "Encogimientos"],
  "Bíceps": ["Curl barra", "Curl mancuernas", "Curl martillo", "Curl concentrado", "Curl en polea baja", "Curl 21s"],
  "Tríceps": ["Press francés", "Extensión polea alta", "Fondos tríceps", "Patada de tríceps", "Press cerrado", "Extensión mancuerna"],
  "Piernas": ["Sentadilla barra", "Prensa de piernas", "Peso muerto rumano", "Zancadas", "Curl femoral", "Extensión cuádriceps", "Sentadilla búlgara", "Hip thrust", "Gemelos en máquina"],
  "Core": ["Plancha", "Crunch", "Elevación de piernas", "Russian twist", "Ab wheel", "Crunch en polea"],
  "Cardio": ["Correr cinta", "Bicicleta estática", "Elíptica", "Remo ergómetro", "HIIT cinta"],
};

const ALL_EXERCISES = Object.entries(EXERCISES).flatMap(([g, exs]) => exs.map(e => ({ name: e, group: g })));

// ── DESIGN TOKENS — Apple/Nike light ─────────────────────────────────────────
const C = {
  bg: "#FFFFFF",
  bg2: "#F5F5F7",
  bg3: "#EBEBF0",
  card: "#FFFFFF",
  border: "#E0E0E5",
  text: "#0A0A0A",
  sub: "#8A8A8E",
  muted: "#C7C7CC",
  accent: "#FF3B30",      // Nike/Apple red
  accentDark: "#CC2200",
  blue: "#007AFF",
  green: "#34C759",
  orange: "#FF9500",
  purple: "#AF52DE",
};

const FONT = "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif";

// ── BASE COMPONENTS ───────────────────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
      padding: "16px", marginBottom: 10,
      cursor: onClick ? "pointer" : "default",
      transition: "transform .1s",
      ...style,
    }}
      onMouseDown={e => onClick && (e.currentTarget.style.transform = "scale(0.985)")}
      onMouseUp={e => onClick && (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={e => onClick && (e.currentTarget.style.transform = "scale(1)")}
    >{children}</div>
  );
}

function Btn({ children, onClick, variant = "primary", small, full, disabled, style = {} }) {
  const base = {
    borderRadius: small ? 10 : 13, border: "none", fontFamily: FONT,
    fontSize: small ? 14 : 16, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    width: full ? "100%" : "auto", transition: "all .15s",
    padding: small ? "8px 16px" : "14px 22px",
    letterSpacing: -0.2, opacity: disabled ? 0.4 : 1,
  };
  const variants = {
    primary: { background: C.text, color: "#fff" },
    accent: { background: C.accent, color: "#fff" },
    ghost: { background: C.bg2, color: C.text },
    danger: { background: "#FFF0EE", color: C.accent },
    outline: { background: "transparent", color: C.text, border: `1.5px solid ${C.border}` },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.82")}
      onMouseLeave={e => (e.currentTarget.style.opacity = disabled ? "0.4" : "1")}
    >{children}</button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, min, step, autoFocus, large }) {
  const ref = useRef();
  useEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <div style={{ fontSize: 12, color: C.sub, fontWeight: 600, marginBottom: 5, letterSpacing: 0.2, textTransform: "uppercase" }}>{label}</div>}
      <input ref={ref} type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} min={min} step={step}
        style={{
          width: "100%", padding: large ? "16px 14px" : "11px 13px",
          borderRadius: 11, border: `1.5px solid ${C.border}`,
          background: C.bg2, color: C.text, fontFamily: FONT,
          fontSize: large ? 22 : 16, fontWeight: large ? 700 : 400,
          outline: "none", boxSizing: "border-box", transition: "border-color .2s",
        }}
        onFocus={e => e.target.style.borderColor = C.text}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

function Tag({ label, color = C.text, bg }) {
  return (
    <span style={{
      background: bg || color + "12", color, borderRadius: 8, padding: "3px 9px",
      fontSize: 12, fontWeight: 700, letterSpacing: 0.2,
    }}>{label}</span>
  );
}

// Rest timer component
function RestTimer({ onDone }) {
  const [secs, setSecs] = useState(90);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const total = 90;

  useEffect(() => {
    if (!running) return;
    if (elapsed >= total) { setRunning(false); onDone?.(); return; }
    const t = setTimeout(() => setElapsed(e => e + 1), 1000);
    return () => clearTimeout(t);
  }, [running, elapsed]);

  const remaining = total - elapsed;
  const pct = elapsed / total;
  const r = 26; const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.bg2, borderRadius: 14, padding: "12px 16px", marginBottom: 12 }}>
      <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
        <svg width={60} height={60} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
          <circle cx={30} cy={30} r={r} fill="none" stroke={C.border} strokeWidth={4} />
          <circle cx={30} cy={30} r={r} fill="none" stroke={remaining > 20 ? C.green : C.accent}
            strokeWidth={4} strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray .9s linear" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: remaining > 20 ? C.text : C.accent }}>{fmtDuration(remaining)}</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Descanso</div>
        <div style={{ fontSize: 13, color: C.sub }}>Próxima serie en {fmtDuration(remaining)}</div>
      </div>
      <Btn small variant="ghost" onClick={() => { setRunning(false); onDone?.(); }}>Saltar</Btn>
    </div>
  );
}

// ── EXERCISE PICKER MODAL ─────────────────────────────────────────────────────
function ExercisePicker({ onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("Todos");
  const groups = ["Todos", ...Object.keys(EXERCISES)];
  const filtered = ALL_EXERCISES.filter(e =>
    (group === "Todos" || e.group === group) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ background: C.bg, borderRadius: "24px 24px 0 0", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, background: C.muted, borderRadius: 2 }} />
        </div>

        <div style={{ padding: "14px 18px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Elegir ejercicio</div>
            <button onClick={onClose} style={{ background: C.bg2, border: "none", borderRadius: 20, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: C.sub }}>✕</button>
          </div>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ejercicio…"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.bg2, fontFamily: FONT, fontSize: 15, color: C.text, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
            onFocus={e => e.target.style.borderColor = C.text} onBlur={e => e.target.style.borderColor = C.border}
          />

          {/* Group pills */}
          <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
            {groups.map(g => (
              <button key={g} onClick={() => setGroup(g)} style={{
                borderRadius: 20, padding: "6px 14px", border: "none", cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: FONT, fontSize: 13, fontWeight: 600,
                background: group === g ? C.text : C.bg2,
                color: group === g ? "#fff" : C.sub,
              }}>{g}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 18px 32px" }}>
          {filtered.map((e, i) => (
            <div key={i} onClick={() => onSelect(e)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer",
            }}
              onMouseEnter={el => el.currentTarget.style.opacity = ".7"}
              onMouseLeave={el => el.currentTarget.style.opacity = "1"}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{e.name}</div>
                <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{e.group}</div>
              </div>
              <div style={{ color: C.muted, fontSize: 20 }}>+</div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ color: C.sub, textAlign: "center", padding: 32, fontSize: 15 }}>No hay ejercicios con ese nombre</div>}
        </div>
      </div>
    </div>
  );
}

// ── ACTIVE WORKOUT SCREEN ─────────────────────────────────────────────────────
function ActiveWorkout({ routine, history, onFinish, onCancel }) {
  // exercises = [{ id, name, group, sets: [{id, weight, reps, done}] }]
  const [exercises, setExercises] = useState(() =>
    (routine?.exercises || []).map(e => ({
      ...e, id: uid(),
      sets: (e.sets || [{ weight: "", reps: "" }]).map(s => ({ ...s, id: uid(), done: false }))
    }))
  );
  const [showPicker, setShowPicker] = useState(exercises.length === 0);
  const [timer, setTimer] = useState(0);
  const [showRest, setShowRest] = useState(false);
  const [restAfter, setRestAfter] = useState(null);
  const [note, setNote] = useState("");
  const timerRef = useRef();
  const startRef = useRef(Date.now());

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const addExercise = (ex) => {
    // Find last session data for this exercise
    const lastSession = history.flatMap(h => h.exercises).filter(e => e.name === ex.name).slice(-1)[0];
    const lastSets = lastSession?.sets || [];
    const defaultSets = lastSets.length > 0
      ? lastSets.map(s => ({ id: uid(), weight: s.weight, reps: s.reps, done: false }))
      : [{ id: uid(), weight: "", reps: "", done: false }];
    setExercises(prev => [...prev, { id: uid(), name: ex.name, group: ex.group, sets: defaultSets }]);
    setShowPicker(false);
  };

  const addSet = (exId) => {
    setExercises(prev => prev.map(e => {
      if (e.id !== exId) return e;
      const last = e.sets[e.sets.length - 1];
      return { ...e, sets: [...e.sets, { id: uid(), weight: last?.weight || "", reps: last?.reps || "", done: false }] };
    }));
  };

  const removeSet = (exId, setId) => {
    setExercises(prev => prev.map(e => {
      if (e.id !== exId) return e;
      const sets = e.sets.filter(s => s.id !== setId);
      return { ...e, sets: sets.length > 0 ? sets : e.sets }; // keep at least 1
    }));
  };

  const updateSet = (exId, setId, field, val) => {
    setExercises(prev => prev.map(e =>
      e.id !== exId ? e : {
        ...e, sets: e.sets.map(s => s.id !== setId ? s : { ...s, [field]: val })
      }
    ));
  };

  const completeSet = (exId, setId) => {
    setExercises(prev => prev.map(e =>
      e.id !== exId ? e : {
        ...e, sets: e.sets.map(s => s.id !== setId ? s : { ...s, done: true })
      }
    ));
    setRestAfter({ exId, setId });
    setShowRest(true);
  };

  const removeExercise = (exId) => setExercises(prev => prev.filter(e => e.id !== exId));

  const totalSets = exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const totalVol = exercises.reduce((a, e) => a + e.sets.filter(s => s.done).reduce((b, s) => b + (+s.weight || 0) * (+s.reps || 0), 0), 0);

  const finish = () => {
    const completedExercises = exercises
      .map(e => ({ ...e, sets: e.sets.filter(s => s.done && s.weight && s.reps) }))
      .filter(e => e.sets.length > 0);
    if (completedExercises.length === 0) { onCancel(); return; }
    onFinish({
      id: uid(), date: todayStr(), duration: timer,
      name: routine?.name || "Entreno libre",
      exercises: completedExercises, note,
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT }}>
      {showPicker && <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />}

      {/* Header */}
      <div style={{ position: "sticky", top: 0, background: C.bg, borderBottom: `1px solid ${C.border}`, zIndex: 50, padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{routine?.name || "Entreno libre"}</div>
            <div style={{ fontSize: 14, color: C.accent, fontWeight: 700, marginTop: 1 }}>{fmtDuration(timer)} · {totalSets} series · {totalVol.toLocaleString("es-ES")}kg vol.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small variant="ghost" onClick={onCancel}>Cancelar</Btn>
            <Btn small variant="accent" onClick={finish}>Finalizar</Btn>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px 120px" }}>
        {/* Rest timer */}
        {showRest && <RestTimer onDone={() => setShowRest(false)} />}

        {/* Exercises */}
        {exercises.map((ex) => {
          // Find PR for this exercise
          const allPrevSets = history.flatMap(h => h.exercises).filter(e => e.name === ex.name).flatMap(e => e.sets);
          const prWeight = allPrevSets.reduce((mx, s) => Math.max(mx, +s.weight || 0), 0);

          return (
            <div key={ex.id} style={{ marginBottom: 20 }}>
              {/* Exercise header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{ex.name}</div>
                  <div style={{ fontSize: 13, color: C.sub }}>{ex.group}{prWeight > 0 && ` · PR: ${prWeight}kg`}</div>
                </div>
                <button onClick={() => removeExercise(ex.id)} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", padding: 4 }}>✕</button>
              </div>

              {/* Set header */}
              <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 52px", gap: 6, marginBottom: 6, paddingLeft: 2 }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Ser.</div>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase", textAlign: "center" }}>Kg</div>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase", textAlign: "center" }}>Reps</div>
                <div />
              </div>

              {/* Sets */}
              {ex.sets.map((s, i) => (
                <div key={s.id} style={{
                  display: "grid", gridTemplateColumns: "28px 1fr 1fr 52px", gap: 6,
                  alignItems: "center", marginBottom: 8,
                  opacity: s.done ? 0.5 : 1, transition: "opacity .3s",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.done ? C.green : C.sub, textAlign: "center" }}>
                    {s.done ? "✓" : i + 1}
                  </div>
                  <input
                    type="number" value={s.weight} onChange={e => updateSet(ex.id, s.id, "weight", e.target.value)}
                    placeholder="kg" min="0" step="0.5" disabled={s.done}
                    style={{
                      padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${s.done ? C.green + "44" : C.border}`,
                      background: s.done ? "#F0FFF4" : C.bg2, color: C.text, fontFamily: FONT,
                      fontSize: 16, fontWeight: 700, textAlign: "center", outline: "none", width: "100%", boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.borderColor = C.text}
                    onBlur={e => e.target.style.borderColor = s.done ? C.green + "44" : C.border}
                  />
                  <input
                    type="number" value={s.reps} onChange={e => updateSet(ex.id, s.id, "reps", e.target.value)}
                    placeholder="reps" min="1" disabled={s.done}
                    style={{
                      padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${s.done ? C.green + "44" : C.border}`,
                      background: s.done ? "#F0FFF4" : C.bg2, color: C.text, fontFamily: FONT,
                      fontSize: 16, fontWeight: 700, textAlign: "center", outline: "none", width: "100%", boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.borderColor = C.text}
                    onBlur={e => e.target.style.borderColor = s.done ? C.green + "44" : C.border}
                  />
                  {s.done
                    ? <button onClick={() => removeSet(ex.id, s.id)} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: 4 }}>✕</button>
                    : <button onClick={() => {
                      if (!s.weight || !s.reps) return;
                      // Detect PR
                      if (+s.weight > prWeight && prWeight > 0) {
                        // flash handled by done state
                      }
                      completeSet(ex.id, s.id);
                    }} style={{
                      background: C.text, color: "#fff", border: "none", borderRadius: 10,
                      padding: "10px 0", fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%",
                    }}>✓</button>
                  }
                </div>
              ))}

              {/* Add set */}
              <button onClick={() => addSet(ex.id)} style={{
                width: "100%", padding: "10px", borderRadius: 10, border: `1.5px dashed ${C.border}`,
                background: "transparent", color: C.sub, fontFamily: FONT, fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>+ Añadir serie</button>
            </div>
          );
        })}

        {/* Add exercise */}
        <Btn full variant="ghost" onClick={() => setShowPicker(true)} style={{ marginTop: 4, marginBottom: 14 }}>
          + Añadir ejercicio
        </Btn>

        {/* Note */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: C.sub, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: .2 }}>Nota del entreno</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Cómo fue el entreno…"
            style={{
              width: "100%", padding: "12px 13px", borderRadius: 11, border: `1.5px solid ${C.border}`,
              background: C.bg2, color: C.text, fontFamily: FONT, fontSize: 15, resize: "none",
              outline: "none", boxSizing: "border-box", minHeight: 80,
            }} />
        </div>
      </div>
    </div>
  );
}

// ── ROUTINE MANAGER ───────────────────────────────────────────────────────────
function RoutineModal({ routine, onSave, onClose }) {
  const [name, setName] = useState(routine?.name || "");
  const [exercises, setExercises] = useState(routine?.exercises || []);
  const [showPicker, setShowPicker] = useState(false);

  const addEx = (ex) => {
    setExercises(prev => [...prev, { name: ex.name, group: ex.group, sets: [{ weight: "", reps: "10" }] }]);
    setShowPicker(false);
  };

  const removeEx = (i) => setExercises(prev => prev.filter((_, idx) => idx !== i));

  const save = () => {
    if (!name.trim()) return;
    onSave({ id: routine?.id || uid(), name, exercises });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {showPicker && <ExercisePicker onSelect={addEx} onClose={() => setShowPicker(false)} />}
      <div style={{ background: C.bg, borderRadius: "24px 24px 0 0", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, background: C.muted, borderRadius: 2 }} />
        </div>
        <div style={{ padding: "14px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{routine ? "Editar rutina" : "Nueva rutina"}</div>
          <button onClick={onClose} style={{ background: C.bg2, border: "none", borderRadius: 20, width: 32, height: 32, cursor: "pointer", color: C.sub }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "14px 18px 32px" }}>
          <Input label="Nombre de la rutina" value={name} onChange={setName} placeholder="Ej. Push A, Piernas, Fullbody…" autoFocus />
          <div style={{ fontSize: 12, color: C.sub, fontWeight: 600, marginBottom: 10, marginTop: 4, textTransform: "uppercase", letterSpacing: .2 }}>Ejercicios ({exercises.length})</div>
          {exercises.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{e.name}</div>
                <div style={{ fontSize: 13, color: C.sub }}>{e.group}</div>
              </div>
              <button onClick={() => removeEx(i)} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <button onClick={() => setShowPicker(true)} style={{
            width: "100%", padding: "13px", borderRadius: 12, border: `1.5px dashed ${C.border}`,
            background: "transparent", color: C.sub, fontFamily: FONT, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8, marginBottom: 16,
          }}>+ Añadir ejercicio</button>
          <Btn full onClick={save} disabled={!name.trim()}>Guardar rutina</Btn>
        </div>
      </div>
    </div>
  );
}

// ── WORKOUT DETAIL ────────────────────────────────────────────────────────────
function WorkoutDetail({ workout, onClose, onDelete }) {
  const vol = workout.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + (+s.weight || 0) * (+s.reps || 0), 0), 0);
  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 150, display: "flex", flexDirection: "column", fontFamily: FONT }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.blue, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>← Volver</button>
        <button onClick={() => { onDelete(workout.id); onClose(); }} style={{ background: "none", border: "none", color: C.accent, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Eliminar</button>
      </div>

      <div style={{ overflowY: "auto", flex: 1, padding: "18px 18px 48px" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 4 }}>{workout.name}</div>
        <div style={{ fontSize: 14, color: C.sub, marginBottom: 18 }}>{fmtDate(workout.date)}</div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { l: "Duración", v: fmtDuration(workout.duration || 0), color: C.blue },
            { l: "Series", v: totalSets, color: C.text },
            { l: "Volumen", v: `${vol.toLocaleString("es-ES")}kg`, color: C.accent },
          ].map(s => (
            <div key={s.l} style={{ background: C.bg2, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.v}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Exercises */}
        {workout.exercises.map((ex, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 8 }}>{ex.name}</div>
            {/* Set rows */}
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr", gap: 4, marginBottom: 5 }}>
              {["", "Kg", "Reps", "1RM"].map(h => <div key={h} style={{ fontSize: 11, color: C.sub, fontWeight: 700, textAlign: "center", textTransform: "uppercase" }}>{h}</div>)}
            </div>
            {ex.sets.map((s, j) => (
              <div key={j} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 1fr", gap: 4, marginBottom: 6, alignItems: "center" }}>
                <div style={{ fontSize: 12, color: C.sub, textAlign: "center" }}>{j + 1}</div>
                <div style={{ background: C.bg2, borderRadius: 8, padding: "8px 6px", textAlign: "center", fontSize: 15, fontWeight: 700, color: C.text }}>{s.weight}</div>
                <div style={{ background: C.bg2, borderRadius: 8, padding: "8px 6px", textAlign: "center", fontSize: 15, fontWeight: 700, color: C.text }}>{s.reps}</div>
                <div style={{ background: C.bg2, borderRadius: 8, padding: "8px 6px", textAlign: "center", fontSize: 13, fontWeight: 600, color: C.accent }}>{oneRM(+s.weight, +s.reps)}kg</div>
              </div>
            ))}
          </div>
        ))}

        {workout.note && (
          <div style={{ background: C.bg2, borderRadius: 12, padding: "14px", marginTop: 8 }}>
            <div style={{ fontSize: 12, color: C.sub, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Nota</div>
            <div style={{ fontSize: 15, color: C.text }}>{workout.note}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROGRESS SCREEN ───────────────────────────────────────────────────────────
function ProgressScreen({ history }) {
  const [selectedEx, setSelectedEx] = useState(null);
  const [search, setSearch] = useState("");

  // All exercises ever done
  const doneExercises = [...new Set(history.flatMap(h => h.exercises.map(e => e.name)))];
  const filtered = doneExercises.filter(e => e.toLowerCase().includes(search.toLowerCase()));

  // Data for selected exercise
  const exData = selectedEx
    ? history
        .flatMap(h => h.exercises.filter(e => e.name === selectedEx).map(e => ({
          date: h.date,
          maxWeight: Math.max(...e.sets.map(s => +s.weight || 0)),
          max1RM: Math.max(...e.sets.map(s => oneRM(+s.weight || 0, +s.reps || 0))),
          volume: e.sets.reduce((a, s) => a + (+s.weight || 0) * (+s.reps || 0), 0),
        })))
        .slice(-12)
    : [];

  const max1RM = exData.length ? Math.max(...exData.map(d => d.max1RM)) : 0;
  const min1RM = exData.length ? Math.min(...exData.map(d => d.max1RM)) : 0;

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 18, paddingTop: 8 }}>Progreso</div>

      {!selectedEx ? (
        <>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Sin datos todavía</div>
              <div style={{ fontSize: 15, color: C.sub }}>Completa tu primer entreno para ver el progreso</div>
            </div>
          ) : (
            <>
              {/* Weekly volume chart */}
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: C.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: .3, marginBottom: 14 }}>Volumen semanal</div>
                {(() => {
                  const weeks = {};
                  history.forEach(h => {
                    const d = new Date(h.date + "T12:00");
                    const mon = new Date(d); mon.setDate(d.getDate() - d.getDay() + 1);
                    const wk = mon.toISOString().slice(0, 10);
                    const vol = h.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + (+s.weight || 0) * (+s.reps || 0), 0), 0);
                    weeks[wk] = (weeks[wk] || 0) + vol;
                  });
                  const entries = Object.entries(weeks).slice(-8);
                  const maxVol = Math.max(...entries.map(([, v]) => v));
                  return (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 80 }}>
                      {entries.map(([wk, vol], i) => (
                        <div key={wk} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ fontSize: 9, color: C.sub, fontWeight: 600 }}>{(vol / 1000).toFixed(1)}t</div>
                          <div style={{ width: "100%", background: i === entries.length - 1 ? C.accent : C.text, borderRadius: "4px 4px 0 0", height: `${(vol / maxVol) * 60}px`, transition: "height .5s" }} />
                          <div style={{ fontSize: 9, color: C.sub }}>S{i + 1}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Card>

              {/* Workout frequency */}
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: C.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: .3, marginBottom: 12 }}>Últimas 4 semanas</div>
                {(() => {
                  const now = new Date();
                  const days = Array.from({ length: 28 }, (_, i) => {
                    const d = new Date(now); d.setDate(now.getDate() - (27 - i));
                    return d.toISOString().slice(0, 10);
                  });
                  return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {days.map(d => {
                        const worked = history.some(h => h.date === d);
                        return <div key={d} style={{ width: 24, height: 24, borderRadius: 5, background: worked ? C.accent : C.bg2 }} title={d} />;
                      })}
                    </div>
                  );
                })()}
                <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.accent }} /><span style={{ fontSize: 12, color: C.sub }}>Entrenado</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.bg2 }} /><span style={{ fontSize: 12, color: C.sub }}>Descanso</span></div>
                </div>
              </Card>

              {/* Exercise selector */}
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 10 }}>Progresión por ejercicio</div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ejercicio…"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.bg2, fontFamily: FONT, fontSize: 15, color: C.text, outline: "none", boxSizing: "border-box", marginBottom: 10 }}
                onFocus={e => e.target.style.borderColor = C.text} onBlur={e => e.target.style.borderColor = C.border}
              />
              {filtered.map(ex => {
                const exHistory = history.flatMap(h => h.exercises.filter(e => e.name === ex));
                const lastMax = Math.max(...exHistory[exHistory.length - 1]?.sets.map(s => +s.weight || 0) || [0]);
                const last1RM = Math.max(...(exHistory[exHistory.length - 1]?.sets.map(s => oneRM(+s.weight, +s.reps)) || [0]));
                return (
                  <Card key={ex} onClick={() => setSelectedEx(ex)} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{ex}</div>
                        <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{exHistory.length} sesiones · {lastMax}kg último</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>{last1RM}kg</div>
                        <div style={{ fontSize: 11, color: C.sub }}>1RM est.</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </>
          )}
        </>
      ) : (
        <>
          <button onClick={() => setSelectedEx(null)} style={{ background: "none", border: "none", color: C.blue, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: FONT, marginBottom: 16, padding: 0 }}>← Volver</button>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>{selectedEx}</div>
          <div style={{ fontSize: 14, color: C.sub, marginBottom: 20 }}>{exData.length} sesiones registradas</div>

          {exData.length >= 2 ? (
            <>
              {/* 1RM chart */}
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: C.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: .3, marginBottom: 14 }}>1RM estimado (Epley)</div>
                <div style={{ position: "relative" }}>
                  <svg width="100%" height={90} viewBox={`0 0 ${exData.length * 50} 90`} preserveAspectRatio="none" style={{ display: "block" }}>
                    <polyline
                      points={exData.map((d, i) => `${i * 50 + 25},${80 - ((d.max1RM - min1RM) / (max1RM - min1RM + 0.01)) * 65}`).join(" ")}
                      fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                    {exData.map((d, i) => (
                      <circle key={i} cx={i * 50 + 25} cy={80 - ((d.max1RM - min1RM) / (max1RM - min1RM + 0.01)) * 65}
                        r={i === exData.length - 1 ? 6 : 4}
                        fill={i === exData.length - 1 ? C.accent : "#fff"} stroke={C.accent} strokeWidth="2" />
                    ))}
                  </svg>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {exData.map((d, i) => (
                    <div key={i} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 9, color: C.sub }}>{fmtDate(d.date).slice(0, 6)}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: i === exData.length - 1 ? C.accent : C.sub }}>{d.max1RM}kg</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { l: "Mejor 1RM", v: `${max1RM}kg`, c: C.accent },
                  { l: "Mejor peso real", v: `${Math.max(...exData.map(d => d.maxWeight))}kg`, c: C.text },
                  { l: "Progreso total", v: `+${max1RM - exData[0].max1RM}kg`, c: C.green },
                  { l: "Sesiones", v: exData.length, c: C.blue },
                ].map(s => (
                  <div key={s.l} style={{ background: C.bg2, borderRadius: 14, padding: "16px 14px" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* History table */}
              <Card>
                <div style={{ fontSize: 13, color: C.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: .3, marginBottom: 12 }}>Historial</div>
                {exData.slice().reverse().map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < exData.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ fontSize: 14, color: C.sub }}>{fmtDate(d.date)}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 14 }}>
                      <span style={{ fontWeight: 700, color: C.text }}>{d.maxWeight}kg</span>
                      <span style={{ color: C.accent, fontWeight: 700 }}>{d.max1RM}kg 1RM</span>
                    </div>
                  </div>
                ))}
              </Card>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.sub }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
              Necesitas al menos 2 sesiones con este ejercicio para ver la progresión
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── HOME SCREEN ───────────────────────────────────────────────────────────────
function HomeScreen({ history, routines, onStartWorkout, onStartFree, onViewWorkout, onDeleteWorkout }) {
  const [detail, setDetail] = useState(null);

  // Stats
  const thisWeek = history.filter(h => {
    const d = new Date(h.date + "T12:00");
    const now = new Date();
    const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1); mon.setHours(0,0,0,0);
    return d >= mon;
  });

  const totalVol = thisWeek.reduce((a, h) => a + h.exercises.reduce((b, e) => b + e.sets.reduce((c, s) => c + (+s.weight || 0) * (+s.reps || 0), 0), 0), 0);
  const streak = (() => {
    let s = 0; const d = new Date();
    for (let i = 0; i < 30; i++) {
      const ds = new Date(d); ds.setDate(d.getDate() - i);
      if (history.some(h => h.date === ds.toISOString().slice(0, 10))) s++;
      else if (i > 0) break;
    }
    return s;
  })();

  const recent = history.slice(-5).reverse();

  if (detail) return <WorkoutDetail workout={detail} onClose={() => setDetail(null)} onDelete={(id) => { onDeleteWorkout(id); setDetail(null); }} />;

  return (
    <div style={{ padding: "0 16px 100px" }}>
      {/* Greeting */}
      <div style={{ paddingTop: 8, marginBottom: 22 }}>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 2 }}>
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.text, letterSpacing: -0.5 }}>
          {new Date().getHours() < 12 ? "Buenos días" : new Date().getHours() < 20 ? "Buenas tardes" : "Buenas noches"} 👊
        </div>
      </div>

      {/* Week stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { l: "Esta semana", v: thisWeek.length, u: "entrenos", c: C.accent },
          { l: "Volumen", v: totalVol > 0 ? `${(totalVol / 1000).toFixed(1)}t` : "0", u: "total", c: C.text },
          { l: "Racha", v: streak, u: "días", c: C.green },
        ].map(s => (
          <div key={s.l} style={{ background: C.bg2, borderRadius: 14, padding: "14px 12px" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{s.u}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Start buttons */}
      <Btn full variant="accent" onClick={onStartFree} style={{ marginBottom: 8, fontSize: 17, padding: "16px" }}>
        ⚡ Entreno libre
      </Btn>

      {/* Routines */}
      {routines.length > 0 && (
        <>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 10, marginTop: 6 }}>Mis rutinas</div>
          {routines.map(r => (
            <Card key={r.id} onClick={() => onStartWorkout(r)} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{r.exercises.map(e => e.name).join(" · ")}</div>
                </div>
                <div style={{ fontSize: 22, color: C.muted }}>›</div>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* Recent workouts */}
      {recent.length > 0 && (
        <>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 10, marginTop: 16 }}>Últimos entrenos</div>
          {recent.map(h => {
            const vol = h.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + (+s.weight || 0) * (+s.reps || 0), 0), 0);
            const sets = h.exercises.reduce((a, e) => a + e.sets.length, 0);
            return (
              <Card key={h.id} onClick={() => setDetail(h)} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{h.name}</div>
                    </div>
                    <div style={{ fontSize: 13, color: C.sub, marginBottom: 6 }}>{fmtDate(h.date)}</div>
                    <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
                      <span style={{ color: C.sub }}>{fmtDuration(h.duration || 0)}</span>
                      <span style={{ color: C.sub }}>·</span>
                      <span style={{ color: C.sub }}>{sets} series</span>
                      <span style={{ color: C.sub }}>·</span>
                      <span style={{ fontWeight: 700, color: C.accent }}>{(vol / 1000).toFixed(1)}t</span>
                    </div>
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {h.exercises.slice(0, 3).map((e, i) => (
                        <Tag key={i} label={e.name} color={C.sub} bg={C.bg2} />
                      ))}
                      {h.exercises.length > 3 && <Tag label={`+${h.exercises.length - 3}`} color={C.sub} bg={C.bg2} />}
                    </div>
                  </div>
                  <div style={{ fontSize: 20, color: C.muted, marginLeft: 8 }}>›</div>
                </div>
              </Card>
            );
          })}
        </>
      )}

      {history.length === 0 && routines.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>💪</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Empieza hoy</div>
          <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.5 }}>Pulsa "Entreno libre" para tu primera sesión,<br />o crea una rutina en la pestaña Rutinas</div>
        </div>
      )}
    </div>
  );
}

// ── ROUTINES SCREEN ───────────────────────────────────────────────────────────
function RoutinesScreen({ routines, setRoutines }) {
  const [modal, setModal] = useState(null); // null | "new" | routine object

  const saveRoutine = (r) => {
    setRoutines(prev => {
      const idx = prev.findIndex(x => x.id === r.id);
      if (idx >= 0) { const c = [...prev]; c[idx] = r; return c; }
      return [...prev, r];
    });
  };

  const deleteRoutine = (id) => setRoutines(prev => prev.filter(r => r.id !== id));

  return (
    <div style={{ padding: "0 16px 100px" }}>
      {modal && <RoutineModal routine={modal === "new" ? null : modal} onSave={saveRoutine} onClose={() => setModal(null)} />}

      <div style={{ paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.text }}>Rutinas</div>
        <Btn small variant="accent" onClick={() => setModal("new")}>+ Nueva</Btn>
      </div>

      {routines.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Sin rutinas</div>
          <div style={{ fontSize: 15, color: C.sub, marginBottom: 24 }}>Crea tu primera rutina para lanzarla rápido cada vez</div>
          <Btn variant="accent" onClick={() => setModal("new")}>Crear rutina</Btn>
        </div>
      ) : (
        routines.map(r => (
          <Card key={r.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 13, color: C.sub, marginBottom: 10 }}>{r.exercises.length} ejercicios</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {r.exercises.map((e, i) => <Tag key={i} label={e.name} color={C.sub} bg={C.bg2} />)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn small variant="ghost" onClick={() => setModal(r)} style={{ flex: 1 }}>Editar</Btn>
              <Btn small variant="danger" onClick={() => deleteRoutine(r.id)} style={{ flex: 1 }}>Eliminar</Btn>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: "home", label: "Inicio", icon: "⌂" },
  { id: "progress", label: "Progreso", icon: "↗" },
  { id: "routines", label: "Rutinas", icon: "☰" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [history, setHistory] = useLS("gymlog_history", []);
  const [routines, setRoutines] = useLS("gymlog_routines", []);
  const [activeWorkout, setActiveWorkout] = useState(null); // null | { routine }

  const startWorkout = (routine) => setActiveWorkout({ routine });
  const startFree = () => setActiveWorkout({ routine: null });

  const finishWorkout = (workout) => {
    setHistory(prev => [...prev, workout]);
    setActiveWorkout(null);
  };

  const deleteWorkout = (id) => setHistory(prev => prev.filter(h => h.id !== id));

  // Active workout takes full screen
  if (activeWorkout !== null) {
    return (
      <ActiveWorkout
        routine={activeWorkout.routine}
        history={history}
        onFinish={finishWorkout}
        onCancel={() => setActiveWorkout(null)}
      />
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: FONT, color: C.text }}>
      {/* Content */}
      <div style={{ maxWidth: 430, margin: "0 auto", paddingBottom: 80 }}>
        {tab === "home" && (
          <HomeScreen
            history={history} routines={routines}
            onStartWorkout={startWorkout} onStartFree={startFree}
            onDeleteWorkout={deleteWorkout}
          />
        )}
        {tab === "progress" && <ProgressScreen history={history} />}
        {tab === "routines" && <RoutinesScreen routines={routines} setRoutines={setRoutines} />}
      </div>

      {/* Tab bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
        borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 max(14px, env(safe-area-inset-bottom))",
        zIndex: 50,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "2px 24px", fontFamily: FONT,
            color: tab === t.id ? C.accent : C.muted,
            transition: "color .15s",
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 800 : 500, letterSpacing: .3 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

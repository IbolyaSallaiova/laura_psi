import React, { useMemo, useState } from "react";

/** Demo dáta učiteľa: predmety, termíny, študenti */
const teacherData = [
    {
        code: "INF101",
        name: "Programovanie 1",
        slots: [
            { id: "inf101-1", label: "Po 08:00–09:30 (A-101)", room: "A-101" },
            { id: "inf101-2", label: "St 10:00–11:30 (A-102)", room: "A-102" },
        ],
        students: [
            { id: 1, name: "Bc. Študent A" },
            { id: 2, name: "Bc. Študent B" },
            { id: 3, name: "Bc. Študent C" },
        ],
    },
    {
        code: "MAT101",
        name: "Matematika 1",
        slots: [
            { id: "mat101-1", label: "Ut 09:45–11:15 (B-201)", room: "B-201" },
        ],
        students: [
            { id: 4, name: "Bc. Študent D" },
            { id: 5, name: "Bc. Študent E" },
        ],
    },
    {
        code: "ALG201",
        name: "Algoritmy",
        slots: [
            { id: "alg201-1", label: "Št 11:30–13:00 (C-301)", room: "C-301" },
        ],
        students: [
            { id: 6, name: "Bc. Študent F" },
            { id: 7, name: "Bc. Študent G" },
            { id: 8, name: "Bc. Študent H" },
        ],
    },
];

/** Váhy hodnotení (spolu 100) */
const WEIGHTS = {
    zapocet: 20, // Z
    zadanie1: 30, // Z1
    skuska: 50, // S
};

/** Mapa percent -> ECTS písmeno */
function percentToGrade(p) {
    const x = Math.round(p);
    if (x >= 91) return "A";
    if (x >= 81) return "B";
    if (x >= 73) return "C";
    if (x >= 66) return "D";
    if (x >= 60) return "E";
    return "FX";
}

/** Utility na bezpečné číslo 0–100 */
function clampPercent(v) {
    const n = Number(v);
    if (Number.isNaN(n)) return "";
    return Math.max(0, Math.min(100, n));
}

export default function ZapisZnamok() {
    const [subjectCode, setSubjectCode] = useState(teacherData[0].code);
    const subject = useMemo(
        () => teacherData.find((c) => c.code === subjectCode),
        [subjectCode]
    );

    const [slotId, setSlotId] = useState(subject?.slots[0]?.id || "");

    // per-term hodnotenia študentov (key = subjectCode|slotId)
    const key = `${subjectCode}|${slotId}`;
    const initialRows = useMemo(() => {
        if (!subject) return [];
        return subject.students.map((s) => ({
            studentId: s.id,
            student: s.name,
            zapocet: "",   // 0..100
            zadanie1: "",  // 0..100
            skuska: "",    // 0..100
            finalOverride: "", // '', 'A'..'FX'
        }));
    }, [subject]);

    const [dataByKey, setDataByKey] = useState({ [key]: initialRows });

    // vždy keď sa zmení predmet/slot a nemáme tam dáta, inicializovať
    const rows = dataByKey[key] || initialRows;

    const setRows = (newRows) => {
        setDataByKey((prev) => ({ ...prev, [key]: newRows }));
    };

    const updateCell = (studentId, field, value) => {
        setRows(
            rows.map((r) =>
                r.studentId === studentId ? { ...r, [field]: value } : r
            )
        );
    };

    const weightedPercent = (r) => {
        const z = Number(r.zapocet) || 0;
        const z1 = Number(r.zadanie1) || 0;
        const s = Number(r.skuska) || 0;
        const total =
            (z * WEIGHTS.zapocet +
                z1 * WEIGHTS.zadanie1 +
                s * WEIGHTS.skuska) /
            100;
        return total;
    };

    const withGrade = (r) => {
        const total = weightedPercent(r);
        const autoGrade = percentToGrade(total);
        const grade = r.finalOverride || autoGrade;
        return { ...r, total, grade, autoGrade };
    };

    const enriched = rows.map(withGrade);

    const avgPercent = useMemo(() => {
        const nums = enriched.map((r) => r.total).filter((n) => !Number.isNaN(n));
        if (!nums.length) return "—";
        return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) + " %";
    }, [enriched]);

    const save = () => {
        // v demu len uložíme do localStorage pre ten key
        localStorage.setItem(`grades_${key}`, JSON.stringify(rows));
        alert("Známky uložené (demo).");
    };

    const reset = () => {
        setRows(initialRows);
    };

    // ak sa zmení subject, nastav default slot (ak chýba)
    React.useEffect(() => {
        if (!subject) return;
        if (!subject.slots.find((s) => s.id === slotId)) {
            setSlotId(subject.slots[0]?.id || "");
        }
    }, [subjectCode]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="card">
            <h3 style={{ marginTop: 0 }}>Zápis známok</h3>

            {/* Výber predmetu a termínu */}
            <div className="form-row" style={{ gap: 12, alignItems: "end" }}>
                <div style={{ flex: 1 }}>
                    <div className="small">Predmet</div>
                    <select
                        className="input"
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                    >
                        {teacherData.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.code} — {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <div className="small">Termín / čas</div>
                    <select
                        className="input"
                        value={slotId}
                        onChange={(e) => setSlotId(e.target.value)}
                    >
                        {subject?.slots.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="badge" title="Váhy hodnotení">
                    Váhy: Z {WEIGHTS.zapocet}% • Z1 {WEIGHTS.zadanie1}% • S {WEIGHTS.skuska}%
                </div>
            </div>

            {/* Priemer */}
            <div className="small" style={{ marginTop: 8 }}>
                Priemer spolu: <strong>{avgPercent}</strong>
            </div>

            {/* Tabuľka študentov */}
            <table className="table table-compact" style={{ marginTop: 8 }}>
                <thead>
                <tr>
                    <th>Kód</th>
                    <th>Predmet</th>
                    <th>Termín</th>
                    <th>Študent</th>
                    <th>Z (0–100)</th>
                    <th>Z1 (0–100)</th>
                    <th>S (0–100)</th>
                    <th>% spolu</th>
                    <th>Známka</th>
                </tr>
                </thead>
                <tbody>
                {enriched.map((r) => (
                    <tr key={r.studentId}>
                        <td>
                            <span className="pill pill-blue">{subject.code}</span>
                        </td>
                        <td>{subject.name}</td>
                        <td>{subject.slots.find((s) => s.id === slotId)?.label || "—"}</td>
                        <td>{r.student}</td>
                        <td style={{ width: 110 }}>
                            <input
                                className="input"
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={r.zapocet}
                                onChange={(e) =>
                                    updateCell(r.studentId, "zapocet", clampPercent(e.target.value))
                                }
                            />
                        </td>
                        <td style={{ width: 110 }}>
                            <input
                                className="input"
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={r.zadanie1}
                                onChange={(e) =>
                                    updateCell(r.studentId, "zadanie1", clampPercent(e.target.value))
                                }
                            />
                        </td>
                        <td style={{ width: 110 }}>
                            <input
                                className="input"
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={r.skuska}
                                onChange={(e) =>
                                    updateCell(r.studentId, "skuska", clampPercent(e.target.value))
                                }
                            />
                        </td>
                        <td>
                            <strong>{Math.round(r.total || 0)} %</strong>
                            {r.finalOverride && (
                                <div className="small" title={`Automatická: ${r.autoGrade}`}>
                                    auto: {r.autoGrade}
                                </div>
                            )}
                        </td>
                        <td style={{ width: 120 }}>
                            <select
                                className="input"
                                value={r.finalOverride || r.grade}
                                onChange={(e) =>
                                    updateCell(
                                        r.studentId,
                                        "finalOverride",
                                        e.target.value === r.autoGrade ? "" : e.target.value
                                    )
                                }
                            >
                                {["A", "B", "C", "D", "E", "FX"].map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                            {r.finalOverride && (
                                <div className="small" style={{ color: "var(--muted)" }}>
                                    (upravené)
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
                {enriched.length === 0 && (
                    <tr>
                        <td colSpan={9} className="small">
                            Žiadni študenti na tomto termíne.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button className="btn primary" onClick={save}>
                    Uložiť
                </button>
                <button className="btn" onClick={reset}>
                    Zrušiť zmeny
                </button>
            </div>
        </div>
    );
}

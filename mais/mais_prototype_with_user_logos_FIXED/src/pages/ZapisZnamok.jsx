import React from "react";
import { useAuth } from "../context/AuthContext";

const DEFAULT_MAX_POINTS = {
    zapocet: 20,
    zadanie1: 30,
    skuska: 50,
};

const withDefaultMaxPoints = (partial = {}) => ({
    ...DEFAULT_MAX_POINTS,
    ...partial,
});

function percentToGrade(p) {
    const x = Math.round(p);
    if (x >= 91) return "A";
    if (x >= 81) return "B";
    if (x >= 73) return "C";
    if (x >= 66) return "D";
    if (x >= 60) return "E";
    return "FX";
}

function clampScore(v, max) {
    const n = Number(v);
    if (Number.isNaN(n)) return "";
    const safeMax = Number(max) || 0;
    return Math.max(0, Math.min(safeMax, n));
}

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ZapisZnamok() {
    const { token, user, logout } = useAuth();
    const [subjects, setSubjects] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const [subjectId, setSubjectId] = React.useState(null);
    const [groupId, setGroupId] = React.useState(null);
    const [dataByKey, setDataByKey] = React.useState({});

    const isTeacher = user?.role === "TEACHER";

    React.useEffect(() => {
        if (!isTeacher || !token) {
            setSubjects([]);
            setSubjectId(null);
            setGroupId(null);
            return;
        }
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API}/api/teacher/subjects`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.status === 401 || res.status === 403) {
                    logout();
                    throw new Error("Vaše prihlásenie vypršalo. Prihláste sa znova.");
                }
                if (!res.ok) {
                    throw new Error("Nepodarilo sa načítať predmety");
                }
                const data = await res.json();
                if (!cancelled) {
                    setSubjects(data);
                    if (data.length > 0) {
                        setSubjectId((prev) =>
                            prev && data.some((s) => s.id === prev) ? prev : data[0].id
                        );
                    } else {
                        setSubjectId(null);
                        setGroupId(null);
                    }
                }
            } catch (e) {
                if (!cancelled) {
                    setError(e.message || String(e));
                    setSubjects([]);
                    setSubjectId(null);
                    setGroupId(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [token, isTeacher]);

    const subject = React.useMemo(
        () => subjects.find((s) => s.id === subjectId) || null,
        [subjects, subjectId]
    );

    const groups = subject?.groups || [];

    React.useEffect(() => {
        if (!groups.length) {
            setGroupId(null);
            return;
        }
        setGroupId((prev) => (prev && groups.some((g) => g.id === prev) ? prev : groups[0].id));
    }, [groups]);

    const group = React.useMemo(
        () => groups.find((g) => g.id === groupId) || null,
        [groups, groupId]
    );

    const key = subject && group ? `${subject.id}|${group.id}` : "__none__";

    const initialRows = React.useMemo(() => {
        if (!group) return [];
        return group.students.map((student) => ({
            studentId: student.id,
            student: student.fullName,
            zapocet: student.grades?.zapocet ?? "",
            zadanie1: student.grades?.zadanie1 ?? "",
            skuska: student.grades?.skuska ?? "",
            finalOverride: student.grades?.finalOverride || "",
        }));
    }, [group]);

    React.useEffect(() => {
        if (!group) return;
        setDataByKey((prev) => {
            if (prev[key]) return prev;
            return { ...prev, [key]: initialRows };
        });
    }, [group, key, initialRows]);

    const rows = group ? dataByKey[key] || initialRows : [];

    const currentMaxPoints = React.useMemo(
        () => withDefaultMaxPoints(subject?.maxPoints),
        [subject]
    );

    const setRows = React.useCallback(
        (updater) => {
            if (!group) return;
            setDataByKey((prev) => {
                const existing = prev[key] || initialRows;
                const next =
                    typeof updater === "function" ? updater(existing) : updater;
                if (next === existing) return prev;
                return { ...prev, [key]: next };
            });
        },
        [group, key, initialRows]
    );

    const updateCell = (studentId, field, value) => {
        setRows((existingRows) =>
            existingRows.map((r) =>
                r.studentId === studentId ? { ...r, [field]: value } : r
            )
        );
    };

    const weightedPercent = (r) => {
        const z = Number(r.zapocet) || 0;
        const z1 = Number(r.zadanie1) || 0;
        const s = Number(r.skuska) || 0;
        const totalMax =
            Number(currentMaxPoints.zapocet || 0) +
            Number(currentMaxPoints.zadanie1 || 0) +
            Number(currentMaxPoints.skuska || 0);
        if (totalMax <= 0) return 0;
        return ((z + z1 + s) / totalMax) * 100;
    };

    const withGrade = (r) => {
        const total = weightedPercent(r);
        const autoGrade = percentToGrade(total);
        const grade = r.finalOverride || autoGrade;
        return { ...r, total, grade, autoGrade };
    };

    const enriched = rows.map(withGrade);

    const avgPercent = React.useMemo(() => {
        const nums = enriched.map((r) => r.total).filter((n) => !Number.isNaN(n));
        if (!nums.length) return "—";
        return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) + " %";
    }, [enriched]);

    const handleMaxPointChange = (field, value) => {
        if (!subject) return;
        const sanitized = Math.max(0, Number(value) || 0);
        setSubjects((prev) =>
            prev.map((s) =>
                s.id === subject.id
                    ? {
                          ...s,
                          maxPoints: withDefaultMaxPoints({
                              ...s.maxPoints,
                              [field]: sanitized,
                          }),
                      }
                    : s
            )
        );
    };

    React.useEffect(() => {
        if (!group) return;
        setRows((existingRows) => {
            let changed = false;
            const next = existingRows.map((row) => {
                const cz = clampScore(row.zapocet, currentMaxPoints.zapocet);
                const cz1 = clampScore(row.zadanie1, currentMaxPoints.zadanie1);
                const cs = clampScore(row.skuska, currentMaxPoints.skuska);
                if (cz === row.zapocet && cz1 === row.zadanie1 && cs === row.skuska) {
                    return row;
                }
                changed = true;
                return { ...row, zapocet: cz, zadanie1: cz1, skuska: cs };
            });
            return changed ? next : existingRows;
        });
    }, [currentMaxPoints, group, setRows]);

    const save = async () => {
        if (!subject || !group) return;
        try {
            const payload = {
                maxPoints: {
                    zapocet: Number(currentMaxPoints.zapocet) || 0,
                    zadanie1: Number(currentMaxPoints.zadanie1) || 0,
                    skuska: Number(currentMaxPoints.skuska) || 0,
                },
                grades: rows.map((r) => ({
                    studentId: r.studentId,
                    zapocet: r.zapocet === "" ? null : Number(r.zapocet),
                    zadanie1: r.zadanie1 === "" ? null : Number(r.zadanie1),
                    skuska: r.skuska === "" ? null : Number(r.skuska),
                    finalOverride: r.finalOverride || null,
                })),
            };
            const res = await fetch(
                `${API}/api/teacher/subjects/${subject.id}/groups/${group.id}/grades`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );
            if (res.status === 401 || res.status === 403) {
                logout();
                throw new Error("Vaše prihlásenie vypršalo. Prihláste sa znova.");
            }
            if (!res.ok) {
                const message = await res.text();
                throw new Error(message || "Ukladanie zlyhalo");
            }
            const updatedSubject = await res.json();
            setSubjects((prev) =>
                prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s))
            );
            const updatedGroup = updatedSubject.groups.find((g) => g.id === group.id);
            if (updatedGroup) {
                const freshRows = updatedGroup.students.map((student) => ({
                    studentId: student.id,
                    student: student.fullName,
                    zapocet: student.grades?.zapocet ?? "",
                    zadanie1: student.grades?.zadanie1 ?? "",
                    skuska: student.grades?.skuska ?? "",
                    finalOverride: student.grades?.finalOverride || "",
                }));
                setDataByKey((prev) => ({ ...prev, [key]: freshRows }));
            }
            alert("Známky uložené.");
        } catch (e) {
            alert(e.message || "Ukladanie zlyhalo");
        }
    };

    const reset = () => {
        setDataByKey((prev) => ({ ...prev, [key]: initialRows }));
    };

    if (!isTeacher) {
        return (
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Zápis známok</h3>
                <div className="empty-note">
                    Pre prístup k tejto sekcii je potrebné prihlásiť sa ako učiteľ.
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Zápis známok</h3>
                <div className="empty-note">Načítavam údaje…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Zápis známok</h3>
                <div className="empty-note" style={{ color: "var(--danger)" }}>
                    {error}
                </div>
            </div>
        );
    }

    if (!subject || !group) {
        return (
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Zápis známok</h3>
                <div className="empty-note">Nemáte priradené žiadne predmety.</div>
            </div>
        );
    }

    const totalMaxPoints =
        Number(currentMaxPoints.zapocet || 0) +
        Number(currentMaxPoints.zadanie1 || 0) +
        Number(currentMaxPoints.skuska || 0);

    return (
        <div className="card">
            <h3 style={{ marginTop: 0 }}>Zápis známok</h3>

            <div className="form-row" style={{ gap: 12, alignItems: "end" }}>
                <div style={{ flex: 1 }}>
                    <div className="small">Predmet</div>
                    <select
                        className="input"
                        value={subjectId ?? ""}
                        onChange={(e) => setSubjectId(Number(e.target.value))}
                    >
                        {subjects.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.code} — {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <div className="small">Termín / čas</div>
                    <select
                        className="input"
                        value={groupId ?? ""}
                        onChange={(e) => setGroupId(Number(e.target.value))}
                    >
                        {groups.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="badge" title="Maximálne body za hodnotenia">
                    Max body: Z {currentMaxPoints.zapocet} • Z1 {currentMaxPoints.zadanie1} • S {currentMaxPoints.skuska} (spolu {totalMaxPoints})
                </div>
            </div>

            <div
                className="form-row"
                style={{ gap: 12, alignItems: "end", marginTop: 12 }}
            >
                <div style={{ flex: 1 }}>
                    <div className="small">Max. body za Z</div>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                        value={currentMaxPoints.zapocet}
                        onChange={(e) =>
                            handleMaxPointChange("zapocet", e.target.value)
                        }
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <div className="small">Max. body za Z1</div>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                        value={currentMaxPoints.zadanie1}
                        onChange={(e) =>
                            handleMaxPointChange("zadanie1", e.target.value)
                        }
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <div className="small">Max. body za S</div>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                        value={currentMaxPoints.skuska}
                        onChange={(e) =>
                            handleMaxPointChange("skuska", e.target.value)
                        }
                    />
                </div>
            </div>

            <div className="small" style={{ marginTop: 8 }}>
                Priemer spolu: <strong>{avgPercent}</strong>
            </div>

            <table className="table table-compact" style={{ marginTop: 8 }}>
                <thead>
                <tr>
                    <th>Kód</th>
                    <th>Predmet</th>
                    <th>Termín</th>
                    <th>Študent</th>
                    <th>Z (0–{currentMaxPoints.zapocet})</th>
                    <th>Z1 (0–{currentMaxPoints.zadanie1})</th>
                    <th>S (0–{currentMaxPoints.skuska})</th>
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
                        <td>{group.label}</td>
                        <td>{r.student}</td>
                        <td style={{ width: 110 }}>
                            <input
                                className="input"
                                type="number"
                                min="0"
                                max={currentMaxPoints.zapocet}
                                step="1"
                                value={r.zapocet}
                                onChange={(e) =>
                                    updateCell(
                                        r.studentId,
                                        "zapocet",
                                        clampScore(
                                            e.target.value,
                                            currentMaxPoints.zapocet
                                        )
                                    )
                                }
                            />
                        </td>
                        <td style={{ width: 110 }}>
                            <input
                                className="input"
                                type="number"
                                min="0"
                                max={currentMaxPoints.zadanie1}
                                step="1"
                                value={r.zadanie1}
                                onChange={(e) =>
                                    updateCell(
                                        r.studentId,
                                        "zadanie1",
                                        clampScore(
                                            e.target.value,
                                            currentMaxPoints.zadanie1
                                        )
                                    )
                                }
                            />
                        </td>
                        <td style={{ width: 110 }}>
                            <input
                                className="input"
                                type="number"
                                min="0"
                                max={currentMaxPoints.skuska}
                                step="1"
                                value={r.skuska}
                                onChange={(e) =>
                                    updateCell(
                                        r.studentId,
                                        "skuska",
                                        clampScore(
                                            e.target.value,
                                            currentMaxPoints.skuska
                                        )
                                    )
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

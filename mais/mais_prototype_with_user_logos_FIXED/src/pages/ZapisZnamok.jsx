import React, { useEffect, useMemo, useState } from "react";

import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function formatDate(isoString) {
    if (!isoString) return "—";
    try {
        return new Date(isoString).toLocaleString("sk-SK", {
            dateStyle: "short",
            timeStyle: "short",
        });
    } catch (error) {
        return isoString;
    }
}

export default function ZapisZnamok() {
    const { token, user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [subjectsLoading, setSubjectsLoading] = useState(true);
    const [grades, setGrades] = useState([]);
    const [gradesLoading, setGradesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        studentId: "",
        value: "1",
        description: "",
    });

    const subject = useMemo(
        () => subjects.find((item) => item.id === selectedSubjectId) || null,
        [subjects, selectedSubjectId]
    );

    useEffect(() => {
        if (!token || !user) return;
        let ignore = false;
        setSubjectsLoading(true);
        setError(null);
        apiFetch("/api/subjects", { token })
            .then((data) => {
                if (ignore) return;
                setSubjects(data || []);
                if (data && data.length > 0) {
                    const first = data[0];
                    setSelectedSubjectId((prev) => {
                        if (prev && data.some((item) => item.id === prev)) {
                            return prev;
                        }
                        return first.id;
                    });
                } else {
                    setSelectedSubjectId(null);
                }
            })
            .catch((err) => {
                if (ignore) return;
                setError(err.message || "Nepodarilo sa načítať predmety.");
            })
            .finally(() => {
                if (!ignore) {
                    setSubjectsLoading(false);
                }
            });
        return () => {
            ignore = true;
        };
    }, [token, user]);

    useEffect(() => {
        if (!token || !selectedSubjectId) {
            setGrades([]);
            return;
        }
        let ignore = false;
        setGradesLoading(true);
        setFormError(null);
        setSuccessMessage(null);
        apiFetch(`/api/subjects/${selectedSubjectId}/grades`, { token })
            .then((data) => {
                if (ignore) return;
                setGrades(data || []);
            })
            .catch((err) => {
                if (ignore) return;
                setError(err.message || "Nepodarilo sa načítať známky.");
            })
            .finally(() => {
                if (!ignore) {
                    setGradesLoading(false);
                }
            });
        return () => {
            ignore = true;
        };
    }, [token, selectedSubjectId]);

    useEffect(() => {
        if (!subject) {
            setForm((prev) => ({ ...prev, studentId: "" }));
            return;
        }
        const studentIds = (subject.students || []).map((student) => String(student.id));
        setForm((prev) => {
            if (prev.studentId && studentIds.includes(prev.studentId)) {
                return prev;
            }
            return {
                ...prev,
                studentId: studentIds[0] || "",
            };
        });
    }, [subject]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedSubjectId) {
            setFormError("Vyberte predmet.");
            return;
        }
        if (!form.studentId) {
            setFormError("Vyberte študenta.");
            return;
        }
        const valueNumber = Number(form.value);
        if (!Number.isInteger(valueNumber) || valueNumber < 1 || valueNumber > 5) {
            setFormError("Známka musí byť v rozsahu 1 – 5.");
            return;
        }
        setSubmitting(true);
        setFormError(null);
        setSuccessMessage(null);
        try {
            const payload = {
                studentId: Number(form.studentId),
                value: valueNumber,
                description: form.description?.trim() ? form.description.trim() : null,
            };
            const newGrade = await apiFetch(`/api/subjects/${selectedSubjectId}/grades`, {
                method: "POST",
                token,
                body: payload,
            });
            setGrades((prev) => [newGrade, ...(prev || [])]);
            setSuccessMessage("Známka bola úspešne zapísaná.");
            setForm((prev) => ({
                ...prev,
                value: "1",
                description: "",
            }));
        } catch (err) {
            setFormError(err.message || "Známku sa nepodarilo uložiť.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStudentsList = () => {
        if (!subject) {
            return <div className="small">Vyberte predmet.</div>;
        }
        const students = subject.students || [];
        if (!students.length) {
            return <div className="small">Na predmet nie sú zapísaní žiadni študenti.</div>;
        }
        return (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
                {students.map((student) => (
                    <li key={student.id}>
                        {student.fullName || student.username || `#${student.id}`}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="card">
            <h3 style={{ marginTop: 0 }}>Zápis známok</h3>

            {error && (
                <div className="badge" style={{ background: "var(--danger)", color: "white", marginBottom: 12 }}>
                    {error}
                </div>
            )}

            {subjectsLoading ? (
                <div>Načítavam predmety...</div>
            ) : (
                <>
                    <div className="form-row" style={{ gap: 12, alignItems: "end" }}>
                        <div style={{ flex: 2 }}>
                            <div className="small">Predmet</div>
                            <select
                                className="input"
                                value={selectedSubjectId ?? ""}
                                onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                                disabled={!subjects.length}
                            >
                                {subjects.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.code ? `${item.code} — ` : ""}{item.name}
                                    </option>
                                ))}
                                {!subjects.length && <option value="">Žiadne predmety</option>}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="small">Študenti zapísaní na predmet</div>
                            <div className="small" style={{ maxHeight: 120, overflow: "auto", padding: 8, background: "var(--bg-muted)", borderRadius: 8 }}>
                                {renderStudentsList()}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
                        <div className="form-row" style={{ gap: 12 }}>
                            <div style={{ flex: 2 }}>
                                <div className="small">Študent</div>
                                <select
                                    className="input"
                                    value={form.studentId}
                                    onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                                    disabled={!subject || !(subject.students || []).length}
                                >
                                    {(subject?.students || []).map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.fullName || student.username || `#${student.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="small">Známka (1–5)</div>
                                <input
                                    className="input"
                                    type="number"
                                    min={1}
                                    max={5}
                                    step={1}
                                    value={form.value}
                                    onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="form-row" style={{ gap: 12, marginTop: 12 }}>
                            <div style={{ flex: 1 }}>
                                <div className="small">Popis hodnotenia (voliteľné)</div>
                                <textarea
                                    className="input"
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        {formError && (
                            <div className="small" style={{ color: "var(--danger)", marginTop: 8 }}>
                                {formError}
                            </div>
                        )}
                        {successMessage && (
                            <div className="small" style={{ color: "var(--success)", marginTop: 8 }}>
                                {successMessage}
                            </div>
                        )}
                        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                            <button className="btn primary" type="submit" disabled={submitting || !subject}>
                                {submitting ? "Ukladám..." : "Zapísať známku"}
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: 24 }}>
                        <h4>História známok</h4>
                        {gradesLoading ? (
                            <div>Načítavam známky...</div>
                        ) : grades.length === 0 ? (
                            <div className="small">Zatiaľ neboli zapísané žiadne známky.</div>
                        ) : (
                            <table className="table table-compact" style={{ marginTop: 8 }}>
                                <thead>
                                <tr>
                                    <th>Študent</th>
                                    <th>Známka</th>
                                    <th>Popis</th>
                                    <th>Zadávateľ</th>
                                    <th>Dátum</th>
                                </tr>
                                </thead>
                                <tbody>
                                {grades.map((grade) => (
                                    <tr key={grade.id}>
                                        <td>{grade.studentName || `#${grade.studentId}`}</td>
                                        <td>
                                            <span className="pill gold">{grade.value}</span>
                                        </td>
                                        <td>{grade.description || "—"}</td>
                                        <td>{grade.teacherName || "—"}</td>
                                        <td>{formatDate(grade.assignedAt)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

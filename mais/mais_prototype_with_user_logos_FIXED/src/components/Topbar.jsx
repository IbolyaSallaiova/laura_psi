import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
    const { user, isAuthenticated, login, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem("mais_theme") || "light");
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    // prepínač témy
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("mais_theme", theme);
    }, [theme]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(form); // volá backend /api/auth/login
            setIsOpen(false);
            setForm({ username: "", password: "" });
        } catch (err) {
            setError(err.message || "Prihlásenie zlyhalo.");
        }
    };

    // preklad role z backendu (STUDENT/TEACHER/ADMIN) do zobrazenia
    const roleLabel = (role) => {
        switch (role) {
            case "STUDENT": return "Študent";
            case "TEACHER": return "Učiteľ";
            case "ADMIN":   return "Admin";
            default:        return role || "—";
        }
    };

    // meno/identifikátor do chipu
    const displayName = user?.fullName || user?.username || "—";
    // doplnkové info do chipu (program + semester alebo rola)
    const displaySub =
        user?.studyProgram
            ? `${user.studyProgram}${user?.semester ? ` · ${user.semester}. sem.` : ""}`
            : roleLabel(user?.role);

    return (
        <div className="topbar">
            {/* prepínač témy (ikonka len ☀️ / 🌙) */}
            <button
                className="btn ghost"
                aria-label="Prepnutie témy"
                onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
                style={{ fontSize: 20 }}
            >
                {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* pravá strana */}
            <div style={{ marginLeft: "auto", position: "relative" }}>
                {!isAuthenticated ? (
                    <>
                        <button className="btn primary" onClick={() => setIsOpen((v) => !v)}>
                            Prihlásiť
                        </button>
                        {isOpen && (
                            <div
                                className="card"
                                style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "calc(100% + 8px)",
                                    width: 300,
                                    padding: 12,
                                    zIndex: 20,
                                }}
                            >
                                <form onSubmit={handleSubmit}>
                                    <div className="field">
                                        <label className="small">Používateľské meno</label>
                                        <input
                                            className="input"
                                            type="text"
                                            value={form.username}
                                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                                            placeholder='napr. "student" alebo "teacher"'
                                            autoComplete="username"
                                        />
                                    </div>
                                    <div className="field">
                                        <label className="small">Heslo</label>
                                        <input
                                            className="input"
                                            type="password"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    {error && (
                                        <div className="small" style={{ color: "crimson" }}>
                                            {error}
                                        </div>
                                    )}
                                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                        <button type="submit" className="btn primary" style={{ flex: 1 }}>
                                            Prihlásiť
                                        </button>
                                        <button type="button" className="btn" onClick={() => setIsOpen(false)}>
                                            Zrušiť
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="profile-pop">
                        <button className="btn" onClick={() => setIsOpen((v) => !v)}>
                            {displayName} • {roleLabel(user?.role)}
                        </button>

                        {isOpen && (
                            <div className="profile-panel" style={{ minWidth: 320 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontWeight: 800 }}>
                                        {displayName}{" "}
                                        <span className="pill" style={{ marginLeft: 6 }}>
                      {roleLabel(user?.role)}
                    </span>
                                    </div>
                                    <div className="small" style={{ opacity: 0.8 }}>
                                        {displaySub}
                                    </div>
                                </div>

                                {/* Info blok – údaje dostupné zo servera */}
                                <div style={{ display: "grid", gap: 6 }}>
                                    {user?.studyProgram && (
                                        <div className="small">
                                            <strong>Štúdium:</strong> {user.studyProgram}
                                        </div>
                                    )}
                                    {typeof user?.semester === "number" && (
                                        <div className="small">
                                            <strong>Semester:</strong> {user.semester}.
                                        </div>
                                    )}
                                    {/* Môžeš doplniť ďalšie podľa backendu: studentId/teacherId */}
                                    {user?.studentId && (
                                        <div className="small">
                                            <strong>ID študenta:</strong> {user.studentId}
                                        </div>
                                    )}
                                    {user?.teacherId && (
                                        <div className="small">
                                            <strong>ID učiteľa:</strong> {user.teacherId}
                                        </div>
                                    )}
                                </div>

                                <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />

                                <div style={{ display: "flex", gap: 8 }}>
                                    {/* ak máš route /profil, nechaj Link na /profil; inak /profile */}
                                    <Link to="/profil" className="btn" onClick={() => setIsOpen(false)}>
                                        Profil
                                    </Link>
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            setIsOpen(false);
                                            logout();
                                        }}
                                    >
                                        Odhlásiť
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

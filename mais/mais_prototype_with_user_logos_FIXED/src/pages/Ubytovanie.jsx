import React from "react";

export default function Ubytovanie() {
    const vsUbytovanie = "2022001565";

    const prehlad = [
        {
            akad: "2025/2026",
            rok: "1",
            stav: "Ubytovanie prebieha SDFU, izba č. 215, 2p.",
            od: "18.09.2025",
            do: "",
        },
        {
            akad: "2024/2025",
            rok: "3",
            stav: "Ubytovanie ukončené SDFU, izba č. 215, 2p.",
            od: "02.09.2024",
            do: "26.06.2025",
        },
        {
            akad: "2023/2024",
            rok: "2",
            stav: "Ubytovanie ukončené SDFU, izba č. 211, 2p.",
            od: "11.09.2023",
            do: "30.06.2024",
        },
        {
            akad: "2023/2024",
            rok: "2",
            stav: "Ubytovanie ukončené SDFU, izba č. 215, 2p.",
            od: "01.07.2024",
            do: "31.08.2024",
        },
        {
            akad: "2022/2023",
            rok: "1",
            stav: "Ubytovanie ukončené SDFU, izba č. 211, 2p.",
            od: "16.09.2022",
            do: "30.06.2023",
        },
    ];

    const StatusPill = ({ text }) => {
        const lower = text.toLowerCase();
        const isRunning = lower.includes("prebieha");
        const isEnded = lower.includes("ukončené");
        const cls = isRunning
            ? "pill pill-blue"
            : isEnded
                ? "pill"
                : "pill";
        return <span className={cls}>{text}</span>;
    };

    return (
        <div className="ubytovanie-wrap" style={{ display: "grid", gap: 12 }}>
            {/* Žiadosť na 2026/2027 */}
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Žiadosť o ubytovanie (2026/2027)</h3>
                <div className="empty-note" style={{ marginTop: 8 }}>
                    Žiadosť o ubytovanie na akademický rok <strong>2026/2027</strong> nie je evidovaná.
                </div>
                <div className="small" style={{ marginTop: 8 }}>
                    Nie je možné evidovať žiadosť o ubytovanie! Termín podávania žiadostí pre študentov <strong>nedefinovaný</strong>.
                </div>
            </div>

            {/* VS pre platby */}
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Platby za ubytovanie</h3>
                <div className="small" style={{ marginTop: 6 }}>
                    Variabilný symbol pre platby za ubytovanie:{" "}
                    <span className="pill pill-gold" style={{ fontWeight: 800 }}>{vsUbytovanie}</span>
                </div>
            </div>

            {/* Prehľad počas štúdia */}
            <div className="card">
                <h3 style={{ marginTop: 0 }}>Prehľad ubytovania počas štúdia</h3>
                <table className="table table-compact" style={{ marginTop: 8 }}>
                    <thead>
                    <tr>
                        <th>Akad. rok</th>
                        <th>Rok štúdia</th>
                        <th>Ubytovanie</th>
                        <th>Od</th>
                        <th>Do</th>
                    </tr>
                    </thead>
                    <tbody>
                    {prehlad.map((r, i) => (
                        <tr key={`${r.akad}-${i}`}>
                            <td>{r.akad}</td>
                            <td>{r.rok}</td>
                            <td><StatusPill text={r.stav} /></td>
                            <td className="small">{r.od || "—"}</td>
                            <td className="small">{r.do || "—"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

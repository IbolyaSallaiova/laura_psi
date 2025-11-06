import React, { useMemo, useState } from "react";

export default function Home() {
    const articles = useMemo(
        () => JSON.parse(localStorage.getItem("mais_articles") || "[]"),
        []
    );

    const [openArticle, setOpenArticle] = useState(null);

    // Funkcia na formátovanie textu článku (odseky)
    const renderBody = (text) =>
        String(text || "")
            .split(/\n{2,}/g)
            .map((para, i) => (
                <p key={i} style={{ margin: "10px 0", lineHeight: 1.5 }}>
                    {para}
                </p>
            ));

    if (openArticle) {
        const a = openArticle;
        return (
            <div className="card" style={{ padding: 24 }}>
                <button
                    className="btn"
                    onClick={() => setOpenArticle(null)}
                    style={{ marginBottom: 16 }}
                >
                    ← Späť na oznamy
                </button>
                <h2 style={{ marginTop: 0 }}>{a.title}</h2>
                <div className="small" style={{ opacity: 0.7, marginBottom: 12 }}>
                    {a.date}
                </div>
                <div>{renderBody(a.body)}</div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            {articles.length === 0 ? (
                <div className="card">
                    <h3>Oznamy</h3>
                    <div className="small">Žiadne oznámenia</div>
                </div>
            ) : (
                articles.map((a) => (
                    <article
                        key={a.id}
                        className="card"
                        style={{
                            padding: 20,
                            cursor: "pointer",
                            transition: "transform 0.1s ease, box-shadow 0.1s ease",
                        }}
                        onClick={() => setOpenArticle(a)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                            (e.key === "Enter" || e.key === " ") && setOpenArticle(a)
                        }
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 12,
                                marginBottom: 8,
                            }}
                        >
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{a.title}</div>
                            <div className="small" style={{ whiteSpace: "nowrap", opacity: 0.8 }}>
                                {a.date}
                            </div>
                        </div>
                        <div className="small" style={{ opacity: 0.85 }}>
                            {a.body.length > 180
                                ? a.body.slice(0, 180).split(" ").slice(0, -1).join(" ") + "…"
                                : a.body}
                        </div>
                    </article>
                ))
            )}
        </div>
    );
}

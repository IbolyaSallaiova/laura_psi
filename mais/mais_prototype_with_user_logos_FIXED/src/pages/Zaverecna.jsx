import React from "react";

export default function Zaverecna() {
    // prázdny „model“ – neťaháme nič z localStorage, aby sa nezobrazili tvoje staré údaje
    const data = {
        identifikator: "",
        nazov: "",
        podnazov: "",
        druh: "Bakalárska práca",
        pokyny: "",
        literatura: "",
        doplnujuce: "",
        jazykPrim: "slovenský (SK)",
        jazykSek: "anglický (EN)",
        poznamka: "",
        pracovisko: "Katedra počítačov a informatiky (KPI)",
        veduci: "",
        oponent: "",
        konzultant: "",
        datumVypisania: "",
        datumPriradenia: "",
        odovzdatDo: "",
        klucoveSlova: "",
        abstrakt: "",
        anotacia: "",
        posudokVeduciUrl: "",
        posudokOponentUrl: "",
        datumOriginality: "",
        vysledokOriginality: "",
        protokolOriginalityUrl: "",
        spristupnenie: "—",
        turnitinDatum: "",
        turnitinVysledok: "",
        turnitinProtokolUrl: "",
        hodnotenia: [], // {poradie, predmet, obdobie, nazov, hodnotenie, udelené, poznamka}
    };

    const field = (label, value) => (
        <div className="stat">
            <div className="stat-k">{label}</div>
            <div className="stat-v">{value || "—"}</div>
        </div>
    );

    return (
        <div className="zaverecna-wrap" style={{ display: "grid", gap: 12 }}>
            {/* Hlavná karta */}
            <div className="card">
                <div className="section-head">
                    <h3>Záverečná práca</h3>
                    <span className="small">Prehľad údajov k práci</span>
                </div>

                {/* Základné info (KPI štýl) */}
                <div className="kpi-grid" style={{ marginBottom: 8 }}>
                    <div className="kpi">
                        <div className="kpi-label">Identifikátor</div>
                        <div className="kpi-value">{data.identifikator || "—"}</div>
                    </div>
                    <div className="kpi gold">
                        <div className="kpi-label">Druh práce</div>
                        <div className="kpi-value gold">{data.druh || "—"}</div>
                    </div>
                    <div className="kpi">
                        <div className="kpi-label">Vedúci</div>
                        <div className="kpi-value">{data.veduci || "—"}</div>
                    </div>
                    <div className="kpi">
                        <div className="kpi-label">Oponent</div>
                        <div className="kpi-value">{data.oponent || "—"}</div>
                    </div>
                </div>

                {/* Názov / Podnázov */}
                <div className="stat-grid" style={{ marginTop: 8 }}>
                    {field("Názov", data.nazov)}
                    {field("Podnázov", data.podnazov)}
                    {field("Školiace pracovisko", data.pracovisko)}
                    {field("Konzultant", data.konzultant)}
                </div>

                {/* Pokyny / Abstrakt / Kľúčové slová */}
                <div className="section-divider" />
                <div className="subhead">Pokyny na vypracovanie</div>
                <div className="small" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                    {data.pokyny || "—"}
                </div>

                <div className="subhead" style={{ marginTop: 12 }}>Kľúčové slová</div>
                <div className="small" style={{ marginTop: 6 }}>
                    {data.klucoveSlova || "—"}
                </div>

                <div className="subhead" style={{ marginTop: 12 }}>Abstrakt</div>
                <div className="small" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                    {data.abstrakt || "—"}
                </div>

                {/* Jazyky / dátumy */}
                <div className="section-divider" />
                <div className="stat-grid">
                    {field("Primárny jazyk", data.jazykPrim)}
                    {field("Sekundárny jazyk", data.jazykSek)}
                    {field("Dátum vypísania", data.datumVypisania)}
                    {field("Dátum priradenia", data.datumPriradenia)}
                    {field("Odovzdať do", data.odovzdatDo)}
                    {field("Poznámka", data.poznamka)}
                </div>
            </div>

            {/* Originalita a posudky */}
            <div className="card">
                <div className="section-head">
                    <h3>Originalita a posudky</h3>
                    <span className="small">Kontrola originality a dokumenty</span>
                </div>

                <div className="stat-grid">
                    {field("Dátum kontroly originality", data.datumOriginality)}
                    {field("Výsledok kontroly originality", data.vysledokOriginality)}
                    <div className="stat">
                        <div className="stat-k">Protokol o kontrole originality</div>
                        <div className="stat-v">
                            {data.protokolOriginalityUrl ? (
                                <a href={data.protokolOriginalityUrl} target="_blank" rel="noreferrer" className="btn">
                                    Otvoriť protokol
                                </a>
                            ) : (
                                "—"
                            )}
                        </div>
                    </div>
                    {field("Sprístupnenie práce v knižnici", data.spristupnenie)}
                    {field("Výsledok originality v Turnitin", data.turnitinVysledok)}
                    <div className="stat">
                        <div className="stat-k">Protokol Turnitin</div>
                        <div className="stat-v">
                            {data.turnitinProtokolUrl ? (
                                <a href={data.turnitinProtokolUrl} target="_blank" rel="noreferrer" className="btn">
                                    Otvoriť protokol
                                </a>
                            ) : (
                                "—"
                            )}
                        </div>
                    </div>
                </div>

                <div className="section-divider" />

                <div className="stat-grid">
                    <div className="stat">
                        <div className="stat-k">Posudok vedúceho</div>
                        <div className="stat-v">
                            {data.posudokVeduciUrl ? (
                                <a href={data.posudokVeduciUrl} target="_blank" rel="noreferrer" className="btn">
                                    Otvoriť posudok
                                </a>
                            ) : (
                                "—"
                            )}
                        </div>
                    </div>
                    <div className="stat">
                        <div className="stat-k">Posudok oponenta</div>
                        <div className="stat-v">
                            {data.posudokOponentUrl ? (
                                <a href={data.posudokOponentUrl} target="_blank" rel="noreferrer" className="btn">
                                    Otvoriť posudok
                                </a>
                            ) : (
                                "—"
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hodnotenie ZP */}
            <div className="card">
                <div className="section-head">
                    <h3>Hodnotenie záverečnej práce</h3>
                    <span className="small">Prehľad hodnotení a termínov</span>
                </div>

                <table className="table table-compact" style={{ marginTop: 8 }}>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Predmet</th>
                        <th>Obdobie</th>
                        <th>Názov hodnotenia</th>
                        <th>Udelené hodnotenie</th>
                        <th>Udelené</th>
                        <th>Pozn.</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(!data.hodnotenia || data.hodnotenia.length === 0) ? (
                        <tr>
                            <td colSpan={7} className="small">Zatiaľ bez záznamov.</td>
                        </tr>
                    ) : (
                        data.hodnotenia.map((h, i) => (
                            <tr key={i}>
                                <td>{h.poradie}</td>
                                <td>{h.predmet}</td>
                                <td>{h.obdobie}</td>
                                <td>{h.nazov}</td>
                                <td className="gold-text">{h.hodnotenie}</td>
                                <td>{h.udeleno}</td>
                                <td>{h.poznamka || "—"}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

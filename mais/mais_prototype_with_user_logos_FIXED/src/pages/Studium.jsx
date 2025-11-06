import React, { useState, useEffect, useMemo } from 'react';

export default function Studium() {
    /* ======= Moje predmety / známky ======= */
    const semesters = ['2024/2025 LS', '2024/2025 ZS', '2025/2026 ZS'];
    const [sem, setSem] = useState(semesters[0]);
    const [grades, setGrades] = useState(() =>
        JSON.parse(
            localStorage.getItem('mais_grades') ||
            JSON.stringify({
                '2024/2025 LS': [
                    { code: 'INF101', name: 'Programovanie 1', grade: 1.3 },
                    { code: 'MAT101', name: 'Matematika 1', grade: 1.7 },
                ],
                '2024/2025 ZS': [{ code: 'ALG201', name: 'Algoritmy', grade: 2.0 }],
                '2025/2026 ZS': [],
            })
        )
    );
    useEffect(() => localStorage.setItem('mais_grades', JSON.stringify(grades)), [grades]);

    const avg = useMemo(() => {
        const list = grades[sem] || [];
        if (!list.length) return '—';
        return (list.reduce((s, i) => s + (Number(i.grade) || 0), 0) / list.length).toFixed(2);
    }, [grades, sem]);

    /* ======= Info / Štipendiá / Platby ======= */
    const studyInfo = {
        cisloStudia: 'S2422113501-2625T02',
        program: 'Informatika (INF_Ing_D_sk)',
        skupina: '',
        zaciatok: '01.09.2025',
        koniec: '',
        rokStudia: '1',
        rokOSP: '1',
        vsp: '0,00',
        vspUzavrete: '',
        kredityAll: '0/0',
        kredityPPVV: '0/0/0',
        kredityUznane: '0',
        celkovaDlzka: '1',
    };

    const [stipFilter, setStipFilter] = useState('platne');

    const platby = [
        {
            datum: '01.07.2025',
            typ: 'FEI_zápisné pre novoprijatých',
            splatnost: '15.07.2025',
            ciastka: '33,7 €',
            ucet: '7000151433/8180\nSK8281800000007000151433',
            vs: '2625011495',
            ss: '26101',
            uhradene: '33,7 €',
        },
        {
            datum: '17.05.2022',
            typ: 'FEI_zápisné pre novoprijatých',
            splatnost: '30.06.2022',
            ciastka: '41,8 €',
            ucet: '7000151433/8180\nSK8281800000007000151433',
            vs: '2622003266',
            ss: '26101',
            uhradene: '41,8 €',
        },
    ];

    return (
        <div className="studium-wrap">
            {/* ==== KPI pruh ==== */}
            <div className="kpi-grid">
                <div className="kpi gold">
                    <div className="kpi-label">Vážený študijný priemer</div>
                    <div className="kpi-value gold">{studyInfo.vsp}</div>
                </div>
                <div className="kpi">
                    <div className="kpi-label">Kredity (spolu / uzavreté)</div>
                    <div className="kpi-value gold">{studyInfo.kredityAll}</div>
                </div>
                <div className="kpi">
                    <div className="kpi-label">Rok štúdia / OŠP</div>
                    <div className="kpi-value">
                        {studyInfo.rokStudia} / {studyInfo.rokOSP}
                    </div>
                </div>
                <div className="kpi">
                    <div className="kpi-label">Dĺžka štúdia (roky)</div>
                    <div className="kpi-value">{studyInfo.celkovaDlzka}</div>
                </div>
            </div>

            {/* ==== Informácie o štúdiu ==== */}
            <div className="card">
                <div className="section-head">
                    <h3>Informácie o štúdiu</h3>
                    <span className="small">Prehľad základných údajov</span>
                </div>
                <div className="stat-grid">
                    {Object.entries({
                        'Číslo štúdia': studyInfo.cisloStudia,
                        'Študijný program': studyInfo.program,
                        'Študijná skupina': studyInfo.skupina,
                        'Začiatok štúdia': studyInfo.zaciatok,
                        'Koniec štúdia': studyInfo.koniec,
                        'Počet kreditov P/PV/V': studyInfo.kredityPPVV,
                        'Uznané kredity': studyInfo.kredityUznane,
                        'VŠP za uzavreté obdobia': studyInfo.vspUzavrete,
                    }).map(([k, v]) => (
                        <div key={k} className="stat">
                            <div className="stat-k">{k}</div>
                            <div className="stat-v">{v || '—'}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ==== Moje predmety ==== */}
            <div className="card">
                <div className="section-head">
                    <div>
                        <h3>Moje predmety</h3>
                        <div className="small">Vyber semester</div>
                    </div>
                    <select
                        value={sem}
                        onChange={(e) => setSem(e.target.value)}
                        className="input select-sem"
                    >
                        {semesters.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="small">
                    Priemer predmetov: <strong className="gold-text">{avg}</strong>
                </div>
                <table className="table table-compact" style={{ marginTop: 8 }}>
                    <thead>
                    <tr>
                        <th>Kód</th>
                        <th>Názov</th>
                        <th>Známka</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(grades[sem] || []).map((g, i) => (
                        <tr key={i}>
                            <td>
                                <span className="pill pill-blue">{g.code}</span>
                            </td>
                            <td>{g.name}</td>
                            <td>
                                <span className="pill gold">{g.grade}</span>
                            </td>
                        </tr>
                    ))}
                    {(grades[sem] || []).length === 0 && (
                        <tr>
                            <td colSpan={3} className="small">
                                Žiadne predmety
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* ==== Štipendiá ==== */}
            <div className="card">
                <div className="section-head">
                    <h3>Štipendiá</h3>
                    <div className="seg-mini">
                        <button
                            className={'seg-mini-btn' + (stipFilter === 'platne' ? ' is-active' : '')}
                            onClick={() => setStipFilter('platne')}
                        >
                            Aktuálne platné
                        </button>
                        <button
                            className={'seg-mini-btn' + (stipFilter === 'vsetky' ? ' is-active' : '')}
                            onClick={() => setStipFilter('vsetky')}
                        >
                            Všetky
                        </button>
                    </div>
                </div>
                <div className="empty-note">Nemáte priznané žiadne štipendium.</div>
            </div>

            {/* ==== Platby a poplatky ==== */}
            <div className="card platby-card">
                <div className="section-head">
                    <h3>Platby a poplatky</h3>
                    <span className="small">Rozhodnutia a úhrady spojené so štúdiom</span>
                </div>

                <table className="table table-compact platby-table">
                    <thead>
                    <tr>
                        <th>Dátum</th>
                        <th>Typ poplatku</th>
                        <th>Splatnosť</th>
                        <th>Čiastka</th>
                        <th>Číslo účtu / IBAN</th>
                        <th>VS</th>
                        <th>ŠS</th>
                        <th>Uhradené</th>
                    </tr>
                    </thead>
                    <tbody>
                    {platby.map((r, i) => (
                        <tr key={i}>
                            <td className="small">{r.datum}</td>
                            <td>{r.typ}</td>
                            <td className="small">{r.splatnost}</td>
                            <td className="gold-text">{r.ciastka}</td>
                            <td style={{ whiteSpace: 'pre-wrap' }}>{r.ucet}</td>
                            <td>{r.vs}</td>
                            <td>{r.ss}</td>
                            <td>
                                <span className="pill pill-gold">{r.uhradene}</span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

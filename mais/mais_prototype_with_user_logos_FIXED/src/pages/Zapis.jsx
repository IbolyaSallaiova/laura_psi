import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

const sampleSubjects = [
    { id: 1, code: 'INF101', name: 'Programovanie 1', kredit: 6 },
    { id: 2, code: 'MAT101', name: 'Matematika 1', kredit: 5 },
    { id: 3, code: 'ALG201', name: 'Algoritmy', kredit: 5 },
    { id: 4, code: 'DB202',  name: 'Databázy', kredit: 5 },
];

function Volene({ chosen, setChosen }) {
    const totalCredits = chosen.reduce((s, x) => s + (x.kredit || 0), 0);
    const remove = (id) => setChosen((prev) => prev.filter((c) => c.id !== id));

    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const add = (s) => setChosen((prev) => (prev.some((p) => p.id === s.id) ? prev : [...prev, s]));

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = sampleSubjects.filter(
            (s) => !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
        );
        if (sortKey === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
        if (sortKey === 'code') list.sort((a, b) => a.code.localeCompare(b.code));
        if (sortKey === 'kredit') list.sort((a, b) => b.kredit - a.kredit);
        return list;
    }, [query, sortKey]);

    return (
        <div>
            <div className="small">Vybrané predmety sú uložené lokálne.</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <div className="small">Počet: <strong>{chosen.length}</strong> • Kredity: <strong>{totalCredits}</strong></div>
                {chosen.length > 0 && <button className="btn" onClick={() => setChosen([])}>Vymazať všetky</button>}
            </div>

            {chosen.length === 0 ? (
                <div className="small" style={{ marginTop: 8 }}>Žiadne vybrané predmety</div>
            ) : (
                <table className="table" style={{ marginTop: 8 }}>
                    <thead><tr><th>Kód</th><th>Názov</th><th>Kredit</th><th></th></tr></thead>
                    <tbody>
                    {chosen.map((c) => (
                        <tr key={c.id}>
                            <td>{c.code}</td><td>{c.name}</td><td>{c.kredit}</td>
                            <td><button className="btn" onClick={() => remove(c.id)}>Odstrániť</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input className="input" placeholder="Hľadaj predmet…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 320 }} />
                <select className="input" value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ width: 200 }}>
                    <option value="name">Triediť: Názov (A→Z)</option>
                    <option value="code">Triediť: Kód (A→Z)</option>
                    <option value="kredit">Triediť: Kredit (najviac → najmenej)</option>
                </select>
            </div>

            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {filtered.map((s) => {
                    const picked = chosen.some((c) => c.id === s.id);
                    return (
                        <div key={s.id} className="card" style={{ padding: 12 }}>
                            <div style={{ fontWeight: 700 }}>{s.code} — {s.name}</div>
                            <div className="small" style={{ marginTop: 4 }}>{s.kredit} kreditov</div>
                            <div style={{ marginTop: 8 }}>
                                {!picked
                                    ? <button className="btn" onClick={() => add(s)}>Pridať</button>
                                    : <button className="btn" onClick={() => remove(s.id)}>Odstrániť</button>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function RozvrhPreview({ chosen }) {
    return (
        <div>
            <div className="small">Náhľad rozvrhu (zvolené predmety zobrazia svoj rozvrh).</div>
            <div style={{ marginTop: 8 }}>
                {chosen.length === 0 ? (
                    <div className="small">Žiadne predmety v rozvrhu</div>
                ) : (
                    <table className="table">
                        <thead><tr><th>Predmet</th><th>Deň</th><th>Čas</th><th>Miestnosť</th></tr></thead>
                        <tbody>
                        {chosen.map((c, i) => (
                            <tr key={c.id}>
                                <td>{c.name}</td>
                                <td>{['Po', 'Ut', 'St', 'Št', 'Pi'][i % 5]}</td>
                                <td>08:00-09:30</td>
                                <td>A-{100 + i}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function Plan() {
    return (
        <div>
            <div className="small">Odporúčaný študijný plán pre tvoj program.</div>
            <ul style={{ marginTop: 8 }} className="list">
                <li>Semestrálne povinné predmety: INF101, MAT101</li>
                <li>Voliteľné: ALG201, DB202</li>
            </ul>
        </div>
    );
}

function Online() {
    return (
        <div>
            <div className="small">Online zápis na štúdium (potvrdenie pre ročník/akademický rok).</div>
            <div style={{ marginTop: 8 }}>
                <button className="btn" onClick={() => alert('Zápis odoslaný (prototyp)')}>Potvrdiť zápis</button>
            </div>
        </div>
    );
}

export default function Zapis() {
    const [chosen, setChosen] = useState(() => JSON.parse(localStorage.getItem('mais_chosen') || '[]'));
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => localStorage.setItem('mais_chosen', JSON.stringify(chosen)), [chosen]);

    // ak používateľ príde na /zapis bez podcesty -> presmeruj na /zapis/volene
    useEffect(() => {
        if (location.pathname === '/zapis') {
            navigate('/zapis/volene', { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <div className="card">
            <Routes>
                <Route path="volene" element={<Volene chosen={chosen} setChosen={setChosen} />} />
                <Route path="rozvrh" element={<RozvrhPreview chosen={chosen} />} />
                <Route path="plan" element={<Plan />} />
                <Route path="online" element={<Online />} />
            </Routes>
        </div>
    );
}

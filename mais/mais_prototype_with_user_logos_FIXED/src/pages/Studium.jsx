import React, { useState, useEffect, useMemo } from 'react';

import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function formatGradeDate(isoString) {
    if (!isoString) return '—';
    try {
        return new Date(isoString).toLocaleString('sk-SK', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    } catch (error) {
        return isoString;
    }
}

export default function Studium() {
    const { token } = useAuth();

    /* ======= Moje predmety / známky ======= */
    const [grades, setGrades] = useState([]);
    const [loadingGrades, setLoadingGrades] = useState(false);
    const [gradesError, setGradesError] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);

    useEffect(() => {
        if (!token) {
            setGrades([]);
            return;
        }
        let ignore = false;
        setLoadingGrades(true);
        setGradesError(null);
        apiFetch('/api/grades/me', { token })
            .then((data) => {
                if (ignore) return;
                setGrades(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (ignore) return;
                setGradesError(err.message || 'Známky sa nepodarilo načítať.');
            })
            .finally(() => {
                if (!ignore) {
                    setLoadingGrades(false);
                }
            });
        return () => {
            ignore = true;
        };
    }, [token]);

    const subjects = useMemo(() => {
        const map = new Map();
        grades.forEach((grade) => {
            if (!grade.subjectId) return;
            const entry = map.get(grade.subjectId) || {
                id: grade.subjectId,
                name: grade.subjectName || 'Neznámy predmet',
                code: grade.subjectCode || '',
                grades: [],
            };
            entry.grades.push(grade);
            map.set(grade.subjectId, entry);
        });
        return Array.from(map.values()).map((entry) => {
            const average = entry.grades.length
                ? (entry.grades.reduce((sum, item) => sum + Number(item.value || 0), 0) / entry.grades.length).toFixed(2)
                : '—';
            return { ...entry, average };
        });
    }, [grades]);

    useEffect(() => {
        if (!subjects.length) {
            setSelectedSubjectId(null);
            return;
        }
        setSelectedSubjectId((prev) => {
            if (prev && subjects.some((subject) => subject.id === prev)) {
                return prev;
            }
            return subjects[0].id;
        });
    }, [subjects]);

    const selectedGrades = useMemo(() => {
        if (!selectedSubjectId) return grades;
        return grades.filter((grade) => grade.subjectId === selectedSubjectId);
    }, [grades, selectedSubjectId]);

    const avg = useMemo(() => {
        if (!selectedGrades.length) return '—';
        return (
            selectedGrades.reduce((sum, grade) => sum + Number(grade.value || 0), 0) /
            selectedGrades.length
        ).toFixed(2);
    }, [selectedGrades]);

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
                        <div className="small">Vyber predmet</div>
                    </div>
                    <select
                        value={selectedSubjectId ?? ''}
                        onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                        className="input select-sem"
                        disabled={!subjects.length}
                    >
                        {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {subject.code ? `${subject.code} — ` : ''}{subject.name}
                            </option>
                        ))}
                        {!subjects.length && <option value="">Žiadne predmety</option>}
                    </select>
                </div>

                    <div className="small">
                        Priemerná známka: <strong className="gold-text">{avg}</strong>
                    </div>
                    {gradesError && (
                        <div className="small" style={{ color: 'var(--danger)', marginTop: 8 }}>
                            {gradesError}
                        </div>
                    )}
                    {loadingGrades ? (
                        <div style={{ marginTop: 12 }}>Načítavam známky...</div>
                    ) : (
                        <table className="table table-compact" style={{ marginTop: 8 }}>
                            <thead>
                            <tr>
                                <th>Kód</th>
                                <th>Názov</th>
                                <th>Známka</th>
                                <th>Popis</th>
                                <th>Učiteľ</th>
                                <th>Dátum</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedGrades.map((grade) => (
                                <tr key={grade.id}>
                                    <td>
                                        <span className="pill pill-blue">{grade.subjectCode || '—'}</span>
                                    </td>
                                    <td>{grade.subjectName || '—'}</td>
                                    <td>
                                        <span className="pill gold">{grade.value}</span>
                                    </td>
                                    <td>{grade.description || '—'}</td>
                                    <td>{grade.teacherName || '—'}</td>
                                    <td>{formatGradeDate(grade.assignedAt)}</td>
                                </tr>
                            ))}
                            {selectedGrades.length === 0 && !loadingGrades && (
                                <tr>
                                    <td colSpan={6} className="small">
                                        Žiadne známky pre vybraný predmet.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    )}
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

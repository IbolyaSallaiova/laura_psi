import React, { useMemo, useState, useEffect } from 'react';

export default function Rozvrh() {
    const semesters = ['2024/2025 LS', '2025/2026 ZS'];
    const [sem, setSem] = useState(semesters[0]);

    // Demo dáta v localStorage
    const [slots, setSlots] = useState(() =>
        JSON.parse(
            localStorage.getItem('mais_timetable') ||
            JSON.stringify({
                '2024/2025 LS': [
                    { day: 1, time: '07:30-09:00', title: 'Programovanie 1', room: 'A-101' },
                    { day: 3, time: '10:15-11:45', title: 'Matematika 1', room: 'B-202' },
                ],
                '2025/2026 ZS': [
                    { day: 2, time: '09:45-11:15', title: 'Algoritmy', room: 'C-301' },
                ],
            })
        )
    );

    useEffect(() => localStorage.setItem('mais_timetable', JSON.stringify(slots)), [slots]);

    const days = ['Po', 'Ut', 'St', 'Št', 'Pi'];

    // === časová os: od 07:30 do 19:30 po 45 minútach
    const slotStarts = useMemo(() => {
        const out = [];
        const toMin = (h, m) => h * 60 + m;
        const toStr = (min) =>
            `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
        for (let t = toMin(7, 30); t < toMin(19, 30); t += 45) out.push(toStr(t));
        return out;
    }, []);

    const nextTime = (t) => {
        const [H, M] = t.split(':').map(Number);
        const m = H * 60 + M + 45;
        const hh = String(Math.floor(m / 60)).padStart(2, '0');
        const mm = String(m % 60).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    // Parse časový rozsah (napr. "07:30-09:00") na index a span
    const parseRange = (range) => {
        const [a, b] = range.split('-');
        const startIdx = slotStarts.indexOf(a);
        if (startIdx === -1) return null;
        const [ah, am] = a.split(':').map(Number);
        const [bh, bm] = b.split(':').map(Number);
        const span = Math.max(1, Math.round(((bh * 60 + bm) - (ah * 60 + am)) / 45));
        return { startIdx, span };
    };

    // rozloženie predmetov do mriežky
    const coverageByDay = useMemo(() => {
        const map = {};
        for (let d = 1; d <= 5; d++) {
            const row = Array(slotStarts.length).fill(null);
            (slots[sem] || [])
                .filter((it) => it.day === d)
                .forEach((it) => {
                    const range = parseRange(it.time);
                    if (!range) return;
                    const { startIdx, span } = range;
                    row[startIdx] = { ...it, span };
                    for (let i = 1; i < span && startIdx + i < row.length; i++) {
                        row[startIdx + i] = '__covered__';
                    }
                });
            map[d] = row;
        }
        return map;
    }, [slots, sem, slotStarts]);

    const cols = slotStarts.length; // počet časových stĺpcov

    return (
        <div className="content">
            <div className="card">
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <h3 style={{ margin: 0 }}>Rozvrh — {sem}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="small">Semester</div>
                        <select
                            value={sem}
                            onChange={(e) => setSem(e.target.value)}
                            className="input"
                            style={{ width: 220 }}
                        >
                            {semesters.map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* === rozvrh === */}
                <div className="timetable-wrap">
                    <div className="timetable" style={{ '--cols': cols }}>
                        {/* hlavička časov */}
                        <div className="tcell tcell-head tcell-corner">Deň / Čas</div>
                        {slotStarts.map((start, i) => (
                            <div key={i} className="tcell tcell-head">
                                <div className="t-time">
                                    {start}–{nextTime(start)}
                                </div>
                            </div>
                        ))}

                        {/* riadky dní */}
                        {days.map((dayLabel, dIdx) => {
                            const d = dIdx + 1;
                            const row = coverageByDay[d];
                            let i = 0;
                            return (
                                <React.Fragment key={dayLabel}>
                                    <div className="tcell tcell-day">
                                        <strong>{dayLabel}</strong>
                                    </div>
                                    {row.map((cell, idx) => {
                                        if (i > idx) return null;
                                        if (cell && cell !== '__covered__') {
                                            const span = cell.span || 1;
                                            i = idx + span;
                                            return (
                                                <div
                                                    key={`${d}-${idx}`}
                                                    className="tcell tcell-span"
                                                    style={{ gridColumn: `span ${span}` }}
                                                >
                                                    <div className="tblock">
                                                        <div className="tblock-title">{cell.title}</div>
                                                        <div className="tblock-room">{cell.room}</div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            i = idx + 1;
                                            return (
                                                <div key={`${d}-${idx}`} className="tcell tcell-empty">
                                                    <span className="small">–</span>
                                                </div>
                                            );
                                        }
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

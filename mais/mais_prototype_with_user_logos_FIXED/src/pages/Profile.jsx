import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="content">
                <div className="card">
                    <h2>Profil</h2>
                    <p className="small">Nie si prihlásený. Najprv sa prosím prihlás.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="content">
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
                {/* Foto používateľa */}
                <div>
                    <div
                        className="avatar-frame"
                        style={{
                            width: 200,
                            height: 240,
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            background: 'var(--surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            color: 'var(--muted)'
                        }}
                    >
                        Foto používateľa
                    </div>
                    <button className="btn" style={{ marginTop: 12, width: '100%' }} disabled>
                        Nahrať fotku (demo)
                    </button>
                </div>

                {/* Údaje – len kategórie, bez vyplnených dát */}
                <div>
                    <h2 style={{ marginTop: 0 }}>Profil používateľa</h2>
                    <div className="field"><strong>Meno a priezvisko</strong>: </div>
                    <div className="field"><strong>Číslo čipovej karty</strong>: </div>
                    <div className="field"><strong>ISIC</strong>: </div>
                    <div className="field"><strong>Číslo študenta</strong>: </div>
                    <div className="field"><strong>Číslo štúdia</strong>: </div>
                    <div className="field"><strong>Dátum narodenia</strong>: </div>
                    <div className="field"><strong>Miesto narodenia</strong>: </div>
                    <div className="field"><strong>Rodné číslo</strong>: </div>
                    <div className="field"><strong>Číslo OP</strong>: </div>
                    <div className="field"><strong>Číslo pasu</strong>: </div>
                    <div className="field"><strong>Štátna príslušnosť</strong>: </div>
                    <div className="field"><strong>Rodinný stav</strong>: </div>
                    <div className="field"><strong>Zdravotná spôsobilosť</strong>: </div>
                    <div className="field"><strong>Trvalé bydlisko</strong>: </div>
                    <div className="field"><strong>Poštová adresa</strong>: </div>
                    <div className="field"><strong>Tel. kontakt</strong>: </div>
                    <div className="field"><strong>Email kontakt</strong>: </div>
                    <div className="field"><strong>Bankové spojenie</strong>: </div>
                    <div className="field"><strong>IBAN</strong>: </div>
                    <div className="field"><strong>Súhlas so spracovaním osobných údajov absolventa</strong>: </div>
                    <div className="field"><strong>Súhlas so zasielaním firemných ponúk</strong>: </div>

                    <div className="card" style={{ marginTop: 12 }}>
                        <div className="small" style={{ marginBottom: 6 }}><strong>Variabilné symboly</strong></div>
                        <div className="field small">– platby za ubytovanie: </div>
                        <div className="field small">– platby za štúdium: </div>
                        <div className="field small">– ostatné: </div>
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        <button className="btn" onClick={logout}>Odhlásiť sa</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

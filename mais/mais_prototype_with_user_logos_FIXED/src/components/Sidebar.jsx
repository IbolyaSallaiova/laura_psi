import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const Item = ({ to, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
    >
        {children}
    </NavLink>
);

export default function Sidebar({
                                    isAuthenticated = false,
                                    currentPath = "/",
                                    userRole = "student",
                                }) {
    const [openZapis, setOpenZapis] = useState(false);

    useEffect(() => {
        setOpenZapis(currentPath.startsWith("/zapis"));
    }, [currentPath]);

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="logo">
                <img
                    className="logo-img logo-light"
                    src="/src/assets/mais_logo_light.png"
                    alt="MAIS logo"
                />
                <img
                    className="logo-img logo-dark"
                    src="/src/assets/mais_logo_dark.png"
                    alt="MAIS logo dark"
                />
            </div>

            <div className="nav-section">
                <Item to="/">Domov</Item>

                {/* ======== Ak NIE je prihlásený ======== */}
                {!isAuthenticated && (
                    <div
                        className="small"
                        style={{
                            marginTop: 16,
                            color: "var(--muted)",
                            fontStyle: "italic",
                            lineHeight: 1.4,
                        }}
                    >
                        Pre prístup k ďalším funkciám sa{" "}
                        <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              prihláste
            </span>
                        .
                    </div>
                )}

                {/* ======== Ak je prihlásený ======== */}
                {isAuthenticated && (
                    <>
                        {/* Spoločné sekcie */}
                        <Item to="/rozvrh">Rozvrh</Item>

                        {/* ===== ŠTUDENT ===== */}
                        {userRole === "student" && (
                            <>
                                {/* Zápis + submenu */}
                                <div className="nav-group">
                                    <NavLink
                                        to="/zapis/volene"
                                        className={({ isActive }) =>
                                            "nav-item" + (isActive || openZapis ? " active" : "")
                                        }
                                        onClick={() => setOpenZapis(!openZapis)}
                                    >
                                        Zápis
                                    </NavLink>
                                    {openZapis && (
                                        <div id="submenu-zapis" className="submenu">
                                            <NavLink
                                                to="/zapis/volene"
                                                className={({ isActive }) =>
                                                    "sub-item" + (isActive ? " active" : "")
                                                }
                                            >
                                                Zvolené predmety
                                            </NavLink>
                                            <NavLink
                                                to="/zapis/rozvrh"
                                                className={({ isActive }) =>
                                                    "sub-item" + (isActive ? " active" : "")
                                                }
                                            >
                                                Zápis do rozvrhu
                                            </NavLink>
                                            <NavLink
                                                to="/zapis/plan"
                                                className={({ isActive }) =>
                                                    "sub-item" + (isActive ? " active" : "")
                                                }
                                            >
                                                Odporúčaný plán
                                            </NavLink>
                                            <NavLink
                                                to="/zapis/online"
                                                className={({ isActive }) =>
                                                    "sub-item" + (isActive ? " active" : "")
                                                }
                                            >
                                                Online zápis
                                            </NavLink>
                                        </div>
                                    )}
                                </div>

                                <Item to="/terminy">Skúškové termíny</Item>
                                <Item to="/studium">Štúdium</Item>
                                <Item to="/zaverecna">Záverečná práca</Item>
                                <Item to="/ubytovanie">Ubytovanie</Item>
                            </>
                        )}

                        {/* ===== UČITEĽ ===== */}
                        {userRole === "teacher" && (
                            <>
                                <Item to="/grades">Zápis známok</Item>
                            </>
                        )}

                        {/* Spoločné pre všetkých */}
                        <Item to="/profil">Profil</Item>
                    </>
                )}
            </div>
        </aside>
    );
}

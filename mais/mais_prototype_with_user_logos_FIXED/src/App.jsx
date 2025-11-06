import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

/* Stránky */
import Home from "./pages/Home";
import Rozvrh from "./pages/Rozvrh";
import Zapis from "./pages/Zapis";
import Profile from "./pages/Profile";
import Studium from "./pages/Studium";
import Ubytovanie from "./pages/Ubytovanie";
import Zaverecna from "./pages/Zaverecna";
import ZapisZnamok from "./pages/ZapisZnamok"; // pre učiteľa

/* Guardy */
function RequireAuth({ children }) {
    const { isAuthenticated } = useAuth();
    // Ak používaš login modál v Topbare (bez samostatnej /login stránky), redirect na "/"
    if (!isAuthenticated) return <Navigate to="/" replace />;
    return children;
}

function RequireRole({ role, children }) {
    const { user } = useAuth();
    const want = String(role || "").toUpperCase();
    const have = String(user?.role || "").toUpperCase(); // backend: STUDENT/TEACHER/ADMIN
    if (!user || have !== want) return <Navigate to="/" replace />;
    return children;
}

/* Shell */
function AppShell() {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Sidebar môže očakávať "student"/"teacher" v lowercase – normalizujeme
    const sidebarRole = String(user?.role || "STUDENT").toLowerCase();

    return (
        <div className="app-shell">
            <Sidebar
                isAuthenticated={isAuthenticated}
                currentPath={location.pathname}
                userRole={sidebarRole}
            />
            <Topbar />
            <main className="main">
                <Routes>
                    {/* Verejné */}
                    <Route path="/" element={<Home />} />

                    {/* Spoločné chránené */}
                    <Route path="/rozvrh" element={<RequireAuth><Rozvrh /></RequireAuth>} />
                    <Route path="/profil" element={<RequireAuth><Profile /></RequireAuth>} />

                    {/* Študent */}
                    <Route
                        path="/zapis/*"
                        element={
                            <RequireAuth>
                                <RequireRole role="STUDENT">
                                    <Zapis />
                                </RequireRole>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/studium"
                        element={
                            <RequireAuth>
                                <RequireRole role="STUDENT">
                                    <Studium />
                                </RequireRole>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/ubytovanie"
                        element={
                            <RequireAuth>
                                <RequireRole role="STUDENT">
                                    <Ubytovanie />
                                </RequireRole>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/zaverecna"
                        element={
                            <RequireAuth>
                                <RequireRole role="STUDENT">
                                    <Zaverecna />
                                </RequireRole>
                            </RequireAuth>
                        }
                    />

                    {/* Učiteľ */}
                    <Route
                        path="/grades"
                        element={
                            <RequireAuth>
                                <RequireRole role="TEACHER">
                                    <ZapisZnamok />
                                </RequireRole>
                            </RequireAuth>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

/* Root */
export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppShell />
            </BrowserRouter>
        </AuthProvider>
    );
}

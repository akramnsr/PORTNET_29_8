import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AgentTasks from '../components/AgentTasks';

/**
 * DashboardAgent — version corrigée
 * - Fond image /image1.jpg (dossier public)
 * - Header + cartes glassmorphism
 * - Loader élégant pendant la récupération des infos agent
 */

// 🎨 Styles (hors composant)
const styles = {
    page: {
        minHeight: '100vh',
        width: '100%',
        backgroundImage:
            'linear-gradient( rgba(0,0,0,0.45), rgba(0,0,0,0.5) ), url(/image1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 100%)',
        backdropFilter: 'saturate(120%) blur(6px)',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: 'white',
        fontWeight: 700,
        letterSpacing: 0.3,
    },
    brandBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.15)',
        display: 'grid',
        placeItems: 'center',
        border: '1px solid rgba(255,255,255,0.25)',
    },
    logoutBtn: {
        background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
        color: 'white',
        border: 'none',
        borderRadius: 12,
        padding: '10px 16px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
        transition: 'transform 120ms ease, filter 120ms ease',
    },
    container: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 16,
        maxWidth: 1120,
        width: '100%',
        margin: '28px auto',
        padding: '0 16px',
    },
    card: {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        borderRadius: 20,
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: 20,
    },
    title: { margin: 0, fontSize: 28, fontWeight: 800, color: 'white' },
    subtitle: { marginTop: 6, marginBottom: 0, color: 'rgba(255,255,255,0.85)' },
    fieldRow: {
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        gap: 10,
        alignItems: 'baseline',
        marginTop: 8,
    },
    label: { color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
    value: { color: 'white', fontWeight: 700 },
    sectionTitle: { margin: '0 0 10px', color: 'white', fontWeight: 800 },
    spinnerWrap: {
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
            'linear-gradient( rgba(0,0,0,0.55), rgba(0,0,0,0.6) ), url(/image1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    spinner: {
        width: 46,
        height: 46,
        border: '4px solid rgba(255,255,255,0.25)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
};

// Petite animation CSS pour le spinner + hover
const GlobalSpinnerStyle = () => (
    <style>
        {`
      @keyframes spin { to { transform: rotate(360deg); } }
      .logout:hover { transform: translateY(-1px); filter: brightness(1.02); }
      .card-hover { transition: transform 160ms ease, box-shadow 160ms ease; }
      .card-hover:hover { transform: translateY(-2px); box-shadow: 0 16px 44px rgba(0,0,0,0.45); }
      @media (min-width: 900px) {
        .grid-12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
        .col-span-5 { grid-column: span 5 / span 5; }
        .col-span-7 { grid-column: span 7 / span 7; }
      }
    `}
    </style>
);

const LoadingScreen = () => (
    <div style={styles.spinnerWrap}>
        <div style={styles.spinner} aria-label="Chargement" />
    </div>
);

const DashboardAgent = () => {
    const [agent, setAgent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login');

                const response = await axios.get('http://localhost:8080/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAgent(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'agent :", error);
                navigate('/login');
            }
        };

        fetchAgent();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!agent) return <LoadingScreen />;

    return (
        <div style={styles.page}>
            <GlobalSpinnerStyle />

            {/* Header */}
            <header style={styles.header}>
                <div style={styles.brand}>
                    <div style={styles.brandBadge} aria-hidden>
                        <span role="img" aria-label="bouclier">🛡️</span>
                    </div>
                    <div>
                        <div style={{ fontSize: 14, opacity: 0.85 }}>Espace Agent</div>
                        <div style={{ fontSize: 18 }}>Bienvenue</div>
                    </div>
                </div>
                <button
                    className="logout"
                    onClick={handleLogout}
                    style={styles.logoutBtn}
                    aria-label="Se déconnecter"
                    title="Se déconnecter"
                >
                    🔓 Se déconnecter
                </button>
            </header>

            {/* Contenu */}
            <main style={styles.container}>
                <section className="grid-12">
                    {/* Carte Profil */}
                    <div className="card-hover col-span-5" style={styles.card}>
                        <h1 style={styles.title}>Bonjour {agent.nomComplet}</h1>
                        <p style={styles.subtitle}>
                            Ravi de vous revoir. Voici un récapitulatif de votre profil :
                        </p>

                        <div style={{ marginTop: 14 }}>
                            <div style={styles.fieldRow}>
                                <span style={styles.label}>Prénom & Nom :</span>
                                <span style={styles.value}>{agent.nomComplet}</span>
                            </div>
                            <div style={styles.fieldRow}>
                                <span style={styles.label}>Email :</span>
                                <span style={styles.value}>{agent.email}</span>
                            </div>
                            <div style={styles.fieldRow}>
                                <span style={styles.label}>Statut :</span>
                                <span style={styles.value}>Connecté ✅</span>
                            </div>
                        </div>
                    </div>

                    {/* Carte Tâches */}
                    <div className="card-hover col-span-7" style={styles.card}>
                        <h2 style={styles.sectionTitle}>🗂️ Vos tâches</h2>
                        <p
                            style={{
                                marginTop: -4,
                                marginBottom: 12,
                                color: 'rgba(255,255,255,0.8)',
                            }}
                        >
                            Gérez vos tâches quotidiennes depuis cet espace.
                        </p>
                        <div
                            style={{
                                background: 'rgba(0,0,0,0.25)',
                                borderRadius: 14,
                                padding: 12,
                                border: '1px solid rgba(255,255,255,0.12)',
                            }}
                        >
                            <AgentTasks />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DashboardAgent;

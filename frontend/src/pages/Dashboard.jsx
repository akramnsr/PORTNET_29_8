import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardSuperviseur() {
    const superviseur = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Bonjour {superviseur?.nom || "Superviseur"}</h2>
            <p>Bienvenue sur votre tableau de bord.</p>

            <Link to="/superviseur/ajouter-agent" style={{ display: 'block', marginBottom: '1rem' }}>
                ➕ Ajouter un agent
            </Link>

            <Link to="/agents" style={{ display: 'block', marginBottom: '1rem', color: '#0B3D91', fontWeight: 'bold' }}>
                👥 Voir la liste des agents
            </Link>

            <button
                onClick={handleLogout}
                style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                🔓 Se déconnecter
            </button>
        </div>
    );
}

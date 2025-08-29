import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DashboardImportateur() {
    const [importateur, setImportateur] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchImportateur = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8080/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setImportateur(response.data);
                setError(null);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'importateur :", error);
                setError("Erreur lors du chargement des données");

                // Si erreur d'authentification, rediriger vers login
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchImportateur();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleAddDemande = () => {
        navigate('/demandes/ajouter');
    };

    const handleViewDemandes = () => {
        navigate('/demandes');
    };

    const handleViewProfile = () => {
        navigate('/profil');
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Chargement des données...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Réessayer</button>
            </div>
        );
    }

    if (!importateur) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#0275d8', marginBottom: '10px' }}>
                    Bienvenue dans le dashboard importateur
                </h2>
                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <p><strong>Nom complet :</strong> {importateur.nomComplet}</p>
                    <p><strong>Email :</strong> {importateur.email}</p>
                    {importateur.societe && (
                        <p><strong>Société :</strong> {importateur.societe}</p>
                    )}
                    {importateur.ville && (
                        <p><strong>Ville :</strong> {importateur.ville}</p>
                    )}
                </div>
            </header>

            <main>
                <h3 style={{ marginBottom: '20px' }}>Actions disponibles</h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    <button
                        onClick={handleAddDemande}
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '15px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                    >
                        ➕ Nouvelle demande
                    </button>

                    <button
                        onClick={handleViewDemandes}
                        style={{
                            backgroundColor: '#0275d8',
                            color: 'white',
                            padding: '15px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#025aa5'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#0275d8'}
                    >
                        📋 Mes demandes
                    </button>

                    <button
                        onClick={handleViewProfile}
                        style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            padding: '15px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                    >
                        👤 Mon profil
                    </button>
                </div>

                <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
                        💡 Informations utiles
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
                        <li>Vous pouvez créer des demandes d'importation</li>
                        <li>Suivez le statut de vos demandes en temps réel</li>
                        <li>Téléchargez les documents nécessaires</li>
                        <li>Contactez le support en cas de besoin</li>
                    </ul>
                </div>
            </main>

            <footer style={{ textAlign: 'center', borderTop: '1px solid #dee2e6', paddingTop: '20px' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                    🚪 Se déconnecter
                </button>
            </footer>
        </div>
    );
}

export default DashboardImportateur;
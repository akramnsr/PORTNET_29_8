// src/pages/ActivateAccount.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ActivateAccount() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = searchParams.get("token");

        const activate = async () => {
            try {
                console.log("Activation opérateur avec token:", token);
                const response = await axios.get(`http://localhost:8080/api/auth/activation?token=${token}`);
                setMessage(response.data.message || "Votre compte opérateur a été activé avec succès !");
                setError(null);

                // Redirection automatique après 3 secondes
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } catch (err) {
                console.error("Erreur activation opérateur:", err);
                const msg = err.response?.data?.message || err.response?.data || "Erreur lors de l'activation du compte opérateur.";
                setError(msg);
                setMessage('');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            activate();
        } else {
            setError("Aucun token fourni.");
            setLoading(false);
        }
    }, [searchParams, navigate]);

    return (
        <div style={{
            maxWidth: 500,
            margin: 'auto',
            padding: 20,
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            marginTop: '10%'
        }}>
            <h2>Activation du compte opérateur</h2>

            {loading && (
                <div style={{ color: '#007bff', fontSize: '18px' }}>
                    ⏳ Activation en cours...
                </div>
            )}

            {!loading && message && (
                <div style={{
                    color: 'green',
                    fontSize: '16px',
                    backgroundColor: '#d4edda',
                    padding: '15px',
                    borderRadius: '5px',
                    border: '1px solid #c3e6cb'
                }}>
                    ✅ {message}
                    <br/>
                    <small style={{ color: '#666' }}>
                        Redirection vers la page de connexion dans 3 secondes...
                    </small>
                </div>
            )}

            {!loading && error && (
                <div style={{
                    color: 'red',
                    fontSize: '16px',
                    backgroundColor: '#f8d7da',
                    padding: '15px',
                    borderRadius: '5px',
                    border: '1px solid #f5c6cb'
                }}>
                    ❌ {error}
                </div>
            )}

            {!loading && (message || error) && (
                <div style={{ marginTop: '20px' }}>
                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Aller à la connexion
                    </button>
                </div>
            )}
        </div>
    );
}

export default ActivateAccount;
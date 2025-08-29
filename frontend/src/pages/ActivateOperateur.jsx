import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './InscriptionOperateur.css';
import './ActivateOperateur.css';  // styles spécifiques, en plus

export default function ActivateOperateur() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(360);

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatus('error');
            setMessage("Lien d'activation invalide. Aucun token fourni.");
            return;
        }
        axios.get(`http://localhost:8080/api/auth/activation?token=${token}`)
            .then(res => {
                setStatus('success');
                setMessage(res.data.message || "Votre compte a été activé avec succès !");
                startCountdown();
            })
            .catch(err => {
                const code = err.response?.status;
                const errMsg = err.response?.data?.message || '';
                if (code === 400 && /Token (invalide|non trouvé)/.test(errMsg)) {
                    setStatus('already_activated');
                    setMessage("Ce compte est peut‑être déjà activé. Redirection…");
                    startCountdown();
                } else if (code === 400 && /expiré/.test(errMsg)) {
                    setStatus('error');
                    setMessage("Le lien d'activation a expiré. Demandez un nouveau lien.");
                } else {
                    setStatus('error');
                    setMessage(errMsg || "Erreur lors de l'activation du compte.");
                }
            });
    }, [searchParams]);

    const startCountdown = () => {
        const timer = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) {
                    clearInterval(timer);
                    navigate("/login");
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
    };

    const goLogin = () => navigate("/login");
    const newLink = () => navigate("/forgot-password");

    // Helper pour afficher le contenu selon le status
    const renderSection = () => {
        const mm = `${Math.floor(countdown/60)}:${String(countdown%60).padStart(2,'0')}`;
        switch (status) {
            case 'loading':
                return (
                    <div className="status-section loading">
                        <div className="spinner"></div>
                        <h3>Activation en cours…</h3>
                        <p>Veuillez patienter pendant que nous activons votre compte.</p>
                    </div>
                );
            case 'success':
            case 'already_activated':
                return (
                    <div className={`status-section ${status}`}>
                        <div className="icon">
                            {status==='success' ? (
                                <svg className="success-icon" /*…*/>…</svg>
                            ) : (
                                <svg className="info-icon" /*…*/>…</svg>
                            )}
                        </div>
                        <h3>
                            {status==='success'
                                ? "Compte activé avec succès !"
                                : "Compte déjà activé"}
                        </h3>
                        <p>{message}</p>
                        <div className="countdown">
                            Redirection dans <span className="countdown-number">{mm}</span>
                        </div>
                        <button
                            onClick={goLogin}
                            className="submit-button"
                        >
                            Se connecter maintenant
                        </button>
                    </div>
                );
            case 'error':
                return (
                    <div className="status-section error">
                        <div className="icon error-icon">…</div>
                        <h3>Erreur d'activation</h3>
                        <p>{message}</p>
                        <div className="button-group">
                            <button className="submit-button" onClick={goLogin}>
                                Aller à la connexion
                            </button>
                            <button className="submit-button" onClick={newLink}>
                                Demander nouveau lien
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="registration-container">
            <div className="overlay" />

            <div className="registration-card">
                <div className="card-logo-wrapper">
                    <img src="/src/assets/images/PORTNET_LOGO.png" alt="PortNet Logo" />
                </div>
                <h2 className="card-title">Activation du compte</h2>
                <p className="card-subtitle">
                    {'IMPORTATEUR – EXPORTATEUR'}<br/>
                    الشباك الموحد الوطني لمساطر التجارة الخارجية
                </p>

                <div className="activation-content">
                    {renderSection()}
                </div>

                <div className="registration-footer">
                    <p>Besoin d’aide ? <a href="/support">Contactez le support</a></p>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import './ActivateAccount.css';

export default function ActivateAccount() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    useEffect(() => {
        console.log("Token d'activation reçu:", token);
        if (!token) {
            setMessage("Token d'activation manquant dans l'URL.");
        }
    }, [token]);

    const handleActivate = async (e) => {
        e.preventDefault();

        if (!token) {
            setMessage("Token d'activation invalide.");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 6) {
            setMessage("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            console.log("Envoi de la requête d'activation avec token:", token);

            const response = await axios.post("http://localhost:8080/api/agents/activation", {
                token: token,
                password: password,
            });

            console.log("Réponse reçue:", response.data);
            setMessage("Compte activé avec succès ! Vous pouvez maintenant vous connecter.");
            setIsSuccess(true);

            // Redirection vers la page de login après 3 secondes
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (error) {
            console.error("Erreur lors de l'activation:", error);

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);

                if (error.response.status === 400) {
                    setMessage("Token invalide ou expiré. Veuillez demander un nouveau lien d'activation.");
                } else if (error.response.status === 500) {
                    setMessage("Erreur serveur. Veuillez réessayer plus tard.");
                } else {
                    setMessage(error.response.data || "Erreur lors de l'activation.");
                }
            } else if (error.request) {
                setMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
            } else {
                setMessage("Une erreur inattendue s'est produite.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="activation-container">
                {/* Navigation Header - Side Card */}


                {/* Error Card */}
                <div className="activation-card">
                    <div className="error-section">
                        <div className="error-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <h2>Activation du compte Agent</h2>
                        <p className="error-message">Token d'activation manquant ou invalide.</p>
                        <button onClick={() => navigate("/login")} className="btn btn-primary">
                            Retour à la connexion
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="activation-footer">
                    <p>Besoin d'aide ? <a href="/support">Contactez le support</a></p>
                </div>
            </div>
        );
    }

    return (
        <div className="activation-container">



            <div className="activation-card">
                <div className="activation-header">
                    <div className="header-icon">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="16" r="1" fill="currentColor"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                    <h2>Activation du compte Agent</h2>
                    <p>Définissez votre mot de passe pour finaliser l'activation de votre compte et accéder aux services PortNet en tant qu'agent certifié.</p>
                </div>

                <form onSubmit={handleActivate} className="activation-form">
                    <div className="form-group">
                        <label className="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            placeholder="Entrez votre mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="form-input"
                        />
                        <small className="form-hint">Minimum 6 caractères requis</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Confirmation du mot de passe
                        </label>
                        <input
                            type="password"
                            placeholder="Confirmez votre mot de passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Activation en cours...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Activer mon compte
                            </>
                        )}
                    </button>
                </form>

                {message && (
                    <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                {isSuccess && (
                    <div className="redirect-info">
                        <div className="countdown-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <p>Redirection vers la page de connexion dans 3 secondes...</p>
                    </div>
                )}

                <div className="token-info">
                    <small>Token: {token.substring(0, 8)}...</small>
                </div>
            </div>

            {/* Footer */}
            <div className="activation-footer">
                <p>Besoin d'aide ? <a href="/support">Contactez le support</a></p>
            </div>
        </div>
    );
}
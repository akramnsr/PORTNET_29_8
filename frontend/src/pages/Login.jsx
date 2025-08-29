// src/pages/Login.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logoPortnet from '../assets/images/PORTNET_LOGO.png';
import { parseJwt } from '../api/auth';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '', visible: false });

    const showAlert = (type, message) => {
        setAlert({ type, message, visible: true });
        setTimeout(() => setAlert({ type, message, visible: false }), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            let data = {};
            try { data = await resp.json(); } catch {}

            if (!resp.ok) {
                const msg = data?.message || 'Identifiants invalides';
                showAlert('error', msg);
                return;
            }

            const token = data?.token || data?.jwt || data?.access_token;
            let role  = String(data?.role || '').toUpperCase();

            if (!token) {
                showAlert('error', "Réponse inattendue du serveur (token manquant).");
                return;
            }

            // ✅ stocker token + rôle (rôle déduit si manquant)
            localStorage.setItem('token', token);

            if (!role) {
                const payload = parseJwt(token);
                const raw = payload?.roles || payload?.authorities || payload?.scope || payload?.scopes || [];
                const arr = Array.isArray(raw) ? raw.map(String) :
                    typeof raw === 'string' ? raw.split(/[,\s]+/) : [];
                const norm = arr.map(r => r.toUpperCase().replace(/^ROLE_/, ''));
                if (norm.includes('SUPERVISEUR')) role = 'SUPERVISEUR';
                else if (norm.includes('AGENT')) role = 'AGENT';
                else if (norm.includes('IMPORTATEUR')) role = 'IMPORTATEUR';
                else if (norm.includes('OPERATEUR')) role = 'OPERATEUR';
            }
            if (role) localStorage.setItem('role', role);

            showAlert('success', 'Connexion réussie ! Redirection en cours...');

            // ➜ Redirections par rôle
            switch (role) {
                case 'SUPERVISEUR':
                    navigate('/pbi/agents-details', { replace: true });
                    break;
                case 'AGENT':
                    navigate('/dashboard-agent', { replace: true });
                    break;
                case 'IMPORTATEUR':
                case 'OPERATEUR':
                    navigate('/dashboard-operateur', { replace: true });
                    break;
                default:
                    // aucun rôle dans le token → on renvoie sur /dashboard-agent par défaut
                    navigate('/dashboard-agent', { replace: true });
            }
        } catch {
            showAlert('error', 'Erreur de connexion. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        videoWrapper: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: -1 },
        videoBackground: { width: '100%', height: '100%', objectFit: 'cover' },
        container: { position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', background: 'transparent' },
        card: { maxWidth: '450px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)' },
        logoSection: { textAlign: 'center', marginBottom: '30px' },
        logoContainer: { marginBottom: '20px' },
        logo: { height: '100px', width: 'auto', maxWidth: '100%', objectFit: 'contain' },
        logoFallback: { display: 'none' },
        title: { fontSize: '28px', fontWeight: 'bold', color: '#1e3a8a', margin: '15px 0 10px' },
        subtitle: { color: '#64748b', fontSize: '14px', marginBottom: '8px', fontWeight: '500' },
        subtitleEn: { color: '#64748b', fontSize: '12px' },
        formGroup: { marginBottom: '20px' },
        label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
        inputContainer: { position: 'relative' },
        inputIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' },
        input: { width: '100%', padding: '12px 15px 12px 45px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease', backgroundColor: '#ffffff', boxSizing: 'border-box' },
        passwordInput: { width: '100%', padding: '12px 45px 12px 45px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease', backgroundColor: '#ffffff', boxSizing: 'border-box' },
        passwordToggle: { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '5px' },
        submitButton: { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', marginTop: '10px', marginBottom: '20px' },
        submitButtonDisabled: { opacity: 0.7, cursor: 'not-allowed' },
        spinner: { display: 'inline-block', width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px' },
        forgotPassword: { textAlign: 'center', marginBottom: '20px' },
        forgotPasswordLink: { color: '#1e3a8a', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginLeft: 12 },
        footer: { textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' },
        alert: { position: 'fixed', top: '20px', right: '20px', maxWidth: '400px', width: '90%', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000 },
        alertSuccess: { borderLeft: '4px solid #10b981' },
        alertError: { borderLeft: '4px solid #ef4444' },
        alertText: { fontSize: '14px', fontWeight: '500', margin: 0 },
        alertTextSuccess: { color: '#065f46' },
        alertTextError: { color: '#991b1b' }
    };

    const AlertBox = ({ type, message, visible }) => {
        if (!visible) return null;
        const base = styles.alert;
        const alertStyle = type === 'success'
            ? { ...base, ...styles.alertSuccess }
            : { ...base, ...styles.alertError };
        const textStyle = type === 'success'
            ? { ...styles.alertText, ...styles.alertTextSuccess }
            : { ...styles.alertText, ...styles.alertTextError };

        return (
            <div style={alertStyle}>
                {type === 'success' ? <CheckCircle size={20} color="#10b981" /> : <AlertCircle size={20} color="#ef4444" />}
                <p style={textStyle}>{message}</p>
            </div>
        );
    };

    return (
        <>
            {/* Fond vidéo (mettez le fichier dans public/video/) */}
            <div style={styles.videoWrapper}>
                <video autoPlay muted loop style={styles.videoBackground}>
                    <source src="/video/background_video.mp4" type="video/mp4" />
                    Votre navigateur ne supporte pas la vidéo.
                </video>
            </div>

            {/* Styles globaux */}
            <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input:focus { border-color: #1e3a8a !important; box-shadow: 0 0 0 3px rgba(30,58,138,0.1) !important; }
        button:hover:not(:disabled) { background: linear-gradient(135deg,#047857,#059669) !important; transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(16,185,129,0.3) !important; }
        a:hover { color: #1e40af !important; }
        body, html { margin: 0; padding: 0; height: 100%; }
        input::placeholder { color: #9ca3af; }
      `}</style>

            {/* Formulaire */}
            <div style={styles.container}>
                <AlertBox {...alert} />

                <div style={styles.card}>
                    {/* Logo */}
                    <div style={styles.logoSection}>
                        <div style={styles.logoContainer}>
                            <img
                                src={logoPortnet}
                                alt="PORTNET Logo"
                                style={styles.logo}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fb = e.currentTarget.nextSibling;
                                    if (fb) fb.style.display = 'block';
                                }}
                            />
                            <div style={{ ...styles.logoFallback, textAlign: 'center' }}>
                                <h1 style={styles.title}>PORTNET</h1>
                            </div>
                        </div>
                        <p style={styles.subtitle}>الشباك الموحد الوطني لمساطر التجارة الخارجية</p>
                        <p style={styles.subtitleEn}>GUICHET UNIQUE NATIONAL DES PROCÉDURES DU COMMERCE EXTÉRIEUR</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        {/* Email */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Adresse email</label>
                            <div style={styles.inputContainer}>
                                <div style={styles.inputIcon}><Mail size={20} /></div>
                                <input
                                    type="email"
                                    required
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mot de passe</label>
                            <div style={styles.inputContainer}>
                                <div style={styles.inputIcon}><Lock size={20} /></div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={styles.passwordInput}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.passwordToggle}
                                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Bouton */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ ...styles.submitButton, ...(loading ? styles.submitButtonDisabled : {}) }}
                        >
                            {loading ? (<><span style={styles.spinner}></span>Connexion en cours...</>) : 'Se connecter'}
                        </button>
                    </form>

                    {/* Liens */}
                    <div style={styles.forgotPassword}>
                        <a href="#" style={styles.forgotPasswordLink}>Mot de passe oublié ?</a>
                        <Link to="/inscription-operateur" style={styles.forgotPasswordLink}>Inscription Opérateur</Link>
                    </div>

                    {/* Footer */}
                    <div style={styles.footer}>© 2025 PORTNET. Tous droits réservés.</div>
                </div>
            </div>
        </>
    );
};

export default Login;

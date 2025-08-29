import React, { useState } from 'react';
import axios from 'axios';
import './InscriptionOperateur.css';

const InscriptionOperateur = () => {
    const [formData, setFormData] = useState({
        nomComplet: '',
        email: '',
        password: '',
        societe: '',
        telephone: '',
        adresse: '',
        ville: '',
        pays: '',
        rc: '',
        ice: '',
        ifiscale: '',
        emailProfessionnel: '',
        domaineActivite: '',
        typeOperation: '',
        certifieISO: false,
        statutDouanier: ''
    });

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post('http://localhost:8080/api/importateur/register', formData);
            setMessage("Opérateur enregistré avec succès. Vérifiez votre email pour activer votre compte.");
        } catch (error) {
            console.error(error);
            setMessage("Erreur lors de l'inscription. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <div className="overlay"/>

            <div className="registration-card">

                <div className="card-logo-wrapper">
                    <img
                        src="/unnamed.png"
                        alt="PortNet Logo"
                    />
                </div>
                <h2 className="card-title">Rejoignez PortNet</h2>
                <p className="card-subtitle">
                    Simplifiez vos opérations d'import‐export en quelques clics
                </p>


                <form onSubmit={handleSubmit} className="registration-form">

                    {/* on place d’abord la grille */}
                    <div className="mega-form-grid">
                        {[
                            { name: "nomComplet",        label: "Nom complet",          type: "text",     required: true, placeholder: "Votre nom complet" },
                            { name: "email",             label: "Email",                type: "email",    required: true, placeholder: "votre@email.com" },
                            { name: "password",          label: "Mot de passe",         type: "password", required: true, placeholder: "Mot de passe sécurisé" },
                            { name: "societe",           label: "Société",              type: "text",                  placeholder: "Nom de votre société" },
                            { name: "telephone",         label: "Téléphone",            type: "tel",                   placeholder: "+212 6XX XXX XXX" },
                            { name: "adresse",           label: "Adresse",              type: "text",                  placeholder: "Adresse complète" },
                            { name: "ville",             label: "Ville",                type: "text",                  placeholder: "Casablanca, Rabat..." },
                            { name: "pays",              label: "Pays",                 type: "text",                  placeholder: "Maroc" },
                            { name: "rc",                label: "RC",                   type: "text",                  placeholder: "Numéro RC" },
                            { name: "ice",               label: "ICE",                  type: "text",                  placeholder: "Identifiant Commun Entreprise" },
                            { name: "ifiscale",          label: "IF",                   type: "text",                  placeholder: "Numéro IF" },
                            { name: "emailProfessionnel",label: "Email pro",            type: "email",                 placeholder: "contact@societe.com" },
                            { name: "domaineActivite",   label: "Domaine",              type: "text",                  placeholder: "Import/Export, Textile..." },
                            { name: "typeOperation",     label: "Opération",            type: "text",                  placeholder: "Import, Export, Transit..." },
                            { name: "statutDouanier",    label: "Statut douanier",      type: "text",                  placeholder: "Statut douanier" },
                        ].map(({ name, label, type, required, placeholder }) => (
                            <div className="form-group" key={name}>
                                <label className="form-label">
                                    {label}{required && <span className="required">*</span>}
                                </label>
                                <input
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                    type={type}
                                    required={required}
                                    className="form-input"
                                    placeholder={placeholder}
                                />
                            </div>
                        ))}
                    </div> {/* fin de mega-form-grid */}

                    <button
                        type="submit"
                        className={`submit-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? <><span className="spinner"></span> Inscription en cours...</>
                            : 'S’inscrire comme Opérateur'}
                    </button>
                </form>


                {message && (
                    <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="registration-footer">
                    <p>Déjà inscrit ? <a href="/login">Se connecter</a></p>
                    <p>Besoin d’aide ? <a href="/support">Contactez le support</a></p>
                </div>
            </div>
        </div>
    );
};

export default InscriptionOperateur;

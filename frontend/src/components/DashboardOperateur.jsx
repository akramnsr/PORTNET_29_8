import React, { useState, useEffect } from 'react';
import DemandeForm from '../components/DemandeForm';
import UploadDocument from '../components/UploadDocument';
import DocumentList from '../components/DocumentList';
import api from '../api/axiosConfig';

function DashboardOperateur() {
    const [showDemandeForm, setShowDemandeForm] = useState(false);
    const [demandes, setDemandes] = useState([]);
    const [selectedDemande, setSelectedDemande] = useState(null);


    useEffect(() => {
        fetchDemandes();
    }, []);

    const fetchDemandes = async () => {
        try {
            const res = await api.get('/demandes/operateur');
            setDemandes(res.data);
        } catch (error) {
            console.error('Erreur chargement demandes:', error);
        }
    };

    const handleDemandeCreated = (newDemande) => {
        setShowDemandeForm(false);
        setDemandes((prev) => [...prev, newDemande]);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Bienvenue dans le dashboard opérateur</h2>

            <button
                onClick={() => setShowDemandeForm(!showDemandeForm)}
                style={{ margin: '10px 0', padding: '10px 20px' }}
            >
                {showDemandeForm ? 'Annuler' : 'Ajouter une Demande'}
            </button>

            {showDemandeForm && <DemandeForm onDemandeCreated={handleDemandeCreated} />}

            <h3>Mes Demandes</h3>
            <ul>
                {demandes.map((demande) => (
                    <li
                        key={demande.id}
                        style={{
                            cursor: 'pointer',
                            backgroundColor: selectedDemande?.id === demande.id ? '#ddd' : 'transparent',
                            padding: '5px',
                            borderRadius: '5px'
                        }}
                        onClick={() => setSelectedDemande(demande)}
                    >
                        {demande.numeroEnregistrement} - {demande.categorie}
                    </li>
                ))}
            </ul>

            {selectedDemande && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Gestion des documents pour la demande : {selectedDemande.numeroEnregistrement}</h3>
                    <UploadDocument demandeId={selectedDemande.id} />
                    <DocumentList demandeId={selectedDemande.id} />
                </div>
            )}
        </div>
    );
}

export default DashboardOperateur;

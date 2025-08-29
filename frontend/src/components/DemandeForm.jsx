import React, { useState, useEffect } from "react";
import axios from "axios";

function DemandeForm() {

    const [categories, setCategories] = useState(["IMPORTATION", "EXPORTATION"]); // enum fixe
    const [bureaux, setBureaux] = useState([]);
    const [devises, setDevises] = useState([]);
    const [paysList, setPaysList] = useState([]);


    const [categorie, setCategorie] = useState("");
    const [bureauDouanierId, setBureauDouanierId] = useState("");
    const [deviseId, setDeviseId] = useState("");


    const [marchandise, setMarchandise] = useState({
        designation: "",
        quantite: "",
        montant: "",
        codeSh: "",
        paysId: "",
    });


    const [documents, setDocuments] = useState([]);


    const [message, setMessage] = useState("");


    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                const [resBureaux, resDevises, resPays] = await Promise.all([
                    axios.get("http://localhost:8080/api/bureaux"),
                    axios.get("http://localhost:8080/api/devises"),
                    axios.get("http://localhost:8080/api/pays"),
                ]);
                setBureaux(resBureaux.data);
                setDevises(resDevises.data);
                setPaysList(resPays.data);
            } catch (error) {
                console.error("Erreur récupération données de référence :", error);
            }
        };
        fetchReferenceData();
    }, []);


    function handleMarchandiseChange(e) {
        const { name, value } = e.target;
        setMarchandise(prev => ({
            ...prev,
            [name]: value,
        }));
    }


    function handleFileChange(e) {
        setDocuments(e.target.files);
    }


    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");

        if (!categorie) {
            setMessage("Veuillez choisir une catégorie.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("categorie", categorie);
            formData.append("bureauDouanierId", bureauDouanierId);
            formData.append("deviseId", deviseId);


            formData.append("marchandise", JSON.stringify(marchandise));

            for (let i = 0; i < documents.length; i++) {
                formData.append("documents", documents[i]);
            }


            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:8080/api/demandes",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("Demande créée avec succès !");

            setCategorie("");
            setBureauDouanierId("");
            setDeviseId("");
            setMarchandise({
                designation: "",
                quantite: "",
                montant: "",
                codeSh: "",
                paysId: "",
            });
            setDocuments([]);
        } catch (error) {
            console.error(error);
            setMessage(
                error.response?.data || "Erreur lors de la création de la demande"
            );
        }
    }

    return (
        <div style={{ maxWidth: 600, margin: "auto" }}>
            <h2>Créer une nouvelle demande</h2>

            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>

                <label>Catégorie *</label>
                <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    required
                >
                    <option value="">-- Sélectionner --</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <label>Bureau Douanier</label>
                <select
                    value={bureauDouanierId}
                    onChange={(e) => setBureauDouanierId(e.target.value)}
                >
                    <option value="">-- Sélectionner --</option>
                    {bureaux.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.nom}
                        </option>
                    ))}
                </select>

                <label>Devise</label>
                <select
                    value={deviseId}
                    onChange={(e) => setDeviseId(e.target.value)}
                >
                    <option value="">-- Sélectionner --</option>
                    {devises.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.nom} ({d.symbole})
                        </option>
                    ))}
                </select>

                <h3>Marchandise</h3>

                <label>Désignation</label>
                <input
                    type="text"
                    name="designation"
                    value={marchandise.designation}
                    onChange={handleMarchandiseChange}
                    required
                />

                <label>Quantité</label>
                <input
                    type="number"
                    name="quantite"
                    value={marchandise.quantite}
                    onChange={handleMarchandiseChange}
                    step="any"
                    min="0"
                    required
                />

                <label>Montant</label>
                <input
                    type="number"
                    name="montant"
                    value={marchandise.montant}
                    onChange={handleMarchandiseChange}
                    step="any"
                    min="0"
                    required
                />

                <label>Code SH</label>
                <input
                    type="text"
                    name="codeSh"
                    value={marchandise.codeSh}
                    onChange={handleMarchandiseChange}
                />

                <label>Pays</label>
                <select
                    name="paysId"
                    value={marchandise.paysId}
                    onChange={handleMarchandiseChange}
                >
                    <option value="">-- Sélectionner --</option>
                    {paysList.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.nom}
                        </option>
                    ))}
                </select>

                <h3>Documents (plusieurs fichiers possibles)</h3>
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.png,.doc,.docx"
                />

                <br />
                <button type="submit" style={{ marginTop: 20 }}>
                    Envoyer la demande
                </button>
            </form>
        </div>
    );
}

export default DemandeForm;

import React, { useState } from "react";
import api from "../api/axiosConfig";

const UploadDocument = ({ demandeId }) => {
    const [file, setFile] = useState(null);

    const handleUpload = async () => {
        if (!file) {
            alert("Choisir un fichier !");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post(`/documents/upload/${demandeId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Fichier uploadé !");
        } catch (error) {
            console.error("Erreur d'upload :", error);
            alert("Erreur !");
        }
    };

    return (
        <div>
            <h3>Upload Document</h3>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload}>Uploader</button>
        </div>
    );
};

export default UploadDocument;

import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

const DocumentList = ({ demandeId }) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (demandeId) {
      api.get(`/documents/demande/${demandeId}`)
        .then((res) => setDocuments(res.data))
        .catch((err) => console.error("Erreur documents:", err));
    }
  }, [demandeId]);

  return (
    <div>
      <h3>Documents de la demande</h3>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            {doc.nom} ({doc.type})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;

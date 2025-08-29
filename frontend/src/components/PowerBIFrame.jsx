import React from "react";

export default function PowerBIFrame({ src, title = "Power BI" }) {
    if (!src) {
        return (
            <div style={{ padding: 16, color: "#b91c1c" }}>
                URL Power BI manquante. Définis <code>REACT_APP_PBI_AGENTS_URL</code> dans <code>.env</code>.
            </div>
        );
    }

    // Le parent (DrawerMIC → <Box component="main" .../>) fixe la hauteur.
    return (
        <div style={{ height: "100%", width: "100%" }}>
            <iframe
                title={title}
                src={src}
                style={{ border: 0, width: "100%", height: "100%" }}
                allowFullScreen
            />
        </div>
    );
}

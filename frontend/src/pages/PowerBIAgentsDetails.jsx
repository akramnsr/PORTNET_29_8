import React, { useMemo, useState } from 'react';

export default function PowerBIAgentsDetails() {
    const rawBase = process.env.REACT_APP_PBI_AGENTS_URL || '';
    const base = useMemo(() => rawBase.split('&pageName=')[0], [rawBase]);

    const pages = [
        process.env.REACT_APP_PBI_PAGE1,
        process.env.REACT_APP_PBI_PAGE2,
    ].filter(Boolean);

    const [idx, setIdx] = useState(0);
    const src = `${base}${base.includes('?') ? '&' : '?'}pageName=${encodeURIComponent(pages[idx] || '')}`;

    return (
        <div>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                <button onClick={() => setIdx(i => (i + pages.length - 1) % pages.length)}>Précédente</button>
                <button onClick={() => setIdx(i => (i + 1) % pages.length)}>Suivante</button>
                <strong style={{ marginLeft:12 }}>Page {idx + 1} / {pages.length}</strong>
            </div>
            <iframe key={src} title="AgentsDetails" width="100%" height="700" src={src} frameBorder="0" allowFullScreen />
        </div>
    );
}

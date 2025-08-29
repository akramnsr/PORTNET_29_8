import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

const btnStyle = {
    padding: '10px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
};

const boxStyle = {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
};
const okStyle    = { ...boxStyle, background:'rgba(0,0,0,0.3)',      color:'white',   border:'1px solid rgba(255,255,255,0.2)' };
const errorStyle = { ...boxStyle, background:'rgba(127,29,29,0.15)', color:'#7f1d1d', border:'1px solid rgba(127,29,29,0.25)' };

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default function DispatchButton({ limit = 10 }) {
    const [loading, setLoading] = useState(false);
    const [result,  setResult]  = useState(null);
    const [error,   setError]   = useState(null);

    const trigger = async () => {
        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await axios.post(`${API}/api/dispatch/run?limit=${limit}`, null, { headers });
            setResult(res.data);
        } catch (e) {
            setError(e.response?.data || { error: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={trigger} disabled={loading} style={btnStyle}>
                {loading ? 'Dispatch en cours…' : `Dispatcher (${limit})`}
            </button>

            {result && <pre style={okStyle}>{JSON.stringify(result, null, 2)}</pre>}
            {error  && <pre style={errorStyle}>{JSON.stringify(error,  null, 2)}</pre>}
        </div>
    );
}

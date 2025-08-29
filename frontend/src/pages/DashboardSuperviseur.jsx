import React, { useMemo } from 'react';
import DispatchButton from '../components/DispatchButton';
import { getRoles } from '../utils/auth';

export default function DashboardSuperviseur() {
    const roles = useMemo(() => getRoles(), []);
    const isSuperviseur = roles.includes('ROLE_SUPERVISEUR');

    return (
        <div style={{ padding: 20 }}>
            <h1>Dashboard Superviseur</h1>
            <p>Déclenchement manuel du dispatcher :</p>

            {isSuperviseur ? (
                <DispatchButton limit={10} />
            ) : (
                <div
                    style={{
                        marginTop: 8,
                        padding: 12,
                        borderRadius: 10,
                        background: 'rgba(127,29,29,0.15)',
                        color: '#7f1d1d',
                        border: '1px solid rgba(127,29,29,0.25)',
                        maxWidth: 640,
                    }}
                >
                    Vous n’avez pas l’autorisation <code>ROLE_SUPERVISEUR</code>. Connectez-vous avec un compte superviseur.
                </div>
            )}
        </div>
    );
}

import React from 'react';
import { Box, Paper } from '@mui/material';
import AgentTasks from '../components/AgentTasks';
import AgentHero from '../components/AgentHero';

export default function AgentTasksPage() {
    return (
        <Box sx={{ p: 0 }}>
            <AgentHero
                title="Mes tâches"
                subtitle="Vos tâches assignées — suivez l’avancement en temps réel."
                onRefresh={() => window.location.reload()}
            />

            <Box sx={{ px: 2 }}>
                <Paper elevation={0} sx={{ mt: 2, border: '1px solid #E6ECF6' }}>
                    <AgentTasks />
                </Paper>
            </Box>
        </Box>
    );
}

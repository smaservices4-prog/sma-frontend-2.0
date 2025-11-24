'use client';

import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface PasswordRequirementsProps {
    password: string;
}

const getPasswordRequirements = (password: string) => ({
    length: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasDigit: /\d/.test(password)
});

const getColor = (valid: boolean) => valid ? '#2e7d32' : '#c62828'; // verde y rojo accesibles
const getIcon = (valid: boolean) => valid ? <CheckCircleIcon sx={{ color: getColor(true), fontSize: '16px', flexShrink: 0 }} /> : <CancelIcon sx={{ color: getColor(false), fontSize: '16px', flexShrink: 0 }} />;

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
    const reqs = getPasswordRequirements(password);
    if (!password) return null;
    const allValid = reqs.length && reqs.hasLetter && reqs.hasDigit;
    return (
        <Box sx={{
            border: `1px solid ${allValid ? '#2e7d32' : '#f44336'}`,
            backgroundColor: '#fffdfb',
            borderRadius: '8px',
            px: 2, py: 1.5,
            mt: 1,
            mb: 1,
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box'
        }}>
            <Typography variant="body2" sx={{ color: '#8B6F47', mb: 1, fontSize: '13.5px' }}>
                Requisitos de la contraseña:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.5, maxWidth: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                    {getIcon(reqs.length)}
                    <Typography variant="body2" sx={{ color: getColor(reqs.length), fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Al menos 8 caracteres
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                    {getIcon(reqs.hasLetter)}
                    <Typography variant="body2" sx={{ color: getColor(reqs.hasLetter), fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Al menos una letra
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                    {getIcon(reqs.hasDigit)}
                    <Typography variant="body2" sx={{ color: getColor(reqs.hasDigit), fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Al menos un número
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default PasswordRequirements;

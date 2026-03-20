import api from './axios';

export const getBackupConfig = () => api.get('/records/backup-config/');
export const updateBackupConfig = (data) => api.put('/records/backup-config/', data);
export const triggerManualBackup = () => api.post('/records/backup-manual/');

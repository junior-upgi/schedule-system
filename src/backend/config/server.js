import { getUserID } from '../utility/telegram.js';

// app backend server configuration
export const development = true;

const host = 'http://localhost';
export const port = process.env.PORT || 9007;
export const serverUrl = `${host}:${port}`;

export const systemReference = 'scheduleSystem';
export const administrator = getUserID('蔡佳佑');

export function passphrase() {
    return 'this is not a passphrase';
}

export const enforceTokenValidation = false;

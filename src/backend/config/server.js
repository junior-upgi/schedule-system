import { getUserID } from '../utilities/telegram.js';

// app backend server configuration
export const env = process.env.NODE_ENV || 'development';
export const development = env === 'development' ? true : false;

const host = 'http://localhost';
export const port = process.env.PORT || 9007;
export const serverUrl = `${host}:${port}`;

export const systemReference = 'scheduleSystem';
export const appTitle = '排程進度管理系統';
export const administrator = getUserID('蔡佳佑');

export function passphrase() {
    return 'this is not a passphrase';
}

export const ddnsHost = 'upgi.ddns.net';

export const enforceTokenValidation = false;

export const timezone = 'Asia/Taipei';

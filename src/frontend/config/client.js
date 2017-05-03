export const systemReference = 'scheduleSystem';
export const appTitle = '排程進度管理系統';
const development = true;
const serverPort = 9007;

function serverHost() {
    return (development === true) ? 'http://localhost' : 'http://upgi.ddns.net';
}

function constructServerUrl() {
    return `${serverHost()}:${serverPort}/${systemReference}`;
}

export const serverUrl = constructServerUrl();

import { decode } from 'jsonwebtoken';
import moment from 'moment-timezone';
import { currentDateTime } from '../utility/timeUtility.js';

function emptyStore(state) {
    // application state
    state.activeView = 'login';
    // access control
    state.accessExp = currentDateTime().format('HH:mm');
    state.loginId = null;
    state.role = null;
    state.token = null;
    // working data
    state.userData = {};
    state.jobType = null;
    state.productType = null;
    state.processType = null;
    state.procState = null;
    state.stage = null;
}

export default {
    buildStore: buildStore,
    forceViewChange: function(state, view) { state.activeView = view; },
    redirectUser: function(state) { state.activeView = state.role; },
    resetStore: resetStore,
    restoreToken: restoreToken
};

function buildStore(state, responseList) {
    let dataObject = {};
    responseList.forEach((response) => {
        Object.assign(dataObject, response.data);
    });
    for (let objectIndex in dataObject) {
        state[objectIndex] = null;
        state[objectIndex] = dataObject[objectIndex];
    }
}

function resetStore(state) {
    sessionStorage.clear();
    emptyStore(state);
}

function restoreToken(state, token) {
    state.accessExp = moment.unix(decode(token).exp).format('HH:mm');
    state.loginId = decode(token, { complete: true }).payload.loginId;
    state.role = decode(token, { complete: true }).payload.role;
    state.token = token;
    state.userData = decode(token, { complete: true }).payload;
    state.activeView = state.role;
}

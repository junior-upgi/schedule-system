import { decode } from 'jsonwebtoken';
import moment from 'moment-timezone';
import { currentDateTime } from '../utility/timeUtility.js';

function emptyStore(state) {
    // application state
    state.activeView = 'login';
    state.processingData = false;
    // access control
    state.accessExp = currentDateTime().format('HH:mm');
    state.loginId = null;
    state.role = null;
    state.token = null;
    // working data
    state.userDatas = {};
    state.jobTypes = null;
    state.phases = null;
    state.processStates = null;
    state.processTemplates = null;
    state.processTypes = null;
    state.productTypes = null;
}

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

export default {
    buildStore: buildStore,
    forceViewChange: function (state, view) { state.activeView = view; },
    processingDataSwitch: function (state, onOffSwitch) { state.processingData = onOffSwitch; },
    redirectUser: function (state) { state.activeView = state.role; },
    resetStore: resetStore,
    restoreToken: restoreToken,
    // templateManger
    mutation_insert_processTemplates: function (state, recordObject) { state.processTemplates.push(recordObject); },
    mutation_refresh_processTemplates: function (state, resultset) {
        state.processTemplates = null;
        state.processTemplates = resultset.data;
    },
    mutation_remove_processTemplates: function (state, id) {
        let temp = state.processTemplates.filter((processTemplate) => {
            return processTemplate.id !== id;
        });
        state.processTemplates = null;
        state.processTemplates = temp.slice(0);
    },
    mutation_update_processTemplates: function (state, recordObject) {
        state.processTemplates.forEach((processTemplate) => {
            if (processTemplate.id === recordObject.id) {
                for (let property in recordObject) {
                    if (property !== 'id') {
                        processTemplate[property] = recordObject[property];
                    }
                }
            }
        });
    }
};

import axios from 'axios';

import { serverUrl } from '../config/client.js';

const processTemplateFunction = {
    getRecord: function (context, payload) {
        return axios({
            method: 'get',
            url: `${serverUrl}/data/processTemplates/id/${payload.id}`,
            headers: { 'x-access-token': sessionStorage.token }
        });
    },
    update: function (context, payload) {
        return axios({
            method: 'patch',
            url: `${serverUrl}/data/processTemplates/id/${payload.id}`,
            data: { reference: payload.reference },
            headers: { 'x-access-token': sessionStorage.token }
        }).then(() => {
            let recordObject = {
                id: payload.id,
                reference: payload.reference
            };
            context.commit('mutation_update_processTemplates', recordObject);
        });
    },
    deactivate: function (context, payload) {
        return axios({
            method: 'delete',
            url: `${serverUrl}/data/processTemplates/id/${payload.id}`,
            headers: { 'x-access-token': sessionStorage.token }
        }).then((resultset) => {
            context.commit('mutation_refresh_processTemplates', resultset);
        });
    },
    reorder: function (context, payload) {
        return axios({
            method: 'post',
            url: `${serverUrl}/data/processTemplates/id/${payload.id}/displaySequence/${payload.displaySequence}`,
            headers: { 'x-access-token': sessionStorage.token }
        });
    },
    getActive: function (context) {
        return axios({
            method: 'get',
            url: `${serverUrl}/data/processTemplates`,
            headers: { 'x-access-token': sessionStorage.token }
        });
    },
    insert: function (context, payload) {
        return axios({
            method: 'post',
            url: `${serverUrl}/data/processTemplates`,
            data: { reference: payload.reference },
            headers: { 'x-access-token': sessionStorage.token }
        }).then((resultset) => {
            context.commit('mutation_insert_processTemplates', resultset.data);
        });
    },
    getInactive: function (context) {
        return axios({
            method: 'get',
            url: `${serverUrl}/data/processTemplates/inactive`,
            headers: { 'x-access-token': sessionStorage.token }
        });
    },
    activate: function (context, payload) {
        return axios({
            method: 'patch',
            url: `${serverUrl}/data/processTemplates/inactive/id/${payload.id}`,
            headers: { 'x-access-token': sessionStorage.token }
        }).then((resultset) => {
            context.commit('mutation_update_processTemplates', resultset.data);
        });
    },
    deprecate: function (context, payload) {
        return axios({
            method: 'delete',
            url: `${serverUrl}/data/processTemplates/inactive/id/${payload.id}`,
            headers: { 'x-access-token': sessionStorage.token }
        }).then(() => {
            context.commit('mutation_remove_processTemplates', payload.id);
        });
    },
    getDeprecated: function (context, payload) {
        return axios({
            method: 'get',
            url: `${serverUrl}/data/processTemplates/deprecated`,
            headers: { 'x-access-token': sessionStorage.token }
        });
    },
    getAll: function (context) {
        return axios({
            method: 'get',
            url: `${serverUrl}/data/processTemplates/all`,
            headers: { 'x-access-token': sessionStorage.token }
        });
    }
};

function componentErrorHandler(context, errorObject) {
    if (
        (sessionStorage.token !== undefined) &&
        (sessionStorage.token !== null) &&
        (sessionStorage.token !== '')
    ) {
        console.log('--------------------');
        console.log('dumping system state');
        console.log('--------------------');
        console.log(context.state);
        console.log('------------------');
        console.log('end of system dump');
        console.log('------------------');
        const token = sessionStorage.token;
        const activeView = context.state.activeView;
        context.commit('resetStore');
        sessionStorage.token = token;
        context.commit('restoreToken', sessionStorage.token);
        context.dispatch('initData')
            .then((responseList) => {
                // context.commit('buildStore', responseList);
                context.commit('forceViewChange', activeView);
                alert('發現系統異常，系統已覆歸。請聯繫 IT 檢視狀況。');
                console.log('----------------------------');
                console.log('system recovered after error');
                console.log('----------------------------');
                for (const index in errorObject) {
                    console.log(`${index}: ${errorObject[index]}`);
                }
            }).catch((error) => {
                alert('發現系統異常，系統覆歸失敗。請聯繫 IT 檢視狀況。');
                console.log('------------------------------------');
                console.log('system failed to recover after error');
                console.log('reason for recovery failure:');
                console.log(error);
                console.log('------------------------------------');
                for (const index in errorObject) {
                    console.log(`${index}: ${errorObject[index]}`);
                }
                context.commit('resetStore');
            });
    } else {
        alert('登入失敗');
    }
}

function initData(context) {
    const initOptList = [{
        method: 'get',
        url: `${serverUrl}/data/initialize`,
        headers: { 'x-access-token': sessionStorage.token }
    }, {
        method: 'get',
        url: `${serverUrl}/data/smartsheet/workspaces`,
        headers: { 'x-access-token': sessionStorage.token }
    }];
    return Promise.all(initOptList.map(axios));
}

export default {
    componentErrorHandler: componentErrorHandler,
    initData: initData,
    // templateManager
    action_getRecord_processTemplates: processTemplateFunction.getRecord,
    action_update_processTemplates: processTemplateFunction.update,
    action_deactivate_processTemplates: processTemplateFunction.deactivate,
    action_reorder_processTemplates: processTemplateFunction.reorder,
    action_getActive_processTemplates: processTemplateFunction.getActive,
    action_insert_processTemplates: processTemplateFunction.insert,
    action_getInactive_processTemplates: processTemplateFunction.getInactive,
    action_activate_processTemplates: processTemplateFunction.activate,
    action_deprecate_processTemplates: processTemplateFunction.deprecate,
    action_getDeprecated_processTemplates: processTemplateFunction.getDeprecated,
    action_getAll_processTemplates: processTemplateFunction.getAll
};

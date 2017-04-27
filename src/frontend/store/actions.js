import axios from 'axios';

import { serverUrl } from '../config/client.js';

export default {
    componentErrorHandler: componentErrorHandler,
    initData: initData,
    // templateManager
    createNewTemplate: createNewTemplate,
    deleteTemplate: deleteTemplate
};

function deleteTemplate(context, payload) {
    return axios({
        method: 'delete',
        url: `${serverUrl}/data/procTemplate`,
        data: {
            targetId: payload.targetId,
            targetPosition: payload.targetPosition
        },
        headers: { 'x-access-token': sessionStorage.token }
    });
}

function createNewTemplate(context, payload) {
    return axios({
        method: 'post',
        url: `${serverUrl}/data/procTemplate`,
        data: { templateName: payload.templateName },
        headers: { 'x-access-token': sessionStorage.token }
    });
}

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
        url: `${serverUrl}/data/jobType`,
        headers: { 'x-access-token': sessionStorage.token }
    }, {
        method: 'get',
        url: `${serverUrl}/data/productType`,
        headers: { 'x-access-token': sessionStorage.token }
    }, {
        method: 'get',
        url: `${serverUrl}/data/processType`,
        headers: { 'x-access-token': sessionStorage.token }
    }, {
        method: 'get',
        url: `${serverUrl}/data/procState`,
        headers: { 'x-access-token': sessionStorage.token }
    }, {
        method: 'get',
        url: `${serverUrl}/data/stage`,
        headers: { 'x-access-token': sessionStorage.token }
    }, {
        method: 'get',
        url: `${serverUrl}/data/procTemplate`,
        headers: { 'x-access-token': sessionStorage.token }
    }, {
        method: 'get',
        url: `${serverUrl}/data/smartsheet/workspaces`,
        headers: { 'x-access-token': sessionStorage.token }
    }];
    return Promise.all(initOptList.map(axios));
}

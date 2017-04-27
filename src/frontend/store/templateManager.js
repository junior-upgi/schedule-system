import axios from 'axios';

import { serverUrl } from '../config/client.js';

export const templateManagerFunction = {
    create: function (context, payload) {
        return axios({
            method: 'post',
            url: `${serverUrl}/data/procTemplate`,
            data: { templateName: payload.templateName },
            headers: { 'x-access-token': sessionStorage.token }
        });
    },
    delete: function (context, payload) {
        return axios({
            method: 'delete',
            url: `${serverUrl}/data/procTemplate`,
            data: {
                targetId: payload.targetId,
                targetPosition: payload.targetPosition
            },
            headers: { 'x-access-token': sessionStorage.token }
        });
    },
    rename: function (context, payload) {
        let requestObject = {
            method: 'put',
            url: `${serverUrl}/data/procTemplate`,
            data: {},
            headers: { 'x-access-token': sessionStorage.token }
        };
        for (let property in payload) {
            requestObject.data[property] = payload[property];
        }
        return axios(requestObject);
    },
    activate: function (context, payload) {
        let requestObject = {
            method: 'put',
            url: `${serverUrl}/data/procTemplate`,
            data: {},
            headers: { 'x-access-token': sessionStorage.token }
        };
        for (let property in payload) {
            requestObject.data[property] = payload[property];
        }
        axios(requestObject)
            .then((resultset) => {

            }).catch((error) => {

            });
    }
};

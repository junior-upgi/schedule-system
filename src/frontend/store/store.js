import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import actions from './actions.js';
import getters from './getters.js';
import mutations from './mutations.js';

import { currentDateTime } from '../utility/timeUtility.js';

export const store = new Vuex.Store({
    actions: actions,
    getters: getters,
    mutations: mutations,
    state: {
        // application state
        activeView: 'login',
        processingData: false,
        // access control
        accessExp: currentDateTime().format('HH:mm'),
        loginId: null, // same value as userData.SAL_NO
        role: null, // 'admin', 'rnd', 'sales', 'prod'
        token: null, // jwt token
        // working data
        userData: {}, // used to hold the user information returned from the authentication process
        jobTypes: null,
        phases: null,
        processStates: null,
        processTemplates: null,
        processTypes: null,
        productTypes: null
    }
});

/*
if (module.hot) {
    module.hot.accept(['./getters', './actions', './mutations'], () => {
        store.hotUpdate({
            getters: require('./getters'),
            actions: require('./actions'),
            mutations: require('./mutations')
        });
    });
}
*/

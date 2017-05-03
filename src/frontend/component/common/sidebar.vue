<template lang="html">
    <div class="col-xs-12 col-sm-2">
        <!--
        <button v-if="(role==='admin')||(role==='furnace')" type="button" class="btn btn-default btn-block" :disabled="dataProcessingState?true:false" :class="{'btn-danger':activeView==='furnace'}" @click="changeWorkingView('furnace')">
            窯爐模組
        </button>
        <button
            v-if="(role==='admin')||(role==='furnace')"
            type="button" class="btn btn-default btn-block"
            :disabled="dataProcessingState?true:false"
            disabled>
            轉入廠單
        </button>
        <button v-if="(role==='admin')||(role==='purchasing')" type="button" class="btn btn-default btn-block" :disabled="dataProcessingState?true:false" :class="{'btn-danger':activeView==='purchasing'}" @click="changeWorkingView('purchasing')">
            採購模組
        </button>
        <button v-if="(role==='admin')||(role==='purchasing')" type="button" class="btn btn-default btn-block" :disabled="dataProcessingState?true:false" :class="{'btn-danger':activeView==='pOView'}" @click="changeWorkingView('pOView')">
            檢視訂單
        </button>
        <button v-if="((role==='admin')||(role==='purchasing'))&&(activeView==='pOView')" type="button" class="btn btn-default btn-block" :disabled="dataProcessingState?true:false" @click="printPO()">
            列印訂單
        </button>
        <button
            type="button" class="btn btn-default btn-block"
            :disabled="dataProcessingState?true:false"
            :class="{'btn-danger':activeView==='shippingStatement'}"
            @click="changeWorkingView('shippingStatement')">
            對帳資料
        </button>
        -->
        <button
            v-if="role==='admin'"
            type="button" class="btn btn-default btn-block"
            :disabled="processingData?true:false"
            :class="{'btn-danger':activeView==='admin'}"
            @click="changeWorkingView('admin')">
            管理模組
        </button>
        <button
            v-if="role==='admin'"
            type="button" class="btn btn-default btn-block"
            :disabled="processingData?true:false"
            :class="{'btn-danger':activeView==='templateManager'}"
            @click="changeWorkingView('templateManager')">
            範本管理
        </button>
        <button
            v-if="role==='admin'"
            type="button" class="btn btn-default btn-block"
            :disabled="processingData?true:false"
            :class="{'btn-danger':activeView==='processManager'}"
            @click="changeWorkingView('processManager')">
            工序管理
        </button>
        <button
            type="button" class="btn btn-default btn-block"
            :disabled="processingData?true:false"
            @click="logout()">
            登出系統
        </button>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
    name: 'sidebar',
    computed: {
        ...mapGetters({
            activeView: 'activeView',
            role: 'role',
            processingData: 'processingData'
        })
    },
    methods: {
        ...mapActions({
            componentErrorHandler: 'componentErrorHandler',
            initData: 'initData'
        }),
        ...mapMutations({
            buildStore: 'buildStore',
            forceViewChange: 'forceViewChange',
            processingDataSwitch: 'processingDataSwitch',
            resetStore: 'resetStore'
        }),
        logout: function () {
            if (confirm('請確認是否登出系統？將遺失未儲存之資料...')) {
                this.resetStore();
            }
        },
        changeWorkingView: function (view) {
            this.processingDataSwitch(true);
            this.initData()
                .then((responseList) => {
                    this.buildStore(responseList);
                    this.forceViewChange(view);
                    this.processingDataSwitch(false);
                })
                .catch((error) => {
                    this.componentErrorHandler({
                        component: 'app',
                        method: 'changeWorkingView',
                        situation: '管理者變更模組中初始化程序失敗',
                        systemMessage: error
                    });
                });
        }
    }
};
</script>

<style></style>

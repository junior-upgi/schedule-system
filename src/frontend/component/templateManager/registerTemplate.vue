<template lang="html">
    <div class="input-group">
        <input
            type="text"
            class="form-control"
            :placeholder="captionPlaceholder"
            :disabled="processingData?true:false"
            v-model.trim="reference">
        <span class="input-group-btn">
            <button
                class="btn btn-default"
                type="button"
                :disabled="processingData||reference===''?true:false"
                @click="insert">
                新建範本
            </button>
        </span>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
    name: 'registerTemplate',
    computed: {
        ...mapGetters({
            processingData: 'processingData',
            processTemplate: 'processTemplate'
        }),
        checkDuplication: function () {
            let duplicate = this.processTemplate.filter((processTemplateItem) => {
                return processTemplateItem.reference === this.reference;
            });
            return duplicate.length > 0 ? true : false;
        }
    },
    data: function () {
        return {
            reference: '',
            captionPlaceholder: '請輸入範本名稱'
        };
    },
    methods: {
        ...mapActions({
            componentErrorHandler: 'componentErrorHandler',
            action_getDeprecated_processTemplate: 'action_getDeprecated_processTemplate',
            action_insert_processTemplate: 'action_insert_processTemplate'
        }),
        ...mapMutations({
            processingDataSwitch: 'processingDataSwitch'
        }),
        insert: function () {
            this.processingDataSwitch(true);
            this.action_getDeprecated_processTemplate()
                .then((resultset) => {
                    if (resultset.data.filter((resultItem) => {
                        return resultItem.reference === this.reference;
                    }).length > 0) {
                        this.captionPlaceholder = '新範本名稱與過去刪除資料相同';
                        this.reference = '';
                        this.processingDataSwitch(false);
                        return;
                    } else {
                        if (this.checkDuplication === true) {
                            this.captionPlaceholder = '範本名稱重複，請重新輸入';
                            this.reference = '';
                            this.processingDataSwitch(false);
                            return;
                        } else {
                            this.action_insert_processTemplate({ reference: this.reference })
                                .then(() => {
                                    this.captionPlaceholder = '請輸入範本名稱';
                                    this.reference = '';
                                    this.processingDataSwitch(false);
                                }).catch((error) => {
                                    this.captionPlaceholder = '新建工序範本作業失敗，請輸入範本名稱';
                                    this.reference = '';
                                    this.processingDataSwitch(false);
                                    this.componentErrorHandler({
                                        component: 'registerTemplate',
                                        method: 'registerNew',
                                        situation: '新建工序範本作業失敗',
                                        systemMessage: error
                                    });
                                });
                        }
                    }
                });
        }
    }
};
</script>

<style></style>

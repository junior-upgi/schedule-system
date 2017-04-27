<template lang="html">
    <div class="input-group">
        <input
            type="text"
            class="form-control"
            :placeholder="captionPlaceholder"
            :disabled="processingData?true:false"
            v-model.trim="templateName">
        <span class="input-group-btn">
            <button
                class="btn btn-default"
                type="button"
                :disabled="processingData?true:false"
                @click="registerNew()">
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
            procTemplate: 'procTemplate'
        }),
        checkDuplication: function () {
            let duplicate = this.procTemplate.filter((procTemplateItem) => {
                return procTemplateItem.reference === this.templateName;
            });
            return duplicate.length > 0 ? true : false;
        }
    },
    data: function () {
        return {
            templateName: '',
            captionPlaceholder: '請輸入範本名稱'
        };
    },
    methods: {
        ...mapActions({
            componentErrorHandler: 'componentErrorHandler',
            createNewTemplate: 'createNewTemplate'
        }),
        ...mapMutations({
            processingDataSwitch: 'processingDataSwitch',
            procTemplateInsert: 'procTemplateInsert'
        }),
        registerNew: function () {
            this.processingDataSwitch(true);
            if (this.checkDuplication === true) {
                this.captionPlaceholder = '範本名稱重複，請重新輸入';
                this.templateName = '';
                this.processingDataSwitch(false);
            } else {
                this.createNewTemplate({ templateName: this.templateName })
                    .then((resultset) => {
                        this.procTemplateInsert(resultset.data.newRecord);
                        this.captionPlaceholder = '請輸入範本名稱';
                        this.templateName = '';
                        this.processingDataSwitch(false);
                    }).catch((error) => {
                        this.captionPlaceholder = '新建工序範本作業失敗，請輸入範本名稱';
                        this.templateName = '';
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
    }
};
</script>

<style></style>

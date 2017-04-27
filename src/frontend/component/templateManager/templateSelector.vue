<template lang="html">
    <div class="row">
        <div class="col-xs-8 col-md-9 col-lg-10">
            <select
                class="form-control"
                v-model="targetId"
                :disabled="processingData?true:false">
                <option disabled value="">請選擇範本</option>
                <option
                    v-for="procTemplateItem in procTemplate"
                    v-bind:value="procTemplateItem.id">
                    {{ procTemplateItem.reference }}
                </option>
            </select>
        </div>
        <div class="col-xs-4 col-md-3 col-lg-2 text-left">
            <button
                class="btn btn-danger"
                @click="deleteCurrentTemplate"
                :disabled="((targetId==='')||(processingData))?true:false">
                刪除
            </button>
            <button
                class="btn btn-primary"
                @click="deleteCurrentTemplate"
                :disabled="((targetId==='')||(processingData))?true:false">
                修改名稱
            </button>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
    name: 'templateSelector',
    computed: {
        ...mapGetters({
            processingData: 'processingData',
            procTemplate: 'procTemplate'
        }),
        targetTemplate: function () {
            return this.procTemplate.filter((procTemplateItem) => {
                return procTemplateItem.id === this.targetId;
            })[0];
        }
    },
    data: function () {
        return {
            targetId: ''
        };
    },
    methods: {
        ...mapActions({
            componentErrorHandler: 'componentErrorHandler',
            deleteTemplate: 'deleteTemplate'
        }),
        ...mapMutations({
            processingDataSwitch: 'processingDataSwitch',
            procTemplateRemove: 'procTemplateRemove',
            procTemplateReset: 'procTemplateReset',
            buildStore: 'buildStore'
        }),
        deleteCurrentTemplate: function () {
            if (confirm('請確定是否刪除')) {
                this.processingDataSwitch(true);
                this.deleteTemplate({
                    targetId: this.targetId,
                    targetPosition: this.targetTemplate.displaySequence
                }).then((resultset) => {
                    this.procTemplateReset();
                    this.buildStore([resultset]);
                    this.targetId = '';
                    this.processingDataSwitch(false);
                }).catch((error) => {
                    this.targetId = '';
                    this.processingDataSwitch(false);
                    this.componentErrorHandler({
                        component: 'templateSelector',
                        method: 'deleteCurrentTemplate',
                        situation: '刪除工序範本作業失敗',
                        systemMessage: error
                    });
                });
            }
        }
    }
};
</script>

<style></style>

<template lang="html">
    <div class="row">
        <div class="col-sm-7 col-md-8 col-lg-9">
            <select
                class="form-control"
                v-model="targetId"
                :disabled="((processTemplate.length===0)||(processingData))?true:false">
                <option v-if="processTemplate.length===0" disabled value="">沒有工序範本選項</option>
                <option v-if="processTemplate.length>0" disabled value="">選擇操作範本</option>
                <option
                    v-for="processTemplateItem in processTemplate"
                    style="margin:5px;"
                    v-bind:value="processTemplateItem.id">
                    <template v-if="processTemplateItem.active">
                        {{processTemplateItem.displaySequence+1}}.&nbsp;
                    </template>
                    {{ processTemplateItem.reference }}
                    <template v-if="!processTemplateItem.active">(停用)</template>
                </option>
            </select>
        </div>
        <div class="col-sm-5 col-md-4 col-lg-3 text-left">
            <button
                v-if="targetTemplateArrayIndex!==null"
                class="btn btn-primary"
                @click="update"
                :disabled="((targetId==='')||(processingData))?true:false">
                修改名稱
            </button>
            <button
                v-if="((targetTemplateArrayIndex!==null)&&(targetTemplate.active===false))"
                class="btn btn-success"
                :disabled="((targetId==='')||(processingData))?true:false"
                @click="activate">
                啟用
            </button>
            <button
                v-if="((targetTemplateArrayIndex!==null)&&(targetTemplate.active===true))"
                class="btn btn-warning"
                :disabled="((targetId==='')||(processingData))?true:false"
                @click="deactivate">
                停用
            </button>
            <button
                v-if="((targetTemplateArrayIndex!==null)&&(targetTemplate.active===false))"
                class="btn btn-danger"
                :disabled="((targetId==='')||(processingData))?true:false"
                @click="deprecate">
                刪除
            </button>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
    name: 'productTemplateSelector',
    computed: {
        ...mapGetters({
            processingData: 'processingData',
            processTemplate: 'processTemplate'
        }),
        targetTemplate: function () {
            return this.processTemplate.filter((processTemplateItem) => {
                return processTemplateItem.id === this.targetId;
            })[0];
        },
        targetTemplateArrayIndex: function () {
            if (this.targetId === '') {
                return null;
            } else {
                let targetArrayIndex = null;
                this.processTemplate.forEach((processTemplateItem, currentIndex) => {
                    if (processTemplateItem.id === this.targetId) {
                        targetArrayIndex = currentIndex;
                    }
                });
                return targetArrayIndex;
            }
        }
    },
    data: function () {
        return {
            targetId: ''
        };
    },
    watch: {
        targetId: function (value) {
            this.$emit('selectTemplateEvent', this.targetId);
        }
    },
    methods: {
        ...mapActions({
            action_deactivate_processTemplate: 'action_deactivate_processTemplate',
            action_activate_processTemplate: 'action_activate_processTemplate',
            action_deprecate_processTemplate: 'action_deprecate_processTemplate',
            action_update_processTemplate: 'action_update_processTemplate',
            componentErrorHandler: 'componentErrorHandler'
        }),
        ...mapMutations({
            processingDataSwitch: 'processingDataSwitch'
        }),
        checkDuplication: function (newReference) {
            let duplicate = this.processTemplate.filter((processTemplateItem) => {
                return processTemplateItem.reference === newReference;
            });
            return duplicate.length > 0 ? true : false;
        },
        deactivate: function () {
            if (confirm(`請確定停用 [${this.targetTemplate.reference}]`)) {
                this.processingDataSwitch(true);
                this.action_deactivate_processTemplate({
                    id: this.targetId
                }).then(() => {
                    this.processingDataSwitch(false);
                }).catch((error) => {
                    this.targetId = '';
                    this.processingDataSwitch(false);
                    this.componentErrorHandler({
                        component: 'templateSelector',
                        method: 'deactivate',
                        situation: '停用工序範本作業失敗',
                        systemMessage: error
                    });
                });
            }
        },
        activate: function () {
            if (confirm(`請確定啟用 [${this.targetTemplate.reference}]`)) {
                this.processingDataSwitch(true);
                this.action_activate_processTemplate({
                    id: this.targetId
                }).then(() => {
                    this.processingDataSwitch(false);
                }).catch((error) => {
                    this.targetId = '';
                    this.processingDataSwitch(false);
                    this.componentErrorHandler({
                        component: 'templateSelector',
                        method: 'activate',
                        situation: '啟用工序範本作業失敗',
                        systemMessage: error
                    });
                });
            }
        },
        deprecate: function () {
            if (confirm(`請確定是否刪除 [${this.targetTemplate.reference}]`)) {
                this.processingDataSwitch(true);
                this.action_deprecate_processTemplate({
                    id: this.targetId
                }).then(() => {
                    this.targetId = '';
                    this.processingDataSwitch(false);
                }).catch((error) => {
                    this.targetId = '';
                    this.processingDataSwitch(false);
                    this.componentErrorHandler({
                        component: 'templateSelector',
                        method: 'deprecate',
                        situation: '刪除工序範本作業失敗',
                        systemMessage: error
                    });
                });
            }
        },
        update: function () {
            let newReference = prompt('請輸入新範本名稱', this.targetTemplate.reference);
            if (newReference === null) {
                return;
            } else if (
                (newReference !== '') &&
                (newReference !== this.targetTemplate.reference) &&
                (!this.checkDuplication(newReference))
            ) {
                this.processingDataSwitch(true);
                this.action_update_processTemplate({
                    id: this.targetId,
                    reference: newReference
                }).then(() => {
                    this.processingDataSwitch(false);
                }).catch((error) => {
                    this.processingDataSwitch(false);
                    this.componentErrorHandler({
                        component: 'templateSelector',
                        method: 'renameCurrentTemplate',
                        situation: '工序範本名稱變更作業失敗',
                        systemMessage: error
                    });
                });
            } else {
                alert('指定工序名稱重複');
            }
        }
    }
};
</script>

<style></style>

<template lang="html">
    <div class="row">
        <div class="col-sm-7 col-md-8 col-lg-9">
            <select
                class="form-control"
                v-model="targetId"
                :disabled="((procTemplate.length===0)||(processingData))?true:false">
                <option v-if="procTemplate.length===0" disabled value="">沒有工序範本選項</option>
                <option v-if="procTemplate.length>0" disabled value="">選擇操作範本</option>
                <option
                    style="margin:5px;"
                    v-for="procTemplateItem in procTemplate"
                    v-bind:value="procTemplateItem.id">
                    {{ procTemplateItem.reference }}
                    <template v-if="procTemplateItem.deprecated">(停用)</template>
                </option>
            </select>
        </div>
        <div class="col-sm-5 col-md-4 col-lg-3 text-left">
            <button
                class="btn btn-default"
                :disabled="((targetId==='')||(processingData))?true:false"
                v-if="targetTemplate&&targetTemplate.deprecated!==null">
                啟用
            </button>
            <button
                class="btn btn-danger"
                :disabled="((targetId==='')||(processingData))?true:false"
                v-if="targetTemplate&&targetTemplate.deprecated===null">
                停用
            </button>
            <button
                class="btn btn-danger"
                @click="deleteCurrentTemplate"
                :disabled="((targetId==='')||(processingData))?true:false">
                刪除
            </button>
            <button
                class="btn btn-primary"
                @click="renameCurrentTemplate"
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
        },
        targetTemplateArrayIndex: function () {
            if (this.targetId === '') {
                return null;
            } else {
                let targetArrayIndex = null;
                this.procTemplate.forEach((procTemplateItem, currentIndex) => {
                    if (procTemplateItem.id === this.targetId) {
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
    methods: {
        ...mapActions({
            componentErrorHandler: 'componentErrorHandler',
            deleteTemplate: 'deleteTemplate',
            renameTemplate: 'renameTemplate'
        }),
        ...mapMutations({
            processingDataSwitch: 'processingDataSwitch',
            procTemplateRemove: 'procTemplateRemove',
            procTemplateReset: 'procTemplateReset',
            procTemplateRename: 'procTemplateRename',
            buildStore: 'buildStore'
        }),
        checkDuplication: function (newReference) {
            let duplicate = this.procTemplate.filter((procTemplateItem) => {
                return procTemplateItem.reference === newReference;
            });
            return duplicate.length > 0 ? true : false;
        },
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
                    this.targetId[0] = '';
                    this.processingDataSwitch(false);
                    this.componentErrorHandler({
                        component: 'templateSelector',
                        method: 'deleteCurrentTemplate',
                        situation: '刪除工序範本作業失敗',
                        systemMessage: error
                    });
                });
            }
        },
        renameCurrentTemplate: function () {
            let newReference = prompt('請輸入新範本名稱', this.targetTemplate.reference);
            if (
                (newReference !== null) &&
                (newReference !== '') &&
                (newReference !== this.targetTemplate.reference) &&
                (!this.checkDuplication(newReference))
            ) {
                this.processingDataSwitch(true);
                this.renameTemplate({
                    id: this.targetId,
                    reference: newReference
                }).then((resultset) => {
                    this.procTemplateRename({
                        targetIndex: this.targetTemplateArrayIndex,
                        reference: newReference
                    });
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
                alert('指定工序名稱重複或已取消名稱變更作業');
            }
        },
        templateActivation: function () {
            this.processingDataSwitch(true);
            this.activateTemplate({
                id: this.targetId,
                deprecated: null
            }).then(() => {
                this.processingDataSwitch(false);
            });
        }
    }
};
</script>

<style></style>

<template lang="html">
    <div>
        <ul class="nav nav-tabs" role="tablist">
            <productTab
                v-for="productIndex in productList"
                :activeProductIndex="activeProductIndex"
                :productIndex="productIndex"
                @tabSelectEvent="tabSelectEvent">
            </productTab>
        </ul>
        <div class="tab-content">
            <productDetail
                v-for="productIndex in productList"
                v-if="activeProductIndex===productIndex"
                :productIndex="productIndex">
            </productDetail>
        </div>
    </div>
</template>

<script>
import productTab from './productTab.vue';
import productDetail from './productDetail.vue';

export default {
    name: 'processTemplate',
    components: {
        productTab,
        productDetail
    },
    props: ['selectedTemplateId'],
    data: function () {
        return {
            productList: [0, 1, 2, 3],
            activeProductIndex: null
        };
    },
    watch: {
        selectedTemplateId: function (newId) {
            this.activeProductIndex = 0;
        }
    },
    methods: {
        tabSelectEvent: function (selectedProductIndex) {
            this.activeProductIndex = selectedProductIndex;
        }
    }
};
</script>

<style></style>

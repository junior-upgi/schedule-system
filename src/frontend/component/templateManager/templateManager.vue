<template>
    <div class="text-center col-xs-12 col-sm-10">
        <div>
            <registerTemplate></registerTemplate>
            <br>
            <processTemplateSelector @selectTemplateEvent="selectTemplateEvent">
            </processTemplateSelector>
        </div>
        <br>
        <processTemplate :selectedTemplateId="selectedTemplateId"></processTemplate>
    </div>
</template>

<script>
import registerTemplate from './registerTemplate.vue';
import processTemplateSelector from './processTemplateSelector.vue';
import processTemplate from './processTemplate.vue';

export default {
    name: 'templateManager',
    components: {
        registerTemplate,
        processTemplateSelector,
        processTemplate
    },
    data: function () {
        return {
            selectedTemplateId: null
        };
    },
    methods: {
        selectTemplateEvent: function (payload) {
            this.selectedTemplateId = payload;
        }
    }
};
</script>

<style>

</style>

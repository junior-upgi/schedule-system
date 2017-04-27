<template>
    <div class="text-center col-xs-12 col-sm-10">
        <div>
            <registerTemplate></registerTemplate>
            <br>
            <templateSelector></templateSelector>
        </div>
        <br>
        <templateDetail></templateDetail>
    </div>
</template>

<script>
import registerTemplate from './registerTemplate.vue';
import templateSelector from './templateSelector.vue';
import templateDetail from './templateDetail.vue';

export default {
    name: 'templateManager',
    components: {
        registerTemplate,
        templateSelector,
        templateDetail
    }
};
</script>

<style>
</style>

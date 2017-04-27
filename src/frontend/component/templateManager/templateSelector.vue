<template lang="html">
    <div class="row">
        <div class="col-xs-12 col-md-6">
            <select class="form-control">
                <option v-for="procTemplateItem in procTemplate">{{ procTemplateItem.reference }}</option>
            </select>
        </div>
        <div class="col-xs-6 text-left">
            <button class="btn">刪除</button>
            <button class="btn">修改名稱</button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'templateSelector',
    computed: {
        ...mapGetters({ procTemplate: 'procTemplate' })
    }
};
</script>

<style></style>

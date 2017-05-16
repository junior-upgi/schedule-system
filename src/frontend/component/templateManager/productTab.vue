<template lang="html">
    <li role="presentation">
        <a
            role="tab" data-toggle="tab"
            :class="{active: isActive}"
            :href="'#product'+productIndex"
            @click="tabSelectEvent">
            product{{productIndex}}
        </a>
    </li>
</template>

<script>
export default {
    name: 'productTab',
    props: [
        'activeProductIndex',
        'productIndex'
    ],
    computed: {
        isActive: function () {
            return this.activeProductIndex === this.productIndex ? true : false;
        }
    },
    methods: {
        tabSelectEvent: function () {
            this.$emit('tabSelectEvent', this.productIndex);
        }
    }
};
</script>

<style></style>

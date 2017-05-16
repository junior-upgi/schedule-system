<template lang="html">
    <li class="list-group-item text-left" draggable>
        {{displaySequence+1}}. {{reference}} [ {{id}} ]
    </li>
</template>

<script>
export default {
    name: 'processItem',
    props: [
        'id',
        'reference',
        'displaySequence',
        'active'
    ]
};
</script>

<style></style>

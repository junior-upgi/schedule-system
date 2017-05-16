<template lang="html">
    <div
        role="tabpanel"
        class="tab-pane fade in active"
        :id="'product'+productIndex">
        <ul class="list-group" style="padding:10px;">
            <li class="list-group-item text-left">
                <span class="badge">14</span>
                Cras justo odio
            </li>
            <li class="list-group-item text-left">Dapibus ac facilisis in</li>
            <li class="list-group-item text-left">Morbi leo risus</li>
            <li class="list-group-item text-left">Porta ac consectetur ac</li>
            <li class="list-group-item text-left">Vestibulum at eros</li>
        </ul>
        <div>ABC</div>
        <div>DEF</div>
        <div>GHI</div>
        <div>{{productIndex}}</div>
    </div>
</template>

<script>
export default {
    name: 'productDetail',
    props: ['productIndex']
};
</script>

<style></style>

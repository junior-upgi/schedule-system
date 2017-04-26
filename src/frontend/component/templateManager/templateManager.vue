<template>
    <div class="text-center col-xs-12 col-sm-10">
        <div>
            <registerTemplate></registerTemplate>
            <br>
            <select class="form-control">
                <option>template 1</option>
                <option>template 2</option>
                <option>template 3</option>
                <option>template 4</option>
            </select>
        </div>
        <br>
        <div>
            <h2>template selected</h2>
            <ul class="nav nav-tabs" role="tablist">
                <li role="presentation" class="active"><a href="#product1" role="tab" data-toggle="tab">product1</a></li>
                <li role="presentation"><a href="#product2" role="tab" data-toggle="tab">product2</a></li>
                <li role="presentation"><a href="#product3" role="tab" data-toggle="tab">product3</a></li>
            </ul>
            <div class="tab-content">
                <div role="tabpanel" class="tab-pane fade in active" id="product1">
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
                    <div>JKL</div>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="product2">
                    <ul class="list-group" style="padding:10px;">
                        <li class="list-group-item text-left">
                            <span class="badge">14天</span>
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
                    <div>JKL</div>
                </div>
                <div role="tabpanel" class="tab-pane fade" id="product3">
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
                    <div>JKL</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import registerTemplate from './registerTemplate.vue';

export default {
    name: 'templateManager',
    components: { registerTemplate }
};
</script>

<style>
</style>

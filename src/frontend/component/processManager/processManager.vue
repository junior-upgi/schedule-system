<template lang="html">
    <div class="col-xs-12 col-sm-10">
        <!--
        <div class="form-group form-group-lg panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Sortable control</h3>
            </div>
            <div class="panel-body">
                <div class="checkbox">
                    <label>
                        <input type="checkbox" v-model="editable">Enable drag and drop
                    </label>
                </div>
                <button type="button" class="btn btn-default" @click="orderList">Sort by original order</button>
            </div>
        </div>
        -->
        <!--
        <div class="col-md-4">
            <draggable class="list-group" element="ul" v-model="list" :options="dragOptions" :move="onMove" @start="isDragging=true" @end="isDragging=false">
                <transition-group type="transition" :name="'flip-list'">
                    <li class="list-group-item" v-for="element in list" :key="element.order">
                        <i :class="element.fixed? 'fa fa-anchor' : 'glyphicon glyphicon-pushpin'" @click=" element.fixed=! element.fixed" aria-hidden="true"></i> {{element.name}}
                        <span class="badge">{{element.order}}</span>
                    </li>
                </transition-group>
            </draggable>
        </div>
        -->
        <div class="col-md-4">
            <draggable
                class="list-group"
                element="ul"
                v-model="list"
                :options="dragOptions"
                :move="onMove"
                @start="isDragging=true"
                @end="isDragging=false">
                <transition-group
                    type="transition"
                    :name="'flip-list'">
                    <li v-for="element in list"
                        class="list-group-item"
                        :key="element.order">
                        <i
                            :class="element.fixed?'glyphicon glyphicon-sort':'glyphicon glyphicon-pushpin'"
                            @click="element.fixed=!element.fixed">
                        </i>
                        {{element.name}}
                        <span class="badge">
                            {{element.order}}
                        </span>
                    </li>
                </transition-group>
            </draggable>
        </div>

        <div class="col-md-4">
            <draggable class="list-group" element="ul" v-model="list" :options="dragOptions" :move="onMove" @start="isDragging=true" @end="isDragging=false">
                <transition-group type="transition" :name="'flip-list'">
                    <li class="list-group-item" v-for="element in list" :key="element.order">
                        <i :class="element.fixed? 'fa fa-anchor' : 'glyphicon glyphicon-pushpin'" @click=" element.fixed=! element.fixed" aria-hidden="true"></i> {{element.name}}
                    </li>
                </transition-group>
            </draggable>
        </div>

        <div class="col-md-4">
            <draggable element="span" v-model="processType" :options="dragOptions" :move="onMove">
                <transition-group name="no" class="list-group" tag="ul">
                    <li class="list-group-item" v-for="element in processType" :key="element.displaySequence">
                        <i :class="element.fixed? 'fa fa-anchor' : 'glyphicon glyphicon-pushpin'" @click=" element.fixed=! element.fixed" aria-hidden="true"></i> {{element.reference}}
                    </li>
                </transition-group>
            </draggable>
        </div>

        <anchor></anchor>

        <!--
        <div class="list-group col-md-3">
            <pre>{{listString}}</pre>
        </div>
        <div class="list-group col-md-3">
            <pre>{{list2String}}</pre>
        </div>
        -->
    </div>
</template>

<script>
import draggable from 'vuedraggable';

import { mapGetters } from 'vuex';

const message = ['vue.draggable', 'draggable', 'component', 'for', 'vue.js 2.0', 'based', 'on', 'Sortablejs'];

export default {
    name: 'hello',
    components: { draggable },
    data: function () {
        return {
            list: message.map((name, index) => { return { name, order: index + 1, fixed: false }; }),
            // list2: [],
            editable: true,
            isDragging: false,
            delayedDragging: false
        };
    },
    methods: {
        orderList: function () {
            this.list = this.list.sort((one, two) => { return one.order - two.order; });
        },
        onMove: function ({ relatedContext, draggedContext }) {
            const relatedElement = relatedContext.element;
            const draggedElement = draggedContext.element;
            return (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed;
        }
    },
    computed: {
        ...mapGetters({
            processType: 'processType'
        }),
        dragOptions: function () {
            return {
                animation: 0,
                group: 'description',
                disabled: !this.editable,
                ghostClass: 'ghost'
            };
        },
        listString: function () {
            return JSON.stringify(this.list, null, 2);
        },
        list2String: function () {
            return JSON.stringify(this.processType, null, 2);
        }
    },
    watch: {
        isDragging: function (newValue) {
            if (newValue) {
                this.delayedDragging = true;
                return;
            }
            this.$nextTick(() => {
                this.delayedDragging = false;
            });
        }
    }
};
</script>

<style>
.flip-list-move {
    transition: transform 0.5s;
}

.no-move {
    transition: transform 0s;
}

.ghost {
    opacity: .5;
    background: #C8EBFB;
}

.list-group {
    min-height: 20px;
}

.list-group-item {
    cursor: move;
}

.list-group-item i {
    cursor: pointer;
}
</style>

<template>
    <section class="inventory" :style="`display: ${model[field].length ? 'flex' : 'none'}`" @wheel="onScroll($event)">
        <div class="icon">
            <component :is="icon" />
        </div>
        <div v-for="(item, index) in model[field]"
             :key="index"
             class="slot"
             :style="`background-image: url('${item.getAvatar().name}')`"
             :title="item.getName()"
             @click.prevent.stop="onSlotClick(item)"
        >
            <div class="amount" v-if="item.amount">{{ item.amount }}</div>
        </div>
        <slot></slot>
    </section>
</template>

<script>
import Item from "~client/models/Item";
import GameSession from "~client/models/GameSession";
import ApiClient from "~client/lib/ApiClient";

export default {
    props: {
        model: {
            type: GameSession.RawClass,
            required: true
        },
        field: {
            type: String,
            default: "inventory"
        },
        icon: {
            type: String,
            required: true
        },
        minimumSlots: {
            type: Number,
            default: 10
        }
    },
    mounted() {
        if (this.model[this.field].length < 10) {
            for (let index = this.model[this.field].length; index < this.minimumSlots; index++) {
                this.add(null);
            }
        }
    },
    methods: {
        onScroll(event) {
            this.$el.scrollLeft -= (event.wheelDelta);
            event.preventDefault();
        },
        onSlotClick(item) {
            if (!item.amount) return;
            this.grab(item);
        },
        nextEmptyInventorySlot(name = this.field) {
            for (let index = 0; index < this.model[name].length; index++) {
                const item = this.model[name][index];
                if (!item.amount) return index;
            }
            return -1;
        },
        nextCorrespondingStack(obj, name = this.field) {
            for (const item of this.model[name]) {
                if (item.object === obj) return item;
            }
            return null;
        },
        add(obj, name = this.field) {
            if (!obj) {
                this.model[name].push(ApiClient.store.addModel(new Item.Model({ amount: 0 })));
                return;
            }
            const nextEmptySlot = this.nextEmptyInventorySlot(name);
            const nextStack = this.nextCorrespondingStack(obj, name);

            if (nextStack) {
                nextStack.amount++;
            } else if (nextEmptySlot >= 0) {
                const item = this.model[name][nextEmptySlot];
                item.object = obj;
                item.amount++;
            } else {
                const item = ApiClient.store.addModel(new Item.Model());
                item.object = obj;
                this.model[name].push(item);
            }
        },
        remove(obj, name = this.field) {
            const nextStack = this.nextCorrespondingStack(obj, name);
            if (!nextStack) return;
            nextStack.amount--;
            if (!nextStack.amount) {
                if (this.model[name].length - 1 >= this.minimumSlots) {
                    const index = this.model[name].indexOf(nextStack);
                    this.model[name].splice(index, 1);
                    ApiClient.store.removeModel(nextStack);
                } else nextStack.object = null;
            }
        },
        grab(item) {
            let addTo = "grabbing";
            if (this.field === "grabbing") addTo = "inventory";
            this.add(item.object, addTo);
            this.remove(item.object, this.field);
        },
        putBack() {
            for (const item of this.model.grabbing) {
                for (let index = 0; index < item.amount; index++) {
                    this.add(item.object, this.field);
                }
                ApiClient.store.removeModel(item);
            }
            this.model.grabbing.splice(0, this.model.grabbing.length);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Inventory.less"></style>

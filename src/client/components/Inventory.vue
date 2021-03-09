<template>
    <section class="inventory" ref="inventory" @wheel="onScroll($event)">
        <div v-for="(item, index) in model.inventory"
             :key="index"
             class="slot"
             :style="`background-image: url('${item.getAvatar().name}')`"
             :title="item.getName()"
             @click.prevent.stop="onSlotClick(item)"
        >
            <div class="amount" v-if="item.amount">{{ item.amount }}</div>
        </div>
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
        }
    },
    methods: {
        onScroll(event) {
            this.$refs.inventory.scrollLeft -= (event.wheelDelta);
            event.preventDefault();
        },
        onSlotClick(item) {
            if (!item.amount) return;
            this.grab(item);
        },
        nextEmptyInventorySlot(name = "inventory") {
            for (let index = 0; index < this.model[name].length; index++) {
                const item = this.model[name][index];
                if (!item.amount) return index;
            }
            return -1;
        },
        nextCorrespondingStack(obj, name = "inventory") {
            for (const item of this.model[name]) {
                if (item.object === obj) return item;
            }
            return null;
        },
        add(obj, name = "inventory") {
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
        grab(item) {
            item.amount--;
            this.add(item.object, "grabbing");
            if (!item.amount) item.object = null;
        },
        clearHand() {
            for (const item of this.model.grabbing) {
                for (let index = 0; index < item.amount; index++) {
                    this.add(item.object);
                }
            }
            this.model.grabbing.splice(0, this.model.grabbing.length);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Inventory.less"></style>

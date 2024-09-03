<template>
  <v-dialog v-model="dialogModel" max-width="500px">
    <v-card v-if="randomItem">
      <v-card-title class="headline">Random Todo Item</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="randomItem.text"
          label="Item text"
          @keyup.enter="saveEdit"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="drawAnother">Draw Another</v-btn>
        <v-btn color="success" @click="saveEdit">Save</v-btn>
        <v-btn color="error" @click="deleteItem">Delete</v-btn>
        <v-btn color="warning" @click="deferItem">Defer</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" text @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  active: Boolean,
  item: Object,
});

const emit = defineEmits([
  "update:active",
  "save",
  "delete",
  "defer",
  "drawAnother",
]);

const randomItem = ref(props.item);

watch(
  () => props.item,
  (newItem) => {
    randomItem.value = newItem;
  }
);

const dialogModel = computed({
  get: () => props.active,
  set: (value) => emit("update:active", value),
});

const saveEdit = () => {
  emit(
    "save",
    randomItem.value.text,
    randomItem.value.id,
    randomItem.value.checked
  );
};

const deleteItem = () => {
  emit("delete", randomItem.value.id);
};

const deferItem = () => {
  emit("defer", randomItem.value.id);
};

const drawAnother = () => {
  emit("drawAnother");
};

const close = () => {
  dialogModel.value = false;
};
</script>

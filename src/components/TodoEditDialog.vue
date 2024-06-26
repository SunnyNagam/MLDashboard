<template>
  <v-dialog v-model="editDialog" max-width="500px" @click:outside="toggle">
    <v-card>
      <v-card-title class="headline"> Edit item </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editItemText"
          label="Edit item"
          autofocus
          solo
          @keydown.enter="saveEdit"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey darken-1" text @click="toggle">Close</v-btn>
        <v-btn color="primary" text @click="saveEdit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  item: {
    type: Object,
    default: () => [],
  },
  active: {
    type: Boolean,
    default: false,
  },
});
watch(
  () => props.active,
  (newValue) => {
    nextTick(() => {
      editDialog.value = newValue;
      if (newValue) {
        editItem.value = props.item;
        editItemText.value = props.item.text;
        editItemId.value = props.item.id;
      }
    });
  }
);

const emit = defineEmits(["save", "toggle"]);

const editDialog = ref(props.active);
const editItem = ref(props.item);
const editItemText = ref(props.item.text);
const editItemId = ref(props.item.id);

const saveEdit = () => {
  emit("save", editItemText.value, editItemId.value, editItem.value);
  toggle();
};

const toggle = () => {
  emit("toggle", false);
  editDialog.value = false;
};
</script>

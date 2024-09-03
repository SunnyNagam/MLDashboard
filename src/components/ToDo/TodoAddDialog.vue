<template>
  <v-dialog v-model="dialogModel" max-width="500px" scroll-strategy="close">
    <v-card>
      <v-card-title class="headline">Add a new item</v-card-title>

      <v-card-text>
        <v-text-field
          v-model="newItemText"
          label="New item"
          autofocus
          solo
          @keydown.enter="addItem"
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn color="grey darken-1" text @click="close">Close</v-btn>
        <v-btn color="primary" text @click="addItem">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  active: Boolean,
});

const emit = defineEmits(["update:active", "save"]);

const newItemText = ref("");

const dialogModel = computed({
  get: () => props.active,
  set: (value) => emit("update:active", value),
});

const addItem = () => {
  emit("save", newItemText.value);
  newItemText.value = "";
};

const close = () => {
  dialogModel.value = false;
  newItemText.value = "";
};
</script>

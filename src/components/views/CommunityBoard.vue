<template>
  <v-container class="py-16">
    <h1 class="text-4xl font-bold mb-8 text-center">Community Board</h1>

    <!-- Add New Community Item Form -->
    <v-card class="elevation-3 mb-12">
      <v-card-title class="text-2xl">Add New Community Item</v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          v-model="formValid"
          @submit.prevent="addCommunityItem"
        >
          <v-text-field
            v-model="newItem.title"
            label="Title"
            :rules="[(v) => !!v || 'Title is required']"
            required
          ></v-text-field>

          <v-textarea
            v-model="newItem.description"
            label="Description"
            :rules="[(v) => !!v || 'Description is required']"
            required
          ></v-textarea>

          <v-text-field
            v-model="newItem.image"
            label="Image URL"
            :rules="[(v) => isValidURL(v) || 'Enter a valid URL']"
            required
          ></v-text-field>

          <v-text-field
            v-model="newItem.link"
            label="Link URL"
            :rules="[(v) => isValidURL(v) || 'Enter a valid URL']"
            required
          ></v-text-field>

          <v-btn type="submit" color="primary" :disabled="!formValid">
            Add Item
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Community Items Display -->
    <v-row>
      <v-col
        cols="12"
        md="6"
        lg="4"
        v-for="item in communityItems"
        :key="item.id"
      >
        <v-card class="elevation-3">
          <v-img :src="item.image" height="200" alt="Item Image"></v-img>
          <v-card-title>{{ item.title }}</v-card-title>
          <v-card-text>
            <p>{{ item.description }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" :href="item.link" target="_blank"
              >Learn More</v-btn
            >
            <v-spacer></v-spacer>
            <v-btn icon color="red" @click="deleteCommunityItem(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
theme.global.name.value = "light";

// Reactive state for community items
const communityItems = ref([]);

// Reactive state for new community item form
const newItem = ref({
  title: "",
  description: "",
  image: "",
  link: "",
});

// Form validation state
const formValid = ref(false);

// Reference to the form
const form = ref(null);

// Function to validate URLs
const isValidURL = (url) => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-zA-Z0-9\\-\\.]+)\\.([a-zA-Z]{2,5}))|" + // domain name
      "(([0-9]{1,3}\\.){3}[0-9]{1,3}))" + // OR ip (v4) address
      "(\\:[0-9]{1,5})?" + // port
      "(\\/.*)?$",
    "i"
  );
  return pattern.test(url);
};

// Load community items from localStorage on mount
onMounted(() => {
  const storedItems = localStorage.getItem("communityItems");
  if (storedItems) {
    communityItems.value = JSON.parse(storedItems);
  } else {
    // Initialize with sample data if no data in localStorage
    communityItems.value = [
      {
        id: 1,
        title: "Bitcoin Mining Equipment",
        description: "High-performance gas-powered mining rigs available.",
        image: "https://example.com/image1.jpg",
        link: "https://example.com/item1",
      },
      {
        id: 2,
        title: "Peaker Energy Solutions",
        description: "Reliable peaker energy systems for your operations.",
        image: "https://example.com/image2.jpg",
        link: "https://example.com/item2",
      },
      {
        id: 3,
        title: "Well Heads for Sale",
        description: "Quality well heads available at competitive prices.",
        image: "https://example.com/image3.jpg",
        link: "https://example.com/item3",
      },
    ];
    localStorage.setItem(
      "communityItems",
      JSON.stringify(communityItems.value)
    );
  }
});

// Watch for changes in communityItems and update localStorage
watch(
  communityItems,
  (newItems) => {
    localStorage.setItem("communityItems", JSON.stringify(newItems));
  },
  { deep: true }
);

// Function to add a new community item
const addCommunityItem = () => {
  if (!formValid.value) return;

  const newCommunityItem = {
    id: Date.now(),
    title: newItem.value.title,
    description: newItem.value.description,
    image: newItem.value.image,
    link: newItem.value.link,
  };

  communityItems.value.push(newCommunityItem);

  // Reset form fields
  newItem.value = {
    title: "",
    description: "",
    image: "",
    link: "",
  };

  // Reset form validation
  form.value.reset();
};

// Function to delete a community item by ID
const deleteCommunityItem = (id) => {
  communityItems.value = communityItems.value.filter((item) => item.id !== id);
};
</script>

<style scoped>
/* Optional: Add specific styles for the Community Board */

.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: scale(1.02);
}

.v-card-title {
  background-color: #f5f5f5;
}

.v-card-actions {
  display: flex;
  align-items: center;
}
</style>

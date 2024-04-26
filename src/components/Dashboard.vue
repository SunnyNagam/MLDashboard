<script setup>
import { ref, computed } from "vue";
import { useApi } from "@/useAPI.js";
import TodoListCard from "@/components/TodoListCard.vue";
import Chat from "@/components/Chat.vue";

const { setApiKey, getApiKey } = useApi();
const enteredApiKey = ref("");
const apiKeyModalVisible = ref(false);
const todo = ref({ Now: [{ text: "Loading...", id: "..." }] });
const calendarUrl = computed(
  () =>
    "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FDenver&bgcolor=%23ffffff&showTitle=0&showTz=0&showPrint=0&src=c3VubnluYWdhbTFAZ21haWwuY29t&src=MTc1Mzg0ZTlkZGQ0MTliOGMyMDgwNTk4MDc5Y2E1N2Q5NzVmOWQzNjkzNWI3OGRlMmIzNDRlZGIzNjkxOTZjZEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4uY2FuYWRpYW4ub2ZmaWNpYWwjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&src=ZW4udXNhI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%23039BE5&color=%23616161&color=%2333B679&color=%230B8043"
);

async function fetchTodoData() {
  try {
    const response = await fetch(
      "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/fetch",
      {
        headers: {
          "X-Api-Key": getApiKey(),
        },
      }
    );
    const data = await response.json();
    todo.value = data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function getTodoTexts(todoItems) {
  return todoItems
    .reduce((acc, item) => {
      acc.push(item.text);
      if (item.subTasks) {
        acc.push(...item.subTasks.map((subTask) => `- ${subTask.text}`));
      }
      acc.push("");
      return acc;
    }, [])
    .join("\n");
}

fetchTodoData();

const chatContext = computed(
  () =>
    "Use the following information only if helpful: Items on user's todo list (with steps): \n\n" +
    getTodoTexts(todo.value.Now)
);
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="10">
        <h1 class="text-6xl font-bold mb-4">
          <v-icon @click="apiKeyModalVisible = true"
            >mdi-white-balance-sunny</v-icon
          >
          Sunny's Dashboard
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="15" md="7">
        <TodoListCard title="Now" />
        <TodoListCard title="Soon" :collapsed="true" />
        <TodoListCard title="Eventually" :collapsed="true" />
      </v-col>
      <v-col cols="15" md="5">
        <Chat :context="chatContext" />
      </v-col>
    </v-row>
    <iframe
      :src="calendarUrl"
      style="border: solid 1px #777"
      width="800"
      height="600"
      frameborder="0"
      scrolling="no"
      class="mt-6"
    ></iframe>
  </v-container>
  <v-dialog v-model="apiKeyModalVisible" persistent max-width="290">
    <v-card>
      <v-card-title class="text-h6">Enter API Key</v-card-title>
      <v-card-text>
        <v-text-field v-model="enteredApiKey" label="API Key" type="password" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="apiKeyModalVisible = false">Close</v-btn>
        <v-btn
          @click="
            setApiKey(enteredApiKey);
            apiKeyModalVisible = false;
          "
          >Submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

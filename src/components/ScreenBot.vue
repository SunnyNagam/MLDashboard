<script setup>
import { ref } from "vue";
import { useDisplayMedia } from "@vueuse/core";
import { GoogleGenerativeAI } from "@google/generative-ai";

const { stream, start, stop, enabled } = useDisplayMedia();
const message = ref(
  "Say 'ALERT' if you see someone smiling, otherwise describe what you see without using the word 'ALERT'"
);
const screenshotInterval = ref(null);
const loading = ref(false);
const history = ref([]);
const apiKey = ref(localStorage.getItem("openrouter_api_key") || "");
const dialog = ref(false);
const webcamStream = ref(null);
const isWebcamEnabled = ref(false);
const screenshotFrequency = ref(5);
let genAI = new GoogleGenerativeAI(apiKey.value);
let model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

const startScreenSharing = async () => {
  try {
    await start();
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: message.value,
    });
    startTakingScreenshots();
  } catch (error) {
    console.error("Error starting screen sharing:", error);
  }
};

const stopScreenSharing = () => {
  stop();
  stopTakingScreenshots();
};

const startTakingScreenshots = () => {
  screenshotInterval.value = setInterval(
    takeScreenshot,
    screenshotFrequency.value * 1000
  ); // Take a screenshot every 5 seconds
};

const stopTakingScreenshots = () => {
  clearInterval(screenshotInterval.value);
};

const takeScreenshot = () => {
  if (!stream.value) return;

  const video = document.createElement("video");
  video.srcObject = stream.value;
  video.play();

  video.onloadeddata = () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const screenshot = canvas.toDataURL("image/png");
    sendToApi(screenshot);
  };
};

const startWebcam = async () => {
  try {
    webcamStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    isWebcamEnabled.value = true;
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: message.value,
    });
    startTakingWebcamScreenshots();
  } catch (error) {
    console.error("Error starting webcam:", error);
  }
};

const stopWebcam = () => {
  if (webcamStream.value) {
    webcamStream.value.getTracks().forEach((track) => track.stop());
    webcamStream.value = null;
    isWebcamEnabled.value = false;
    stopTakingScreenshots();
  }
};

const startTakingWebcamScreenshots = () => {
  screenshotInterval.value = setInterval(
    takeWebcamScreenshot,
    screenshotFrequency.value * 1000
  ); // Take a screenshot every 5 seconds
};

const takeWebcamScreenshot = () => {
  if (!webcamStream.value) return;

  const video = document.createElement("video");
  video.srcObject = webcamStream.value;
  video.play();

  video.onloadeddata = () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const screenshot = canvas.toDataURL("image/png");
    sendToApi(screenshot);
  };
};

const sendToApi = async (screenshot) => {
  loading.value = true;
  try {
    const prompt = message.value;
    const image = {
      inlineData: {
        data: screenshot.split(",")[1], // Extract base64 data from data URL
        mimeType: "image/png",
      },
    };

    const result = await model.generateContent([prompt, image]);
    const data = result.response.text();
    console.log("API Response:", data);
    history.value.unshift({
      // Reverse order of history
      message: message.value,
      screenshot,
      response: data,
      timestamp: new Date().toLocaleString(),
    });
    if (data.includes("ALERT")) {
      const userConfirmed = window.confirm("ALERT PHRASE ACTIVATED");
      if (!userConfirmed) {
        return;
      }
      stopScreenSharing();
      stopWebcam();
      console.log("Alert phrase detected, stopping screen sharing and webcam.");
    }
  } catch (error) {
    console.error("Error sending data to API:", error);
  } finally {
    loading.value = false;
  }
};

const openSettings = () => {
  dialog.value = true;
};

const saveApiKey = () => {
  localStorage.setItem("openrouter_api_key", apiKey.value);
  genAI.setApiKey(apiKey.value);
  dialog.value = false;
};

const clearHistory = () => {
  history.value = [];
};

const exportHistory = () => {
  const a = document.createElement("a");
  const file = new Blob(
    [
      JSON.stringify(
        history.value.map((item) => ({
          message: item.message,
          response: item.response,
          timestamp: item.timestamp,
        }))
      ),
    ],
    {
      type: "text/plain",
    }
  );
  a.href = URL.createObjectURL(file);
  a.download = "screenbot-history.json";
  a.click();
};
</script>

<template>
  <v-container class="mx-auto max-w-screen-md">
    <div class="flex flex-col items-center mb-4">
      <div class="flex flex-col items-center mb-4">
        <h1 class="text-h2 font-bold mb-2">
          <h1 class="text-h2 font-bold mb-2">Surveillance Bot</h1>
        </h1>
        <h2 class="text-subtitle-1 mb-4">
          Enter a prompt to accompany screenshare or webcam periodic captures to
          a M-LLM. History of observations exportable as json. Responding with
          "ALERT" will trigger a browser alert notification event which can be
          triggered in the background. Gemini Flash API free tier provides
          15/min 1500/day (2hrs of 5 sec/snap/day). Examples:
        </h2>
        <ul class="text-subtitle-1 mb-4">
          <li>
            "If you see a person in the background, respond with 'ALERT',
            otherwise respond with nothing."
          </li>
          <li>
            "If the download on my screen is complete, respond with 'ALERT',
            otherwise respond with nothing."
          </li>
          <li>
            "Describe what you see in detail. Catagorize screen/webcam into
            'playing', 'outside', or 'social media'."
          </li>
        </ul>
      </div>
      <v-text-field
        v-model="message"
        label="Enter your message"
        dense
        outlined
        class="mb-4 w-full"
      ></v-text-field>
      <v-text-field
        v-model="screenshotFrequency"
        label="Screenshot Frequency (seconds)"
        dense
        outlined
        class="mb-4 w-full"
        type="number"
        min="5"
      ></v-text-field>
      <v-row align="center" class="my-4">
        <v-btn @click="startScreenSharing" :disabled="enabled"
          >Start Screen Sharing</v-btn
        >
        <v-btn @click="stopScreenSharing" :disabled="!enabled"
          >Stop Screen Sharing</v-btn
        >
        <v-btn @click="startWebcam" :disabled="isWebcamEnabled"
          >Start Webcam</v-btn
        >
        <v-btn @click="stopWebcam" :disabled="!isWebcamEnabled"
          >Stop Webcam</v-btn
        >
        <v-btn @click="openSettings">Settings</v-btn>
      </v-row>
      <v-progress-linear
        v-if="loading"
        indeterminate
        class="mx-auto"
        size="64"
      ></v-progress-linear>
      <video v-if="stream" :srcObject="stream" autoplay></video>
      <div v-if="isWebcamEnabled" class="mb-4">
        <video :srcObject="webcamStream" autoplay></video>
      </div>
    </div>
    <div v-if="history.length" class="mt-4">
      <h2 class="text-h4 font-bold mb-2">Last Response:</h2>
      <p>{{ history[0].response }}</p>
    </div>
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title class="headline">Settings</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="apiKey"
              label="Google Gemini API Key"
              outlined
              hint="Enter your Google Gemini API key"
            ></v-text-field>
            <v-btn @click="saveApiKey">Save API Key</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div class="mt-8">
      <h2 class="text-h4 font-bold mb-4">History</h2>
      <v-btn @click="clearHistory">Clear History</v-btn>
      <v-btn @click="exportHistory">Export History</v-btn>
      <v-list>
        <v-list-item v-for="(item, index) in history" :key="index" class="mb-4">
          <v-list-item-title class="font-semibold"
            >Message: {{ item.message }}</v-list-item-title
          >
          <h3 class="text-subtitle-1 mt-2 bg-grey-50">
            Response: {{ item.response }}
          </h3>
          <h3 class="text-subtitle-1 mt-2 bg-grey-50">
            Timestamp: {{ item.timestamp }}
          </h3>
          <img
            :src="item.screenshot"
            alt="Screenshot"
            class="mt-2"
            style="max-width: 100%; border: 1px solid #ccc"
          />
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

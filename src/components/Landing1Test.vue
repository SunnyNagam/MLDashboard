<template>
  <v-app light>
    <v-toolbar class="bg-white">
      <v-toolbar-side-icon>
        <img :src="imageLink.logo" alt="ASSK Logo" class="h-16" />
      </v-toolbar-side-icon>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat>About Us</v-btn>
        <v-btn flat>Contact Us</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-main>
      <v-parallax :src="imageLink.sub_main" height="600px">
        <v-container
          class="d-flex flex-column align-center justify-center text-white"
          fill-height
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 60%;
          "
        >
          <h1
            class="mb-4 text-5xl font-black text-center"
            style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
          >
            ASSK
          </h1>
          <h1
            class="mb-4 text-3xl font-black text-center"
            style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
          >
            Leading Oil and Gas Equipment Supplier
          </h1>
          <v-btn
            class="bg-blue-500 text-white mt-6"
            rounded="xl"
            size="large"
            href="https://www.assk.ca/"
          >
            View Our Product Inventory
          </v-btn>
        </v-container>
      </v-parallax>

      <v-container class="my-10">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold">About Us</h2>
            <p class="subheading">
              ASSK is dedicated to supplying top-quality oil and gas equipment
              in Alberta.
            </p>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <v-card class="elevation-0 bg-transparent text-center">
              <v-icon x-large class="text-blue-400 mb-4">engineering</v-icon>
              <h3 class="headline">Our Expertise</h3>
              <p>
                With years of experience, ASSK ensures the highest standards in
                equipment supply for the oil and gas sector.
              </p>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <v-card class="elevation-0 bg-transparent text-center">
              <v-icon x-large class="text-blue-400 mb-4">security</v-icon>
              <h3 class="headline">Safety First</h3>
              <p>
                Safety is our priority. We provide equipment that meets all
                safety regulations and standards.
              </p>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <v-card class="elevation-0 bg-transparent text-center">
              <v-icon x-large class="text-blue-400 mb-4">local_shipping</v-icon>
              <h3 class="headline">Reliable Delivery</h3>
              <p>
                We ensure timely delivery of equipment to keep your operations
                running smoothly.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-parallax :src="imageLink.main" height="380px">
        <v-container
          class="d-flex flex-column align-center justify-center text-white"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 60%;
          "
        >
          <h2
            class="text-white text-2xl font-bold mb-3 text-center"
            style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
          >
            Our Goals
          </h2>
          <p
            class="text-white text-center"
            style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
          >
            At ASSK, our goal is to provide exceptional service and top-notch
            equipment to the oil and gas industry, ensuring efficiency, safety,
            and reliability.
          </p>
        </v-container>
      </v-parallax>

      <v-container class="my-10">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold">Contact Us</h2>
            <p>
              We are here to assist you with all your oil and gas equipment
              needs. Fill in your email below and we will get in touch with you
              soon.
            </p>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="elevation-0 text-center bg-transparent">
              <v-card-text>
                <v-form v-model="valid">
                  <v-text-field
                    v-model="email"
                    :rules="emailRules"
                    label="Email address"
                    required
                  ></v-text-field>
                  <v-textarea
                    v-model="message"
                    label="Your Message"
                    rows="3"
                    required
                  ></v-textarea>
                  <v-btn
                    class="bg-blue-500 text-white"
                    :disabled="!valid"
                    large
                    @click="subscribe"
                  >
                    Contact Us
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-container>
        <v-layout class="d-flex align-center justify-center">
          <v-col class="text-center">
            <div class="d-flex justify-center">
              <img
                :src="imageLink.logo"
                alt="ASSK Logo"
                class="mb-4 h-16"
                style="z-index: -1"
              />
            </div>
            <h2 class="headline font-bold">
              Copyright © 2024 ASSK Inc. All rights reserved.
            </h2>
          </v-col>
        </v-layout>
      </v-container>
    </v-main>
    <ScrollingFeed />
  </v-app>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useTheme } from "vuetify";
import ScrollingFeed from "./ScrollingFeed.vue"; // Adjust the path as needed

const theme = useTheme();
theme.global.name.value = "light";

const state = reactive({
  email: "",
  message: "",
  valid: false,
  emailRules: [
    (v) => !!v || "E-mail is required",
    (v) =>
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
      "E-mail must be valid",
  ],
});

const subscribe = () => {
  // Add your subscription logic here
  console.log("Subscribed with", state.email, state.message);
};

const imageLink = reactive({
  main: "https://app.theironhub.com/assets/header-bg-6bf202e71c42d69cefaa48f8891f177d0e21e55dd6ce753815b5b4b3ab11fa54.jpg",
  sub_main:
    "https://app.theironhub.com/assets/themes/assk-inc/banner-0cb61e5e11b120d4975eb23bf5e0963384cc6e0d6ef7c6755a2bec750aa02e3e.jpg",
  logo: "https://app.theironhub.com/assets/themes/assk-inc/logo-white-f4666eb021d8d335e4d376f32d83f545e80fe1d2ff676335b0e5cdbb227ead2c.png",
  social_cover:
    "https://app.theironhub.com/assets/themes/assk-inc/banner-0cb61e5e11b120d4975eb23bf5e0963384cc6e0d6ef7c6755a2bec750aa02e3e.jpg",
});
</script>

<style scoped>
.headline {
  font-weight: 700;
}

.text-white {
  color: #fff;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.bg-blue-darken-2 {
  background-color: #1e3a8a;
}

.text-center {
  text-align: center;
}
</style>

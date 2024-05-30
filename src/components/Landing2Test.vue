<template>
  <v-app light>
    <v-toolbar class="bg-white">
      <v-toolbar-side-icon>
        <img :src="imageLink.logo" alt="ASSK Logo" class="h-16" />
      </v-toolbar-side-icon>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn href="https://www.assk.ca">Inventory</v-btn>
        <v-btn href="https://www.assk.ca">Contact Us</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-main>
      <!-- Hero Section -->
      <v-parallax :src="imageLink.sub_main" height="600px">
        <v-container
          class="d-flex flex-column align-center justify-center text-white"
          fill-height
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 50%;
          "
        >
          <h1
            class="mb-4 text-5xl font-black text-center"
            style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
          >
            ASSK
          </h1>
          <h2 class="mb-4 text-3xl font-black text-center">
            Leading Oil and Gas Equipment Supplier
          </h2>
          <v-btn
            class="bg-blue-500 text-white mt-6"
            rounded="xl"
            size="large"
            href="https://www.assk.ca/"
          >
            Start Shopping Now
          </v-btn>
        </v-container>
      </v-parallax>

      <!-- Features Section -->
      <v-container class="my-10 py-10" style="background: #f9f9f9">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl mb-3">About Us</h2>
            <p class="subheading">
              ASSK is dedicated to supplying top-quality oil and gas equipment
              in Alberta. Discover the advantages of choosing ASSK for your oil
              and gas equipment needs.
            </p>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <v-card class="elevation-2 text-center">
              <v-card-text>
                <h3 class="headline mb-2">Expertise</h3>
                <p>
                  With years of experience, ASSK ensures the highest standards
                  in equipment supply for the oil and gas sector.
                </p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <v-card class="elevation-2 text-center">
              <v-card-text>
                <h3 class="headline mb-2">Safety First</h3>
                <p>
                  Safety is our priority. We provide equipment that meets all
                  safety regulations and standards.
                </p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <v-card class="elevation-2 text-center">
              <v-card-text>
                <h3 class="headline mb-2">Reliable Delivery</h3>
                <p>
                  We ensure timely delivery of equipment to keep your operations
                  running smoothly.
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Testimonials Section -->
      <v-container class="my-10 py-10" style="background: #fff">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl mb-3">Testimonials</h2>
            <p class="subheading">
              Hear what our satisfied clients have to say about us.
            </p>
          </v-col>
          <v-col cols="12" md="6" class="mb-6">
            <v-card class="elevation-2">
              <v-card-text>
                <p>
                  "ASSK provided top-notch equipment and their customer service
                  was excellent. Highly recommend!"
                </p>
                <footer class="blockquote-footer">
                  Jane Doe, CEO of OilCo
                </footer>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" class="mb-6">
            <v-card class="elevation-2">
              <v-card-text>
                <p>
                  "Reliable delivery and high-quality products. ASSK is our
                  go-to supplier for all our equipment needs."
                </p>
                <footer class="blockquote-footer">
                  John Smith, Operations Manager at EnergyInc
                </footer>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-parallax :src="imageLink.main" height="470px">
        <v-container class="my-10 py-10 text-white">
          <v-row justify="center">
            <v-col cols="12" class="text-center mb-6">
              <h2 class="headline font-bold text-4xl mb-3">Our Clients</h2>
              <p>We are trusted by top companies in the industry.</p>
            </v-col>
            <v-col cols="12" class="text-center">
              <v-row justify="center">
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon">fab fa-apple</v-icon>
                </v-col>
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon">fab fa-google</v-icon>
                </v-col>
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon">fab fa-amazon</v-icon>
                </v-col>
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon"
                    >fab fa-microsoft</v-icon
                  >
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon"
                    >fab fa-facebook-f</v-icon
                  >
                </v-col>
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon">fab fa-twitter</v-icon>
                </v-col>
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon"
                    >fab fa-linkedin-in</v-icon
                  >
                </v-col>
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon"
                    >fab fa-instagram</v-icon
                  >
                </v-col>
              </v-row>
              <v-row justify="center">
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon">fab fa-youtube</v-icon>
                </v-col>
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon"
                    >fab fa-backward"></v-icon
                  >
                </v-col>
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon"
                    >fab fa-snapchat-ghost</v-icon
                  >
                </v-col>
                <v-col cols="3" md="2" class="mb-4">
                  <v-icon x-large class="hoverable-icon">fab cc-paypal</v-icon>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-parallax>

      <!-- FAQ Section -->
      <v-container class="my-10 py-10" style="background: #f9f9f9">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl">
              Frequently Asked Questions
            </h2>
          </v-col>
          <v-col cols="12" md="8">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title
                  >What services do you offer?</v-expansion-panel-title
                >
                <v-expansion-panel-text>
                  We offer a wide range of oil and gas equipment supplies
                  including engineering, safety, and delivery services.
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title
                  >How can I contact customer support?</v-expansion-panel-title
                >
                <v-expansion-panel-text>
                  You can contact our customer support team via the contact form
                  on our website or call us at (123) 456-7890.
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title
                  >Do you offer international shipping?</v-expansion-panel-title
                >
                <v-expansion-panel-text>
                  Yes, we provide international shipping to various countries.
                  Please contact us for more details.
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-container>

      <!-- Contact Section -->
      <v-container class="my-10 py-10" style="background: #f9f9f9">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl mb-3">Contact Us</h2>
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
                    rounded="lg"
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

      <!-- Follow Us Section -->
      <v-parallax :src="imageLink.social_cover" height="150px">
        <v-container class="d-flex flex-column align-center justify-center">
          <h2 class="text-white text-xl font-bold text-center mb-8">
            Follow us on social media:
          </h2>
          <v-row justify="center">
            <v-btn icon class="mx-2">
              <v-icon x-large>fab fa-facebook-f</v-icon>
            </v-btn>
            <v-btn icon class="mx-2">
              <v-icon x-large>fab fa-twitter</v-icon>
            </v-btn>
            <v-btn icon class="mx-2">
              <v-icon x-large>fab fa-linkedin-in</v-icon>
            </v-btn>
          </v-row>
        </v-container>
      </v-parallax>

      <!-- Footer Section -->
      <v-container>
        <v-layout class="d-flex align-center justify-center">
          <v-col class="text-center">
            <div class="d-flex justify-center">
              <img :src="imageLink.logo" alt="ASSK Logo" class="mb-4 h-16" />
            </div>
            <h2 class="headline font-bold">
              Copyright © 2024 ASSK Inc. All rights reserved.
            </h2>
            <v-row justify="center" class="mt-4">
              <v-col cols="12" md="4">
                <v-list>
                  <v-list-item>
                    <v-list-item-content>Privacy Policy</v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>Terms of Service</v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="4">
                <v-list>
                  <v-list-item>
                    <v-list-item-content>About Us</v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>Contact Us</v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
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

const newsletterState = reactive({
  email: "",
  valid: false,
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

.blockquote-footer {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.7);
  margin-top: 1rem;
}

.overlay {
  background: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 10px;
}

.hoverable-icon {
  transition: transform 0.3s, color 0.3s;
}
.hoverable-icon:hover {
  transform: scale(2);
  color: #44cd48; /* Change to desired hover color */
}
</style>

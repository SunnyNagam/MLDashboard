<template>
  <!-- Enhanced Landing Page -->
  <v-app-bar light scroll-behavior="hide">
    <!-- Hamburger Icon for Mobile -->
    <v-app-bar-nav-icon @click="toggleDrawer" class="d-md-none"></v-app-bar-nav-icon>
    <v-img :src="imageLink.logo" alt="ASSK Logo"></v-img>
    <v-spacer></v-spacer>
    <!-- Tabs for Desktop -->
    <v-tabs v-model="activeTab" background-color="transparent" slider-color="primary" align-with-title class="d-none d-md-flex">
      <v-tab href="https://www.assk.ca/">View Marketplace</v-tab>
      <v-tab @click="sourceEquipmentDialog = true">Source Equipment</v-tab>
      <v-tab @click="sellEquipmentDialog = true">Sell Your Equipment</v-tab>
      <v-tab @click="financingDialog = true">Financing Options</v-tab>
      <!-- <v-tab @click="navigateTo('community-board')">Community Board</v-tab> -->
    </v-tabs>
  </v-app-bar>

  <!-- Navigation Drawer for Mobile -->
  <v-navigation-drawer v-model="drawer" app temporary class="d-md-none">
    <v-list>
      <v-list-item href="https://www.assk.ca/">
        <v-list-item-title>View Marketplace</v-list-item-title>
      </v-list-item>
      <v-list-item @click="sourceEquipmentDialog = true">
        <v-list-item-title>Source Equipment</v-list-item-title>
      </v-list-item>
      <v-list-item @click="sellEquipmentDialog = true">
        <v-list-item-title>Sell Your Equipment</v-list-item-title>
      </v-list-item>
      <v-list-item @click="financingDialog = true">
        <v-list-item-title>Financing Options</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- Hero Section -->
  <v-parallax :src="bannerImg" height="100vh" id="hero-banner">
    <div class="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>
    <v-container class="fill-height d-flex align-center justify-center">
      <v-row align="center" justify="center">
        <v-col cols="12" md="12" class="text-center animate-on-scroll">
          <h1 class="text-h1 font-weight-bold text-white mb-4 text-shadow hero-title">ASSK Inc.</h1>
          <h3 class="text-h4 font-weight-light text-white mb-6 hero-subtitle">Leading Oil and Gas Equipment Supplier</h3>
          <v-btn color="secondary" size="x-large" rounded="pill" class="px-8 py-2 hero-cta my-4" href="https://www.assk.ca/" :ripple="false" elevation="4">
            View Our Marketplace
            <v-icon right class="ml-2">mdi-arrow-right</v-icon>
          </v-btn>
          <v-row justify="center" class="mt-8">
            <v-col cols="auto">
              <v-btn color="teal" size="large" rounded="pill" class="px-8 py-2 hero-cta mx-2" @click="sellEquipmentDialog = true" :ripple="false" elevation="4">
                Sell Your Equipment
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn color="teal" size="large" rounded="pill" class="px-8 py-2 hero-cta mx-2" @click="financingDialog = true" :ripple="false" elevation="4">
                Financing Options
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn
                color="teal"
                size="large"
                rounded="pill"
                class="px-8 py-2 hero-cta mx-2"
                @click="sourceEquipmentDialog = true"
                :ripple="false"
                elevation="4"
              >
                Source Equipment
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-parallax>

  <!-- About Section -->
  <v-container fluid class="py-16 bg-gray-100" id="about">
    <v-row align="center">
      <v-col cols="12" md="6">
        <v-img :src="imageLink.main" alt="About ASSK" height="400"></v-img>
      </v-col>
      <v-col cols="12" md="6" class="text-center">
        <h2 class="text-3xl font-bold mb-8">About ASSK Inc.</h2>
        <p class="text-xl font-semibold mb-0">Let ASSK SELL & SOURCE your equipment and OCTG needs</p>

        <p class="text-lg font-semibold mb-8">- Freeing time for you to focus on core initiatives -</p>

        <div class="text-left max-w-3xl mx-auto">
          <p class="text-lg text-gray-700 mb-4">
            ASSK is committed to supporting transactions that are always fair to the buyer, seller, and broker. With a proven history of providing new, unused,
            reconditioned, and used oil and gas production equipment and OCTG, we deliver the quality you've come to expect.
          </p>

          <p class="text-lg text-gray-700 mb-4">
            Combine this with timely communication, risk-reducing strategies, and a hands-on approach to drive the process forward, and you can count on solid
            results.
          </p>

          <p class="text-lg text-gray-700 mb-4">Let ASSK sell and source your equipment and OCTG needs, and discover the options we bring to the table.</p>

          <p class="text-lg font-semibold text-center mb-4">WHAT HAVE YOU GOT TO LOSE? It costs nothing.</p>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <!-- Services Section -->
  <v-container fluid class="py-16 px-8">
    <h2 class="text-3xl font-bold text-center mb-8 animate-on-scroll">Our Services</h2>
    <v-row>
      <v-col v-for="(service, index) in services" :key="index" cols="12" md="3" class="px-4 d-flex hover:scale-105 transition-transform duration-400">
        <v-card class="elevation-3 pa-6 flex-grow-1 service-card animate-on-scroll d-flex flex-column" :style="{ transitionDelay: `${index * 0.2}s` }">
          <v-icon :color="service.iconColor" size="48" class="mb-4">
            {{ service.icon }}
          </v-icon>
          <h3 class="text-xl font-semibold mb-2">{{ service.title }}</h3>
          <p class="text-body-1 flex-grow-1">{{ service.description }}</p>
          <v-btn v-if="service.action" text :color="service.iconColor" class="mt-6 w-100" @click="service.action.handler">
            {{ service.action.text }}
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="3" class="px-4 d-flex hover:scale-105 transition-transform duration-400">
        <v-card class="elevation-3 pa-6 flex-grow-1 service-card animate-on-scroll" :style="{ transitionDelay: `${index * 0.2}s` }">
          <v-icon color="primary" size="48" class="mb-4" icon="mdi-recycle"></v-icon>
          <h2 class="text-xl font-semibold mb-2">Our Commitment to Sustainability</h2>
          <p class="text-body-1">ASSK Inc. is dedicated to environmental responsibility and sustainability in all our operations.</p>
          <v-row justify="center">
            <v-col cols="auto">
              <v-tooltip
                location="top"
                width="600"
                text="By reusing existing equipment instead of manufacturing new assets, we significantly reduce carbon emissions. Each kilogram of reused steel saves approximately 0.5 kg of CO2 compared to new production. While we take a conservative estimate due to varying material origins, this sustainable approach helps minimize our environmental impact. Though not currently used for carbon credits, we actively monitor and celebrate the CO2 emissions avoided through our surplus equipment sales."
              >
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="mt-4 pb-4">
                    <svg viewBox="0 0 200 200" class="smoke-animation">
                      <!-- Enhanced Gradients -->
                      <defs>
                        <radialGradient id="smokeGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" style="stop-color: rgba(158, 158, 158, 0.9)" />
                          <stop offset="60%" style="stop-color: rgba(158, 158, 158, 0.4)" />
                          <stop offset="100%" style="stop-color: rgba(158, 158, 158, 0)" />
                        </radialGradient>

                        <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color: #4a5568" />
                          <stop offset="50%" style="stop-color: #2d3748" />
                          <stop offset="100%" style="stop-color: #1a202c" />
                        </linearGradient>

                        <linearGradient id="metalGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color: #718096" />
                          <stop offset="50%" style="stop-color: #4a5568" />
                          <stop offset="100%" style="stop-color: #2d3748" />
                        </linearGradient>

                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      <!-- Background Factory Elements -->
                      <g class="factory-background">
                        <!-- Additional Buildings -->
                        <rect x="25" y="120" width="40" height="60" fill="url(#metalGradientLight)" rx="2" opacity="0.9" />
                        <!-- Building Windows -->
                        <rect x="30" y="130" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="30" y="145" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="30" y="160" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="45" y="130" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="45" y="145" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="45" y="160" width="8" height="8" fill="#4a5568" opacity="0.8" />

                        <!-- Center Building -->
                        <rect x="80" y="110" width="45" height="70" fill="url(#metalGradientLight)" rx="2" opacity="0.9" />
                        <!-- Center Building Windows -->
                        <rect x="85" y="120" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="85" y="135" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="85" y="150" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="85" y="165" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="100" y="120" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="100" y="135" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="100" y="150" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="100" y="165" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="115" y="120" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="115" y="135" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="115" y="150" width="8" height="8" fill="#4a5568" opacity="0.8" />
                        <rect x="115" y="165" width="8" height="8" fill="#4a5568" opacity="0.8" />

                        <!-- Right Building -->
                        <rect x="120" y="130" width="35" height="50" fill="url(#metalGradientLight)" rx="2" opacity="0.9" />
                        <!-- Building Windows -->
                        <rect x="125" y="140" width="7" height="7" fill="#4a5568" opacity="0.8" />
                        <rect x="125" y="155" width="7" height="7" fill="#4a5568" opacity="0.8" />
                        <rect x="140" y="140" width="7" height="7" fill="#4a5568" opacity="0.8" />
                        <rect x="140" y="155" width="7" height="7" fill="#4a5568" opacity="0.8" />
                      </g>

                      <!-- Enhanced Smoke Particles -->
                      <g class="smoke-particles left-smoke">
                        <circle v-for="index in 15" :key="'left' + index" class="smoke-particle" cx="20" cy="70" r="6" />
                      </g>

                      <g class="smoke-particles right-smoke">
                        <circle v-for="index in 15" :key="'right' + index" class="smoke-particle" cx="70" cy="70" r="6" />
                      </g>

                      <!-- Main Factory Elements -->
                      <g class="factory-elements" filter="url(#glow)">
                        <!-- Enhanced Factory Base -->
                        <rect x="20" y="180" width="160" height="20" class="factory-base" rx="4" />
                        <rect x="15" y="175" width="170" height="8" fill="#2d3748" rx="2" />

                        <!-- Enhanced Smoke Stacks -->
                        <g class="left-stack">
                          <rect x="40" y="80" width="30" height="100" class="smoke-stack" rx="2" />
                          <rect x="35" y="75" width="40" height="10" class="stack-top" rx="6" />
                          <!-- Stack Details -->
                          <rect x="45" y="90" width="20" height="5" fill="#4a5568" rx="1" />
                          <rect x="45" y="120" width="20" height="5" fill="#4a5568" rx="1" />
                          <rect x="45" y="150" width="20" height="5" fill="#4a5568" rx="1" />
                        </g>

                        <g class="right-stack">
                          <rect x="130" y="80" width="30" height="100" class="smoke-stack" rx="2" />
                          <rect x="125" y="75" width="40" height="10" class="stack-top" rx="6" />
                          <!-- Stack Details -->
                          <rect x="135" y="90" width="20" height="5" fill="#4a5568" rx="1" />
                          <rect x="135" y="120" width="20" height="5" fill="#4a5568" rx="1" />
                          <rect x="135" y="150" width="20" height="5" fill="#4a5568" rx="1" />
                        </g>

                        <!-- Warning Stripes -->
                        <g class="warning-stripes">
                          <rect x="38" y="165" width="34" height="8" fill="#fbbf24" rx="1" />
                          <rect x="128" y="165" width="34" height="8" fill="#fbbf24" rx="1" />
                        </g>
                      </g>
                    </svg>
                  </div>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>

          <div class="cursor-pointer text-center">
            <div>
              <div class="text-4xl font-bold mb-2 text-black">
                <scroll-triggered-animated-number :value="carbonSaved" :duration="3000" :symbol="'kg'" />
              </div>
              <div class="text-lg">Carbon Saved</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Financing Modal -->
  <v-dialog v-model="financingDialog" max-width="1000px">
    <v-card class="pa-6">
      <v-card-title class="text-center position-relative mb-4">
        <h2 class="text-3xl font-bold w-100">Financing Options</h2>
        <v-btn icon="mdi-close" variant="text" @click="financingDialog = false" class="position-absolute" style="right: 2px; top: 0px"></v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="d-flex flex-column align-center">
              <v-icon color="primary" size="48" class="mb-4">mdi-calculator-variant</v-icon>
              <h3 class="text-2xl font-semibold mb-4">Instant Lease Quote</h3>
              <p class="text-gray-700 text-center mb-6">
                Get an instant quote for leasing equipment tailored to your business needs. Our leasing options are designed to be flexible and cost-effective.
              </p>
              <v-btn class="bg-primary" href="https://go.mycreditportal.ca/assk-inc-/robert-siroishka/instant-quote?lang=en" target="_blank">
                Get Lease Quote
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex flex-column align-center">
              <v-icon color="primary" size="48" class="mb-4">mdi-credit-card-outline</v-icon>
              <h3 class="text-2xl font-semibold mb-4">Online Credit Application</h3>
              <p class="text-gray-700 text-center mb-6">
                Apply online for credit easily and quickly to finance your equipment purchase. Our streamlined process ensures a fast and efficient application
                experience.
              </p>
              <v-btn
                class="bg-primary"
                href="https://community.mycreditportal.ca/s/customer-application-form?oid=0055X000000KaVP&vid=001JQ00000Ue4Ez&vname=ASSK%20Inc."
                target="_blank"
              >
                Apply for Credit
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- News & Highlights Section -->
  <v-container class="py-16">
    <h2 class="text-3xl font-bold text-center mb-8">News & Highlights</h2>
    <v-carousel cycle height="500" hide-delimiter-background show-arrows="hover" :show-arrows-on-hover="true">
      <v-carousel-item v-for="(slide, i) in newsSlides" :key="i" :src="slide.image" cover>
        <v-sheet class="fill-height" color="rgba(0, 0, 0, 0.4)">
          <v-container class="fill-height">
            <v-row align="center" justify="center">
              <v-col cols="12" md="8">
                <div class="text-center">
                  <h3 class="text-h4 font-weight-bold text-white mb-4">
                    {{ slide.title }}
                  </h3>
                  <p class="text-subtitle-1 text-white mb-6">
                    {{ slide.description }}
                  </p>
                  <v-btn color="secondary" rounded :to="slide.link"> Read More </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-sheet>
      </v-carousel-item>
    </v-carousel>
  </v-container>

  <!-- Contact Us Section -->
  <v-container class="py-16" id="contact-us">
    <h2 class="text-3xl font-bold text-center mb-8">Contact Us</h2>
    <v-row justify="center">
      <v-card class="elevation-2 pa-6 w-full mx-6">
        <v-card-text>
          <v-form @submit.prevent="submitContactForm" ref="contactForm">
            <v-text-field v-model="contactFormEmail" label="Email Address" type="email" required :rules="emailRules" outlined class="mb-4"></v-text-field>
            <v-textarea v-model="contactFormMessage" label="Your Message" required outlined rows="4" class="mb-4"></v-textarea>
            <Checkbox v-model="isCaptchaVerified" class="mb-4" />
            <v-btn type="submit" color="primary" class="w-full"> Send Message </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" md="5" class="mb-6">
        <v-card class="pa-6 text-center transition-all duration-300 hover:scale-105">
          <v-icon color="primary" size="32" class="mb-4">mdi-phone</v-icon>
          <h3 class="text-xl font-semibold mb-2">Phone</h3>
          <p>(403) 542-2660</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="5" class="mb-6">
        <v-card class="pa-6 text-center transition-all duration-300 hover:scale-105">
          <v-icon color="primary" size="32" class="mb-4">mdi-email</v-icon>
          <h3 class="text-xl font-semibold mb-2">Email</h3>
          <p>sales@assk.ca</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Footer Section -->
  <v-container class="text-center mb-32">
    <v-row>
      <v-col cols="12" md="6" class="mb-4">
        <v-img :src="imageLink.logo" alt="ASSK Logo" height="60"></v-img>
        <p class="mt-2">© 2024 ASSK Inc. All rights reserved.</p>
      </v-col>
      <v-col cols="12" md="6">
        <v-row justify="center">
          <v-col cols="6" sm="6" class="text-center">
            <a href="#privacy" class="mx-2">Privacy Policy</a>
            <a href="#terms" class="mx-2">Terms of Service</a>
          </v-col>
          <v-col cols="6" sm="6" class="text-center">
            <a href="#about" class="mx-2">About Us</a>
            <a href="#contact" class="mx-2">Contact Us</a>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  <ScrollingFeed @settings-updated="handleSettingsUpdate" />

  <!-- Sell Equipment Modal -->
  <v-dialog v-model="sellEquipmentDialog" max-width="800px">
    <v-card class="pa-6">
      <v-card-title class="text-center">
        <h2 class="text-3xl font-bold">Sell Your Equipment</h2>
        <v-btn icon="mdi-close" variant="text" @click="sellEquipmentDialog = false" class="position-absolute" style="right: 8px; top: 8px"></v-btn>
      </v-card-title>
      <v-card-text>
        <p class="text-center mb-8 text-lg">Have surplus equipment? Let ASSK Inc. help you market and sell it.</p>
        <v-form v-model="sellForm.valid" @submit.prevent="submitSellForm">
          <v-text-field
            v-model="sellForm.equipment"
            :rules="equipmentRules"
            label="Basic equipment or OCTG description"
            required
            outlined
            class="mb-4"
          ></v-text-field>
          <v-text-field v-model="sellForm.contactEmail" :rules="emailRules" label="Your Email" required outlined class="mb-4"></v-text-field>
          <v-textarea v-model="sellForm.additionalInfo" label="Additional Information" rows="3" outlined class="mb-4"></v-textarea>
          <Checkbox v-model="isCaptchaVerified" class="mb-4" />
          <v-btn type="submit" color="secondary" block large rounded> Submit Inquiry </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Source Equipment Modal -->
  <v-dialog v-model="sourceEquipmentDialog" max-width="1000px">
    <v-card class="pa-6">
      <v-card-title class="text-center position-relative">
        <h2 class="text-3xl font-bold w-100">Source Equipment</h2>
        <v-btn icon="mdi-close" variant="text" @click="sourceEquipmentDialog = false" class="position-absolute" style="right: 8px; top: 8px"></v-btn>
      </v-card-title>
      <v-card-text>
        <p class="text-center mb-8 text-lg">Not all equipment is listed on the marketplace sites out there,</p>
        <v-form @submit.prevent="submitContactForm" ref="contactForm">
          <v-text-field v-model="contactFormEmail" label="Email Address" type="email" required :rules="emailRules" outlined class="mb-4"></v-text-field>
          <v-textarea
            v-model="contactFormMessage"
            label="Tell us what you are looking for and we'll do the leg work"
            required
            outlined
            rows="4"
            class="mb-4"
          ></v-textarea>
          <Checkbox v-model="isCaptchaVerified" class="mb-4" />
          <v-btn type="submit" color="primary" class="w-full"> Send Message </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useTheme } from "vuetify";
import ScrollingFeed from "./ScrollingFeed.vue";
import { Checkbox, useRecaptchaProvider } from "vue-recaptcha";
import ScrollTriggeredAnimatedNumber from "@/components/ScrollTriggeredAnimatedNumber.vue";
import gsap from "gsap";

import bannerImg from "@/asskAssets/banner2.jpg";

useRecaptchaProvider();

const theme = useTheme();
theme.global.name.value = "light";

// Reactive state for Sell Equipment Form
const sellForm = ref({
  equipment: "",
  contactEmail: "",
  additionalInfo: "",
  valid: false,
});

// Reactive state for Contact Form
const contactFormEmail = ref("");
const contactFormMessage = ref("");

const sellEquipmentDialog = ref(false);
const financingDialog = ref(false);
const sourceEquipmentDialog = ref(false);

// Reactive state for Carbon Meter
const carbonSaved = ref(7500); // Initial number

// Validation Rules
const emailRules = [(v) => !!v || "E-mail is required", (v) => /\S+@\S+\.\S+/.test(v) || "E-mail must be valid"];
const equipmentRules = [(v) => !!v || "Equipment description is required"];

// Handle Sell Equipment Form Submission
const submitSellForm = async () => {
  if (sellForm.value.valid) {
    try {
      const response = await fetch("https://rev6ykipl5.execute-api.us-east-2.amazonaws.com/Prod/sendEmail", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: sellForm.value.contactEmail,
          message: `Equipment Description: ${sellForm.value.equipment}\nAdditional Info: ${sellForm.value.additionalInfo}`,
        }),
      });

      if (response.ok) {
        alert("Inquiry sent successfully!");
        // Reset form
        sellForm.value = {
          equipment: "",
          contactEmail: "",
          additionalInfo: "",
          valid: false,
        };
      } else {
        alert("Failed to send inquiry.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending the inquiry.");
    }
  }
};

// Handle Contact Form Submission
const isCaptchaVerified = ref(false);

const submitContactForm = async () => {
  if (!isCaptchaVerified.value) {
    alert("Please verify the CAPTCHA.");
    return;
  }

  try {
    const response = await fetch("https://rev6ykipl5.execute-api.us-east-2.amazonaws.com/Prod/sendEmail", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: contactFormEmail.value,
        message: contactFormMessage.value,
      }),
    });

    if (response.ok) {
      alert("Message sent successfully!");
      contactFormEmail.value = "";
      contactFormMessage.value = "";
      isCaptchaVerified.value = false;
    } else {
      alert("Failed to send message.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while sending the message.");
  }
};

// Navigation Methods
const navigateTo = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const navigateAndClose = (sectionId) => {
  navigateTo(sectionId);
  drawer.value = false;
};

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

// Drawer State
const drawer = ref(false);

// Image Links
const imageLink = reactive({
  main: "https://app.theironhub.com/assets/header-bg-6bf202e71c42d69cefaa48f8891f177d0e21e55dd6ce753815b5b4b3ab11fa54.jpg",
  sub_main: "https://app.theironhub.com/assets/themes/assk-inc/banner-0cb61e5e11b120d4975eb23bf5e0963384cc6e0d6ef7c6755a2bec750aa02e3e.jpg",
  logo: "https://app.theironhub.com/assets/themes/assk-inc/logo-white-f4666eb021d8d335e4d376f32d83f545e80fe1d2ff676335b0e5cdbb227ead2c.png",
  social_cover: "https://app.theironhub.com/assets/themes/assk-inc/banner-0cb61e5e11b120d4975eb23bf5e0963384cc6e0d6ef7c6755a2bec750aa02e3e.jpg",
});

// News, Updates, and Offers Carousel
const newsSlides = [
  {
    title: "Industry News: Oil Prices Stabilize",
    description: "Recent market trends show oil prices stabilizing, impacting equipment demand.",
    image: "https://ironhub.s3.amazonaws.com/35/listings/48632/images/396459/small/IMG_02331_1721156171079.jpg?1721158548",
    link: "/news/oil-prices-stabilize",
  },
  {
    title: "ASSK Inc. Expands Operations",
    description: "We're excited to announce the opening of our new distribution center.",
    image: "https://app.theironhub.com/assets/themes/assk-inc/recycle-logo-1-f29ad99581c2743d5b0995de1f4441bb7c69411f146cbecdc348daea5caa0e62.png",
    link: "/updates/new-distribution-center",
  },
  {
    title: "Special Offer: Summer Equipment Sale",
    description: "Get up to 20% off on select oil and gas equipment this summer.",
    image: "https://ironhub.s3.amazonaws.com/35/listings/49040/images/402081/small/20240909035256_67f21fb4-ecb1-4e12-ad8d-551b829d9a9b.jpg?1725853976",
    link: "https://www.assk.ca/listings/X5dRP6TIfoe0fwaQugJ3",
  },
];

// Services Data
const services = ref([
  {
    title: "Sales",
    description:
      "Whether you are a producer, part of a procurement department, a broker, or an engineering firm, providing the equipment and OCTG you need is ASSK's top priority.\n\n" +
      "By offering surplus supply or sourcing new equipment and pipe directly from original equipment manufacturers—passing our discounts on to you—ASSK leverages years of strong relationships to streamline the process and help you focus on your core initiatives.",
    icon: "mdi-cogs",
    iconColor: "primary",
  },
  {
    title: "Sourcing",
    description:
      "Thousands of unlisted pieces\n\nNot every piece of equipment is listed publicly on our website or other marketplace listings. We spend the time to source from as many places as can be imagined, including a large list of non-traditional sources so you have the best options to consider.",
    icon: "mdi-source-fork",
    iconColor: "primary",
    action: {
      text: "Try It",
      handler: () => (sourceEquipmentDialog.value = true),
    },
  },
  {
    title: "Listing your equipment",
    description:
      "Need help marketing & selling your equipment?\n\n" +
      "Let ASSK handle the entire process — from site visits, inventory and photos, offering possibly secure storage locations, to marketplace listings and buyer screenings. " +
      "We ensure location confidentiality, screen out unqualified buyers, and manage all inquiries to save you time and hassle, allowing your team to stay focused on core initiatives.\n\n" +
      "When a sale is confirmed, nothing moves without your explicit approval, full field coordination, and payment in full.",
    icon: "mdi-clipboard-list",
    iconColor: "primary",
  },
]);

// Add reactive reference for banner settings
const bannerSettings = ref({
  transparency: 0.7,
  scrollSpeed: 30,
});

// Add handler for settings updates
const handleSettingsUpdate = (settings) => {
  bannerSettings.value = settings;
  if (settings.carbonSaved !== undefined) {
    carbonSaved.value = Number(settings.carbonSaved);
  }
};

// Intersection Observer for Animations
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });

  // Function to animate a single smoke particle
  const animateParticle = (particle, isLeft) => {
    const startX = isLeft ? 25 : 70;
    const startY = -80;

    gsap.fromTo(
      particle,
      {
        opacity: 0.6,
        transformOrigin: "center",
      },
      {
        duration: 2.5,
        opacity: 0.6,
        scale: 1.5,
        y: 10,
        x: startX - 10,
        ease: "power1.in",
        onComplete: () => {
          // Reset position instantly but fade in opacity
          gsap.set(particle, {
            scale: gsap.utils.random(2.5, 3.5),
            y: gsap.utils.random(startY + 0, startY + 30),
            x: gsap.utils.random(startX + 20, startX + 60),
            opacity: 0, // Start fully transparent
          });
          // Fade in opacity gradually
          gsap.to(particle, {
            duration: 2,
            opacity: 0.8,
            //ease: "elastic.out(1, 0.3)", // Bouncy elastic easing
            // Other options:
            // ease: "back.out(1.7)", // Overshoots then settles
            // ease: "bounce.out", // Bounces at the end
            // ease: "circ.out", // Circular motion
            ease: "expo.out", // Exponential slowdown
            //ease: "sine.out", // Smooth sinusoidal
            onComplete: () => {
              animateParticle(particle, isLeft);
            },
          });
        },
      }
    );
  };

  // Animate left smoke stack particles
  document.querySelectorAll(".left-smoke .smoke-particle").forEach((particle, index) => {
    const startX = 25;
    const startY = -80;
    gsap.set(particle, {
      scale: 3,
      y: gsap.utils.random(startY + 0, startY + 30),
      x: gsap.utils.random(startX + 20, startX + 60),
      opacity: 0, // Start fully transparent
    });
    gsap.delayedCall(index * 0.5, () => {
      animateParticle(particle, true);
    });
  });

  // Animate right smoke stack particles
  document.querySelectorAll(".right-smoke .smoke-particle").forEach((particle, index) => {
    const startX = 70;
    const startY = -80;
    gsap.set(particle, {
      scale: 3,
      y: gsap.utils.random(startY + 0, startY + 30),
      x: gsap.utils.random(startX + 20, startX + 60),
      opacity: 0, // Start fully transparent
    });
    gsap.delayedCall(index * 0.5, () => {
      animateParticle(particle, false);
    });
  });
});
</script>

<style scoped>
/* General Styles */
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.bg-gray-100 {
  background-color: #f9fafb;
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hoverable-icon {
  transition: transform 0.3s, color 0.3s;
}
.hoverable-icon:hover {
  transform: scale(1.2);
  color: #44cd48;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .text-5xl {
    font-size: 2.5rem;
  }
  .text-4xl {
    font-size: 2rem;
  }
  .text-3xl {
    font-size: 1.75rem;
  }
}

.bg-gradient-to-b {
  background: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3));
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: clamp(1.2rem, 4vw, 2rem);
}

.hero-cta {
  transition: transform 0.3s ease;
}

.hero-cta:hover {
  transform: translateY(-2px);
}

/* Animation Classes */
.animate-fade-in {
  animation: fadeIn 1s ease forwards;
}

.service-card {
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.service-card p {
  white-space: pre-wrap;
}

.service-card.animate-fade-in {
  opacity: 1;
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 960px) {
  .v-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .service-card {
    margin-bottom: 24px;
  }
}
.smoke-animation {
  width: 200px;
  height: 200px;
  overflow: visible;
  border-radius: 10px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
  background: linear-gradient(180deg, #sky-400 0%, #sky-600 100%);
}

.factory-base {
  fill: url(#metalGradient);
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.2));
}

.smoke-stack {
  fill: url(#metalGradient);
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.stack-top {
  fill: url(#metalGradient);
  filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.2));
}

.smoke-particle {
  fill: url(#smokeGradient);
  opacity: 0.8;
  filter: blur(3px);
}

/* Add new animation for warning stripes */
.warning-stripes rect {
  animation: flash 2s infinite;
}

@keyframes flash {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Enhanced smoke particle effects */
.left-smoke .smoke-particle,
.right-smoke .smoke-particle {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  mix-blend-mode: screen;
}

/* Add subtle hover effect to the entire factory */
.factory-elements {
  transition: transform 0.3s ease;
}

.smoke-animation:hover .factory-elements {
  transform: scale(1.02);
}
</style>

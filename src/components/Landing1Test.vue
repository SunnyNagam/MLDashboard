<template>
  <v-app light>
    <!-- Toolbar -->
    <v-toolbar class="bg-white shadow-none">
      <v-toolbar-title>
        <img :src="imageLink.logo" alt="ASSK Logo" class="h-16" />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="scrollToSection('about')">About Us</v-btn>
      <v-btn text @click="scrollToSection('services')">Services</v-btn>
      <v-btn text @click="scrollToSection('carbon-meter')"
        >Sustainability</v-btn
      >
      <v-btn text @click="scrollToSection('contact')">Contact Us</v-btn>
    </v-toolbar>

    <v-main>
      <!-- Hero Banner -->
      <v-parallax :src="imageLink.sub_main" height="600px">
        <div class="absolute inset-0 bg-black opacity-50"></div>
        <!-- Overlay -->
        <v-container
          class="d-flex flex-column align-center justify-center text-white relative z-10"
          fill-height
        >
          <h1
            class="mb-4 text-5xl font-black text-center"
            style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
          >
            ASSK
          </h1>
          <h2
            class="mb-4 text-3xl font-black text-center"
            style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5)"
          >
            Leading Oil and Gas Equipment Supplier
          </h2>
          <v-btn
            class="bg-blue-500 text-white mt-6 transform hover:scale-105 transition-transform duration-300"
            rounded="xl"
            size="large"
            href="https://www.assk.ca/"
          >
            View Our Marketplace
          </v-btn>
        </v-container>
      </v-parallax>

      <!-- About Us Section -->
      <v-container id="about" class="my-10">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold">About ASSK Inc.</h2>
            <p class="subheading">
              ASSK is dedicated to supplying top-quality oil and gas equipment
              in Alberta. With years of experience, our team is committed to
              customer satisfaction, providing reliable and efficient solutions
              tailored to your needs.
            </p>
          </v-col>
        </v-row>
      </v-container>

      <!-- Services Section -->
      <v-container id="services" class="my-10">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold">Our Services</h2>
            <p class="subheading">
              We offer a comprehensive range of services to meet your oil and
              gas equipment needs.
            </p>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <v-card class="elevation-0 bg-transparent text-center">
              <v-icon x-large class="text-blue-400 mb-4">store</v-icon>
              <h3 class="headline">Equipment Sales</h3>
              <p>
                Explore our extensive inventory of high-quality oil and gas
                equipment tailored to your operational needs.
              </p>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <v-card class="elevation-0 bg-transparent text-center">
              <v-icon x-large class="text-blue-400 mb-4">search</v-icon>
              <h3 class="headline">Equipment Sourcing</h3>
              <p>
                Let us handle the search for specialized equipment, saving you
                time and ensuring you get the best products available.
              </p>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-6">
            <v-card class="elevation-0 bg-transparent text-center">
              <v-icon x-large class="text-blue-400 mb-4">attach_money</v-icon>
              <h3 class="headline">Financing Options</h3>
              <p>
                We provide flexible financing solutions to help you acquire the
                equipment you need without financial strain.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Carbon Meter Section -->
      <v-container id="carbon-meter" class="my-10">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold">Our Commitment to Sustainability</h2>
            <p class="subheading">
              ASSK Inc. is dedicated to environmental responsibility and
              sustainability in all our operations.
            </p>
            <div @click="toggleCarbonInfo" class="cursor-pointer mt-4">
              <div class="flex items-center justify-center">
                <img
                  :src="imageLink.recycledLogo"
                  alt="Recycled Logo"
                  class="h-16 animate-spin-slow mr-4"
                />
                <div>
                  <span class="text-4xl font-bold">{{ carbonSaved }} kg</span>
                  <div class="text-lg">Carbon Saved</div>
                </div>
              </div>
            </div>
            <v-dialog v-model="showCarbonInfo" max-width="500">
              <v-card>
                <v-card-title class="headline">Carbon Meter</v-card-title>
                <v-card-text>
                  Our Carbon Meter represents the amount of carbon emissions we
                  have saved through sustainable practices and the use of
                  eco-friendly equipment. We continuously strive to reduce our
                  environmental footprint and promote sustainability in the oil
                  and gas industry.
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="showCarbonInfo = false">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
      </v-container>

      <!-- Financing Options Section -->
      <v-container class="my-10">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold">Financing Options</h2>
            <p class="subheading">
              We offer a variety of financing solutions to help you acquire the
              equipment you need.
            </p>
          </v-col>
          <v-col cols="12" md="6" class="mb-6">
            <v-card class="elevation-0 bg-transparent text-center p-4">
              <h3 class="headline">Flexible Payment Plans</h3>
              <p>
                Choose from a range of payment plans tailored to fit your budget
                and operational needs.
              </p>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" class="mb-6">
            <v-card class="elevation-0 bg-transparent text-center p-4">
              <h3 class="headline">Trusted Financing Partners</h3>
              <p>
                We partner with leading financial institutions to provide you
                with the best financing options available.
              </p>
              <div class="mt-4 flex justify-center">
                <a href="https://www.partner1.com" target="_blank" class="mx-2">
                  <img
                    src="https://via.placeholder.com/100x50"
                    alt="Partner 1"
                    class="h-12"
                  />
                </a>
                <a href="https://www.partner2.com" target="_blank" class="mx-2">
                  <img
                    src="https://via.placeholder.com/100x50"
                    alt="Partner 2"
                    class="h-12"
                  />
                </a>
                <a href="https://www.partner3.com" target="_blank" class="mx-2">
                  <img
                    src="https://via.placeholder.com/100x50"
                    alt="Partner 3"
                    class="h-12"
                  />
                </a>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Sell Your Equipment Section -->
      <v-container class="my-10">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold">Sell Your Equipment</h2>
            <p class="subheading">
              Have surplus equipment? Sell it through ASSK Inc. and reach a
              wider market.
            </p>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="elevation-0 text-center bg-transparent">
              <v-card-text>
                <v-form v-model="sellValid">
                  <v-text-field
                    v-model="sellForm.name"
                    :rules="[(v) => !!v || 'Name is required']"
                    label="Your Name"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="sellForm.email"
                    :rules="emailRules"
                    label="Email Address"
                    required
                  ></v-text-field>
                  <v-textarea
                    v-model="sellForm.equipment"
                    label="Equipment Description"
                    rows="3"
                    :rules="[(v) => !!v || 'Description is required']"
                    required
                  ></v-textarea>
                  <v-btn
                    class="bg-blue-500 text-white mt-4"
                    :disabled="!sellValid"
                    large
                    @click="sellEquipment"
                  >
                    Submit
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Contact Us Section -->
      <v-container id="contact" class="my-10">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold">Contact Us</h2>
            <p>
              We are here to assist you with all your oil and gas equipment
              needs. Fill in your details below, and we will get in touch with
              you soon.
            </p>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="elevation-0 text-center bg-transparent">
              <v-card-text>
                <v-form v-model="contactValid">
                  <v-text-field
                    v-model="contactForm.email"
                    :rules="emailRules"
                    label="Email Address"
                    required
                  ></v-text-field>
                  <v-textarea
                    v-model="contactForm.message"
                    label="Your Message"
                    rows="3"
                    :rules="[(v) => !!v || 'Message is required']"
                    required
                  ></v-textarea>
                  <v-btn
                    class="bg-blue-500 text-white mt-4"
                    :disabled="!contactValid"
                    large
                    @click="submitContact"
                  >
                    Contact Us
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" class="mt-8">
            <div class="text-left">
              <h3 class="font-bold">Contact Information</h3>
              <p><v-icon small>phone</v-icon> Phone: (123) 456-7890</p>
              <p><v-icon small>email</v-icon> Email: info@assk.ca</p>
              <p>
                <v-icon small>location_on</v-icon> Address: 123 Oil Street,
                Calgary, Alberta
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- News & Highlights Section -->
      <v-container class="my-10">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold">News & Highlights</h2>
          </v-col>
          <v-col cols="12">
            <v-carousel hide-delimiter-background show-arrows>
              <v-carousel-item v-for="(news, index) in newsItems" :key="index">
                <v-img :src="news.image" height="200px">
                  <div
                    class="fill-height d-flex align-end"
                    style="background: rgba(0, 0, 0, 0.5)"
                  >
                    <v-container>
                      <h3 class="white--text">{{ news.title }}</h3>
                      <p class="white--text">{{ news.description }}</p>
                    </v-container>
                  </div>
                </v-img>
              </v-carousel-item>
            </v-carousel>
          </v-col>
        </v-row>
      </v-container>

      <!-- Footer -->
      <v-container>
        <v-layout class="d-flex align-center justify-center py-6">
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

    <!-- Scrolling Feed Component -->
    <ScrollingFeed />
  </v-app>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useTheme } from "vuetify";
import ScrollingFeed from "./ScrollingFeed.vue"; // Adjust the path as needed

// Theme Configuration
const theme = useTheme();
theme.global.name.value = "light";

// Image Links
const imageLink = reactive({
  main: "https://app.theironhub.com/assets/header-bg-6bf202e71c42d69cefaa48f8891f177d0e21e55dd6ce753815b5b4b3ab11fa54.jpg",
  sub_main:
    "https://app.theironhub.com/assets/themes/assk-inc/banner-0cb61e5e11b120d4975eb23bf5e0963384cc6e0d6ef7c6755a2bec750aa02e3e.jpg",
  logo: "https://app.theironhub.com/assets/themes/assk-inc/logo-white-f4666eb021d8d335e4d376f32d83f545e80fe1d2ff676335b0e5cdbb227ead2c.png",
  social_cover:
    "https://app.theironhub.com/assets/themes/assk-inc/banner-0cb61e5e11b120d4975eb23bf5e0963384cc6e0d6ef7c6755a2bec750aa02e3e.jpg",
  recycledLogo:
    "https://app.theironhub.com/assets/themes/assk-inc/recycled-logo.png", // Replace with actual URL
});

// Form Validation Rules
const emailRules = [
  (v) => !!v || "E-mail is required",
  (v) =>
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
    "E-mail must be valid",
];

// Contact Form State
const contactValid = ref(false);
const contactForm = reactive({
  email: "",
  message: "",
});

// Sell Equipment Form State
const sellValid = ref(false);
const sellForm = reactive({
  name: "",
  email: "",
  equipment: "",
});

// Carbon Meter State
const carbonSaved = ref(12345); // Example value, replace with dynamic data if available
const showCarbonInfo = ref(false);

// News Items
const newsItems = [
  {
    title: "New Equipment Arrivals",
    description:
      "Check out our latest range of oil and gas equipment now available in our marketplace.",
    image:
      "https://via.placeholder.com/800x200.png?text=New+Equipment+Arrivals",
  },
  {
    title: "Sustainability Initiatives",
    description:
      "Learn more about our commitment to reducing carbon emissions and promoting sustainability.",
    image:
      "https://via.placeholder.com/800x200.png?text=Sustainability+Initiatives",
  },
  {
    title: "Customer Success Stories",
    description:
      "Read how ASSK Inc. has helped businesses optimize their operations with top-notch equipment.",
    image:
      "https://via.placeholder.com/800x200.png?text=Customer+Success+Stories",
  },
];

// Methods
const subscribe = () => {
  // Add your subscription logic here
  console.log("Subscribed with", contactForm.email, contactForm.message);
};

const sellEquipment = () => {
  // Add your sell equipment logic here
  console.log("Sell Equipment submitted", sellForm);
};

const submitContact = () => {
  // Add your contact form logic here
  console.log("Contact submitted", contactForm);
};

const toggleCarbonInfo = () => {
  showCarbonInfo.value = !showCarbonInfo.value;
};

// Scroll to Section
const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<style scoped>
.headline {
  font-weight: 700;
}

.subheading {
  font-size: 1.125rem;
  color: #4b5563;
}

.text-white {
  color: #fff;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.text-center {
  text-align: center;
}

.cursor-pointer {
  cursor: pointer;
}

.animate-spin-slow {
  animation: spin 10s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .text-5xl {
    font-size: 2.5rem;
  }
  .text-3xl {
    font-size: 1.875rem;
  }
}
</style>

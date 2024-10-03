<template>
  <v-app light>
    <!-- Toolbar -->
    <v-toolbar class="bg-white shadow-none">
      <v-toolbar-title>
        <img :src="imageLink.logo" alt="ASSK Logo" class="h-16" />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <!-- Add this button -->
        <v-btn
          text
          class="hover:bg-blue-500 hover:text-white transition duration-300"
          @click="toggleScrollingFeed"
        >
          {{ showScrollingFeed ? "Hide" : "Show" }} Feed
        </v-btn>
        <v-btn
          text
          class="hover:bg-blue-500 hover:text-white transition duration-300"
          @click="scrollTo('about')"
          >About</v-btn
        >
        <v-btn
          text
          class="hover:bg-blue-500 hover:text-white transition duration-300"
          @click="scrollTo('services')"
          >Services</v-btn
        >
        <v-btn
          text
          class="hover:bg-blue-500 hover:text-white transition duration-300"
          @click="scrollTo('testimonials')"
          >Testimonials</v-btn
        >
        <v-btn
          text
          class="hover:bg-blue-500 hover:text-white transition duration-300"
          @click="scrollTo('financing')"
          >Financing</v-btn
        >
        <v-btn
          text
          class="hover:bg-blue-500 hover:text-white transition duration-300"
          @click="scrollTo('contact')"
          >Contact</v-btn
        >
      </v-toolbar-items>
    </v-toolbar>

    <v-main>
      <!-- Hero Section -->
      <v-parallax :src="imageLink.sub_main" height="100vh">
        <v-row class="fill-height items-center justify-center pb-15">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="text-h1 font-weight-bold text-white mb-6 text-shadow-lg">
              ASSK
            </h1>
            <h2 class="text-h4 font-weight-light text-white mb-8">
              Leading Oil and Gas Equipment Supplier
            </h2>
            <v-btn
              x-large
              color="primary"
              rounded
              class="px-8 py-2 text-lg font-semibold transition-transform duration-300 transform hover:scale-105"
              href="https://www.assk.ca/"
            >
              View Our Marketplace
            </v-btn>
          </v-col>
        </v-row>
      </v-parallax>

      <!-- About ASSK Inc. Section -->
      <v-container class="my-10 py-10 bg-gray-100" id="about">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="text-4xl font-bold mb-3">About ASSK Inc.</h2>
            <p class="max-w-2xl mx-auto text-lg">
              With decades of experience in the oil and gas industry, ASSK Inc.
              stands as a beacon of reliability and excellence. Our core values
              center around quality, integrity, and an unwavering commitment to
              customer satisfaction. We strive to provide top-tier equipment and
              unparalleled support to ensure your operations run smoothly and
              efficiently.
            </p>
          </v-col>
        </v-row>
      </v-container>

      <!-- Services Section -->
      <v-container class="my-10 py-10 bg-white" id="services">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="text-4xl font-bold mb-3">Our Services</h2>
            <p class="max-w-2xl mx-auto text-lg">
              ASSK Inc. offers a comprehensive range of services tailored to
              meet your oil and gas equipment needs.
            </p>
          </v-col>

          <!-- Equipment Sales -->
          <v-col cols="12" md="4" class="mb-6">
            <v-card
              class="elevation-2 text-center p-6 h-full transition-transform duration-300 hover:scale-105"
            >
              <v-icon large class="text-blue-500 my-4">mdi-cogs</v-icon>
              <h3 class="text-xl font-bold mb-2">Equipment Sales</h3>
              <p class="mb-4">
                High-quality oil and gas equipment from trusted manufacturers to
                ensure optimal performance and reliability. Our extensive
                inventory covers a wide range of industry needs.
              </p>
            </v-card>
          </v-col>

          <!-- Equipment Sourcing -->
          <v-col cols="12" md="4" class="mb-6">
            <v-card
              class="elevation-2 text-center p-6 h-full transition-transform duration-300 hover:scale-105"
            >
              <v-icon large class="text-blue-500 my-4">mdi-source-fork</v-icon>
              <h3 class="text-xl font-bold mb-2">Equipment Sourcing</h3>
              <p class="mb-4">
                We handle the sourcing of specialized equipment, saving you time
                and resources by leveraging our extensive network and industry
                expertise. Our global connections ensure we find the right
                equipment for your needs.
              </p>
            </v-card>
          </v-col>

          <!-- Financing Options -->
          <v-col cols="12" md="4" class="mb-6">
            <v-card
              class="elevation-2 text-center p-6 h-full transition-transform duration-300 hover:scale-105"
            >
              <v-icon large class="text-blue-500 my-4">mdi-currency-usd</v-icon>
              <h3 class="text-xl font-bold mb-2">Financing Options</h3>
              <p class="mb-4">
                Flexible financing solutions to help you acquire the equipment
                you need without straining your budget. We offer competitive
                rates and customized payment plans to suit your business
                requirements.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Sustainability Section -->
      <v-container id="carbon-meter" class="my-10 py-10 bg-gray-100">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl mb-3">
              Our Commitment to Sustainability
            </h2>
            <p class="subheading max-w-2xl mx-auto">
              ASSK Inc. is dedicated to environmental responsibility and
              sustainability in all our operations.
            </p>
            <div @click="toggleCarbonInfo" class="cursor-pointer mt-4">
              <div class="flex items-center justify-center">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/041/290/226/original/co2-emission-reduction-green-leaf-logo-icon-free-png.png"
                  alt="CO2 Emission Reduction"
                  class="h-16 mr-4 transition-all duration-300 ease-in-out hover:h-20 animate-spin-slow"
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
                  <v-spacer></v-spacer>
                  <v-btn text @click="showCarbonInfo = false">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
      </v-container>

      <!-- Features Section (Refined as About Us) -->

      <!-- Testimonials Section -->
      <v-container class="my-10 py-10 bg-white" id="testimonials">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl mb-3">Testimonials</h2>
            <p class="subheading max-w-2xl mx-auto">
              Hear what our satisfied clients have to say about us.
            </p>
          </v-col>
          <v-col cols="12" md="6" class="mb-6">
            <v-card class="elevation-2 p-6">
              <v-card-text>
                <p class="italic">
                  "ASSK provided top-notch equipment and their customer service
                  was excellent. Highly recommend!"
                </p>
                <footer class="blockquote-footer mt-4">
                  Jane Doe, CEO of OilCo
                </footer>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" class="mb-6">
            <v-card class="elevation-2 p-6">
              <v-card-text>
                <p class="italic">
                  "Reliable delivery and high-quality products. ASSK is our
                  go-to supplier for all our equipment needs."
                </p>
                <footer class="blockquote-footer mt-4">
                  John Smith, Operations Manager at EnergyInc
                </footer>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Clients Section -->
      <v-container class="my-10 py-10 bg-blue-darken-2 text-white" id="clients">
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
                <v-icon x-large class="hoverable-icon">fab fa-microsoft</v-icon>
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
                <v-icon x-large class="hoverable-icon">fab fa-instagram</v-icon>
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col cols="3" md="2" class="mb-4">
                <v-icon x-large class="hoverable-icon">fab fa-youtube</v-icon>
              </v-col>
              <v-col cols="3" md="2" class="mb-4">
                <v-icon x-large class="hoverable-icon"
                  >fab fa-snapchat-ghost</v-icon
                >
              </v-col>
              <v-col cols="3" md="2" class="mb-4">
                <v-icon x-large class="hoverable-icon">fab fa-paypal</v-icon>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

      <!-- Financing Options Section -->
      <v-container class="my-10 py-10 bg-gray-100" id="financing">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-8">
            <h2 class="text-4xl font-bold mb-4">Financing Options</h2>
            <p class="text-lg text-gray-700 max-w-3xl mx-auto">
              Explore our flexible financing solutions designed to help you
              acquire the equipment you need with ease.
            </p>
          </v-col>

          <v-col cols="12" md="10">
            <v-row justify="center">
              <v-col cols="12" md="6" class="mb-6">
                <v-card
                  class="h-full transition-all duration-300 hover:shadow-lg"
                >
                  <v-card-text class="flex flex-col h-full p-6">
                    <v-icon color="primary" size="48" class="mb-4"
                      >mdi-calculator-variant</v-icon
                    >
                    <h3 class="text-2xl font-semibold mb-4">
                      Instant Lease Quote
                    </h3>
                    <p class="text-gray-600 mb-6 flex-grow">
                      Get an instant quote for leasing equipment tailored to
                      your business needs. Our leasing options are designed to
                      be flexible and cost-effective.
                    </p>
                    <v-btn
                      color="primary"
                      x-large
                      rounded
                      class="text-white font-semibold px-6 py-3 transition-transform duration-200 hover:-translate-y-1"
                      href="https://go.mycreditportal.ca/assk-inc-/robert-siroishka/instant-quote?lang=en"
                      target="_blank"
                    >
                      Get Lease Quote
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6" class="mb-6">
                <v-card
                  class="h-full transition-all duration-300 hover:shadow-lg"
                >
                  <v-card-text class="flex flex-col h-full p-6">
                    <v-icon color="primary" size="48" class="mb-4"
                      >mdi-credit-card-outline</v-icon
                    >
                    <h3 class="text-2xl font-semibold mb-4">
                      Online Credit Application
                    </h3>
                    <p class="text-gray-600 mb-6 flex-grow">
                      Apply online for credit easily and quickly to finance your
                      equipment purchase. Our streamlined process ensures a fast
                      and efficient application experience.
                    </p>
                    <v-btn
                      color="primary"
                      x-large
                      rounded
                      class="text-white font-semibold px-6 py-3 transition-transform duration-200 hover:-translate-y-1"
                      href="https://community.mycreditportal.ca/s/customer-application-form?oid=0055X000000KaVP&vid=001JQ00000Ue4Ez&vname=ASSK%20Inc."
                      target="_blank"
                    >
                      Apply for Credit
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

      <!-- Sell Your Equipment Section -->
      <v-container
        class="my-10 py-10 bg-blue-darken-2 text-white"
        id="sell-equipment"
      >
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl mb-3">
              Sell Your Equipment
            </h2>
            <p class="subheading max-w-2xl mx-auto">
              Have surplus equipment? Let ASSK Inc. help you sell it quickly and
              efficiently.
            </p>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="elevation-0 text-center bg-transparent">
              <v-card-text>
                <v-form
                  v-model="sellForm.valid"
                  @submit.prevent="submitSellForm"
                >
                  <v-text-field
                    v-model="sellForm.equipment"
                    :rules="[(v) => !!v || 'Equipment description is required']"
                    label="Equipment Description"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="sellForm.contactEmail"
                    :rules="emailRules"
                    label="Your Email"
                    required
                  ></v-text-field>
                  <v-textarea
                    v-model="sellForm.additionalInfo"
                    label="Additional Information"
                    rows="3"
                  ></v-textarea>
                  <v-btn
                    type="submit"
                    class="bg-blue-500 text-white mt-4"
                    rounded="lg"
                    large
                  >
                    Submit Inquiry
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Contact Information Section -->
      <v-container class="my-10 py-10 bg-gray-100" id="contact">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="text-4xl font-bold mb-3">Contact Us</h2>
            <p class="text-lg text-gray-700 max-w-2xl mx-auto">
              We are here to assist you with all your oil and gas equipment
              needs. Reach out to us via phone, email, or through the form
              below.
            </p>
          </v-col>

          <!-- Contact Details -->
          <v-col cols="12" md="10">
            <v-row justify="center" class="mb-8">
              <v-col cols="12" sm="4" class="mb-4">
                <v-card
                  class="h-full transition-all duration-300 hover:shadow-lg"
                >
                  <v-card-text class="flex flex-col items-center p-6">
                    <v-icon color="primary" size="48" class="mb-4"
                      >mdi-phone</v-icon
                    >
                    <h3 class="text-xl font-semibold mb-2">Phone</h3>
                    <p class="text-gray-600">(123) 456-7890</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4" class="mb-4">
                <v-card
                  class="h-full transition-all duration-300 hover:shadow-lg"
                >
                  <v-card-text class="flex flex-col items-center p-6">
                    <v-icon color="primary" size="48" class="mb-4"
                      >mdi-email</v-icon
                    >
                    <h3 class="text-xl font-semibold mb-2">Email</h3>
                    <p class="text-gray-600">info@assk.ca</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4" class="mb-4">
                <v-card
                  class="h-full transition-all duration-300 hover:shadow-lg"
                >
                  <v-card-text class="flex flex-col items-center p-6">
                    <v-icon color="primary" size="48" class="mb-4"
                      >mdi-map-marker</v-icon
                    >
                    <h3 class="text-xl font-semibold mb-2">Address</h3>
                    <p class="text-gray-600">
                      1234 Oil & Gas Ave, Alberta, Canada
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Contact Form -->
          <v-col cols="12" md="6" class="mb-6">
            <v-card class="transition-all duration-300 hover:shadow-lg">
              <v-card-text class="p-6">
                <v-form @submit.prevent="submitContactForm">
                  <v-text-field
                    v-model="contactForm.email"
                    label="Email address"
                    type="email"
                    required
                    class="mb-4"
                    outlined
                  ></v-text-field>
                  <v-textarea
                    v-model="contactForm.message"
                    label="Your Message"
                    required
                    class="mb-4"
                    outlined
                    rows="4"
                  ></v-textarea>
                  <div class="text-center">
                    <v-btn
                      type="submit"
                      color="primary"
                      x-large
                      rounded
                      class="px-8 py-3 text-white font-semibold transition-transform duration-200 hover:-translate-y-1"
                    >
                      Contact Us
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- News & Highlights Section -->
      <v-container class="my-10 py-10 bg-white" id="news">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl mb-3">News & Highlights</h2>
            <p class="subheading max-w-2xl mx-auto">
              Stay updated with the latest industry news, company updates, and
              special offers.
            </p>
          </v-col>
          <v-col cols="12" md="10">
            <v-carousel
              cycle
              height="500"
              hide-delimiter-background
              show-arrows="hover"
              :show-arrows-on-hover="true"
            >
              <v-carousel-item
                v-for="(slide, i) in newsSlides"
                :key="i"
                :src="slide.image"
                cover
              >
                <v-sheet class="fill-height" color="rgba(0, 0, 0, 0.3)">
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
                          <v-btn color="primary" rounded :to="slide.link">
                            Read More
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-sheet>
              </v-carousel-item>
            </v-carousel>
          </v-col>
        </v-row>
      </v-container>

      <!-- Follow Us Section -->
      <v-parallax :src="imageLink.social_cover" height="150px">
        <v-container class="d-flex flex-col items-center justify-center">
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
        <v-row class="d-flex align-center justify-center">
          <v-col class="text-center">
            <div class="d-flex justify-center mb-4">
              <img :src="imageLink.logo" alt="ASSK Logo" class="h-16" />
            </div>
            <h2 class="headline font-bold">
              Copyright © 2024 ASSK Inc. All rights reserved.
            </h2>
            <v-row justify="center" class="mt-4">
              <v-col cols="12" md="4">
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <a href="#privacy" class="text-blue-500"
                        >Privacy Policy</a
                      >
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <a href="#terms" class="text-blue-500"
                        >Terms of Service</a
                      >
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="4">
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <a href="#about" class="text-blue-500">About Us</a>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <a href="#contact" class="text-blue-500">Contact Us</a>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Scrolling Feed Component -->
    <ScrollingFeed v-if="showScrollingFeed" />

    <!-- Carbon Meter Info Dialog -->
    <v-dialog v-model="showCarbonInfo" max-width="500">
      <v-card>
        <v-card-title class="headline">Carbon Meter</v-card-title>
        <v-card-text>
          The Carbon Meter represents ASSK Inc.'s ongoing commitment to reducing
          carbon emissions and promoting environmentally responsible practices.
          By continuously monitoring and improving our carbon footprint, we aim
          to contribute positively to the environment and support sustainable
          growth in the oil and gas sector.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showCarbonInfo = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useTheme } from "vuetify";
import ScrollingFeed from "./ScrollingFeed.vue"; // Adjust the path as needed

// Theme setup
const theme = useTheme();
theme.global.name.value = "light";

// Reactive state for Contact Form
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

// Reactive state for Sell Equipment Form
const sellForm = reactive({
  equipment: "",
  contactEmail: "",
  additionalInfo: "",
  valid: false,
});

// Reactive state for Carbon Meter
const showCarbonInfo = ref(false);
const isSpinning = ref(true);
const carbonSaved = ref(7500);
const carbonValue = ref(75); // Example value

// Calculate Carbon Path for SVG (Circular Progress)
const carbonPath = computed(() => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (carbonValue.value / 100) * circumference;
  return `M 100 10 
          A 90 90 0 ${carbonValue.value > 50 ? 1 : 0} 1 ${
    100 + 90 * Math.sin((carbonValue.value * 3.6 * Math.PI) / 180)
  } ${100 - 90 * Math.cos((carbonValue.value * 3.6 * Math.PI) / 180)}`;
});

// Handle subscription
const subscribe = () => {
  if (state.valid) {
    // Add your subscription logic here
    console.log("Subscribed with", state.email, state.message);
    // Reset form
    state.email = "";
    state.message = "";
    state.valid = false;
  }
};

// Handle Sell Equipment Form Submission
const submitSellForm = () => {
  if (sellForm.valid) {
    // Add your form submission logic here
    console.log(
      "Sell Equipment Inquiry:",
      sellForm.equipment,
      sellForm.contactEmail,
      sellForm.additionalInfo
    );
    // Reset form
    sellForm.equipment = "";
    sellForm.contactEmail = "";
    sellForm.additionalInfo = "";
    sellForm.valid = false;
  }
};

// Image Links
const imageLink = reactive({
  main: "https://app.theironhub.com/assets/header-bg-6bf202e71c42d69cefaa48f8891f177d0e21e55dd6ce753815b5b4b3ab11fa54.jpg",
  sub_main:
    "https://app.theironhub.com/assets/themes/assk-inc/banner-0cb61e5e11b120d4975eb23bf5e0963384cc6e0d6ef7c6755a2bec750aa02e3e.jpg",
  logo: "https://app.theironhub.com/assets/themes/assk-inc/logo-white-f4666eb021d8d335e4d376f32d83f545e80fe1d2ff676335b0e5cdbb227ead2c.png",
  social_cover:
    "https://app.theironhub.com/assets/themes/assk-inc/banner-0cb61e5e11b120d4975eb23bf5e0963384cc6e0d6ef7c6755a2bec750aa02e3e.jpg",
});

// News, Updates, and Offers Carousel
const newsSlides = [
  {
    title: "Industry News: Oil Prices Stabilize",
    description:
      "Recent market trends show oil prices stabilizing, impacting equipment demand.",
    image:
      "https://ironhub.s3.amazonaws.com/35/listings/48632/images/396459/small/IMG_02331_1721156171079.jpg?1721158548",
    link: "/news/oil-prices-stabilize",
  },
  {
    title: "ASSK Inc. Expands Operations",
    description:
      "We're excited to announce the opening of our new distribution center.",
    image:
      "https://app.theironhub.com/assets/themes/assk-inc/recycle-logo-1-f29ad99581c2743d5b0995de1f4441bb7c69411f146cbecdc348daea5caa0e62.png",
    link: "/updates/new-distribution-center",
  },
  {
    title: "Special Offer: Summer Equipment Sale",
    description:
      "Get up to 20% off on select oil and gas equipment this summer.",
    image:
      "https://ironhub.s3.amazonaws.com/35/listings/49040/images/402081/small/20240909035256_67f21fb4-ecb1-4e12-ad8d-551b829d9a9b.jpg?1725853976",
    link: "https://www.assk.ca/listings/X5dRP6TIfoe0fwaQugJ3",
  },
];

// Toggle Carbon Info Dialog
const toggleCarbonInfo = () => {
  showCarbonInfo.value = !showCarbonInfo.value;
};

// Scroll to section method
const scrollTo = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const contactForm = ref({
  email: "",
  message: "",
});

const submitContactForm = () => {
  // Handle form submission logic here
  console.log("Form submitted:", contactForm.value);
  // Reset form after submission
  contactForm.value = { email: "", message: "" };
};

// Add this new ref for controlling ScrollingFeed visibility
const showScrollingFeed = ref(false);

// Add this new function to toggle ScrollingFeed visibility
const toggleScrollingFeed = () => {
  showScrollingFeed.value = !showScrollingFeed.value;
};
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

.hoverable-icon {
  transition: transform 0.3s, color 0.3s;
}
.hoverable-icon:hover {
  transform: scale(1.5);
  color: #44cd48; /* Change to desired hover color */
}

/* Custom animation for Carbon Meter SVG */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
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
</style>

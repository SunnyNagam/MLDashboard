<template>
  <v-app light>
    <!-- Navbar -->
    <v-app-bar app elevate-on-scroll class="bg-white">
      <v-container class="d-flex align-center">
        <v-toolbar-title>
          <img :src="logo" alt="BIT Logo" class="h-10" />
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div class="hidden md:flex">
          <v-btn
            v-for="item in menuItems"
            :key="item.text"
            text
            @click="item.action"
            class="text-gray-800 font-medium"
          >
            {{ item.text }}
          </v-btn>
        </div>
        <v-menu offset-y transition="slide-y-transition" class="md:hidden">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-menu</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="item in menuItems"
              :key="item.text"
              @click="item.action"
            >
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-container>
    </v-app-bar>

    <v-main>
      <!-- Hero Section -->
      <v-parallax :src="background2" height="100vh">
        <div class="absolute inset-0 bg-black opacity-10"></div>
        <v-container class="fill-height">
          <v-row align="center" justify="center">
            <v-col cols="12" md="10" class="text-center">
              <h1
                class="text-6xl font-black mb-6 text-white relative z-10 drop-shadow"
              >
                Beltline Innovation Technologies
              </h1>
              <h2
                class="text-4xl font-bold mb-8 text-white relative z-10 drop-shadow"
              >
                We Create
                <span ref="typedTextSpan" class="typed-text"></span>
                <span
                  ref="cursorSpan"
                  class="cursor inline-block w-[3px] bg-white ml-[0.1rem] animate-blink"
                  >&nbsp;</span
                >
              </h2>
              <v-btn
                x-large
                color="primary"
                elevation="2"
                rounded
                @click="scrollToContact"
                class="text-lg font-medium px-8 py-3 relative z-10"
              >
                Get Started
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-parallax>

      <!-- About Us Section -->
      <v-container id="about" class="py-16">
        <v-row justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="text-4xl font-bold mb-6">About Us</h2>
            <p class="text-xl text-gray-700 leading-relaxed mb-12">
              Beltline Innovation Technologies (BIT) is a Calgary-based software
              consulting company specializing in cutting-edge software
              solutions. We collaborate closely with our clients to understand
              their unique needs and transform their visions into reality.
            </p>
            <v-row>
              <v-col v-for="stat in stats" :key="stat.value" cols="12" sm="4">
                <div class="text-4xl font-bold text-primary mb-2">
                  <scroll-triggered-animated-number
                    :value="stat.value"
                    :duration="3000"
                    :symbol="stat.symbol"
                  />
                </div>
                <div class="text-gray-600">{{ stat.label }}</div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

      <!-- Projects Section with Individual Carousels -->
      <v-container
        id="projects"
        ref="projectsSection"
        class="py-16 bg-gray-100 px-15"
        fluid
      >
        <v-row class="text-center mb-12">
          <v-col cols="12">
            <h2 class="text-4xl font-bold mb-4">Our Projects</h2>
            <p class="text-xl text-gray-700">
              Innovative solutions crafted for our clients
            </p>
          </v-col>
        </v-row>
        <v-row v-for="project in projects" :key="project.name" class="mb-16">
          <v-col cols="12" md="7" lg="8">
            <v-carousel
              show-arrows="hover"
              hide-delimiter-background
              cycle
              :interval="3000"
              height="500"
            >
              <v-carousel-item
                v-for="(image, index) in project.images"
                :key="index"
                :src="image"
                cover
              >
              </v-carousel-item>
            </v-carousel>
          </v-col>
          <v-col
            cols="12"
            md="5"
            lg="4"
            class="d-flex flex-column justify-center"
          >
            <h3 class="text-3xl font-bold mb-4">{{ project.name }}</h3>
            <p class="text-xl mb-4">{{ project.tagline }}</p>
            <p class="text-gray-700 mb-6">{{ project.description }}</p>
            <v-btn color="primary" class="align-self-start" rounded
              >View Project</v-btn
            >
          </v-col>
        </v-row>
      </v-container>

      <!-- Services Section -->
      <v-container id="services" class="py-16">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-12">
            <h2 class="text-4xl font-bold mb-4">Our Services</h2>
            <p class="text-xl text-gray-700">Explore our range of expertise</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            v-for="service in services"
            :key="service.title"
            cols="12"
            md="4"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                :elevation="isHovering ? 12 : 2"
                :class="{ 'scale-105': isHovering }"
                height="300"
                class="d-flex flex-col items-center justify-center transition-all duration-300"
              >
                <v-icon
                  size="64"
                  :color="isHovering ? 'primary' : 'gray'"
                  class="mb-4 transition-colors duration-300"
                  >{{ service.icon }}</v-icon
                >
                <h3 class="text-2xl font-bold mb-2">{{ service.title }}</h3>
                <p class="text-center px-4">{{ service.description }}</p>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>

      <!-- Testimonials Section -->
      <v-container class="py-16">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-12">
            <h2 class="text-4xl font-bold mb-4">Client Testimonials</h2>
            <p class="text-xl text-gray-700">What our clients say about us</p>
          </v-col>
          <v-col cols="12" md="10">
            <v-row>
              <v-col
                v-for="testimonial in testimonials"
                :key="testimonial.name"
                cols="12"
                md="6"
                class="mb-8"
              >
                <v-card elevation="2" class="pa-6">
                  <v-card-text>
                    <p class="text-lg mb-4">"{{ testimonial.text }}"</p>
                    <p class="font-medium">{{ testimonial.name }}</p>
                    <p class="text-gray-600">{{ testimonial.position }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

      <!-- FAQ Section -->
      <v-container class="py-16 bg-gray-100">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-12">
            <h2 class="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </v-col>
          <v-col cols="12" md="8">
            <v-expansion-panels>
              <v-expansion-panel v-for="faq in faqs" :key="faq.question">
                <v-expansion-panel-title class="text-lg font-medium">{{
                  faq.question
                }}</v-expansion-panel-title>
                <v-expansion-panel-text class="text-gray-700">{{
                  faq.answer
                }}</v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-container>

      <!-- Contact Section -->
      <v-container id="contact" class="py-16">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-12">
            <h2 class="text-4xl font-bold mb-4">Get In Touch</h2>
            <p class="text-xl text-gray-700">Let's bring your vision to life</p>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-6">
              <v-form v-model="state.valid">
                <v-text-field
                  v-model="state.email"
                  :rules="state.emailRules"
                  label="Email address"
                  required
                ></v-text-field>
                <v-textarea
                  v-model="state.message"
                  label="Your Message"
                  rows="4"
                  required
                ></v-textarea>
                <v-btn
                  color="primary"
                  x-large
                  block
                  @click="subscribe"
                  class="mt-4"
                >
                  Send Message
                </v-btn>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Footer -->
      <v-footer class="bg-gray-900 py-8">
        <v-container>
          <v-row align="center" justify="space-between">
            <v-col cols="12" md="4" class="text-center text-md-left">
              <img :src="logo" alt="BIT Logo" class="h-12 mb-4" />
            </v-col>
            <v-col cols="12" md="4" class="text-center">
              <p class="text-gray-400">
                © {{ new Date().getFullYear() }} Beltline Innovation
                Technologies. All rights reserved.
              </p>
            </v-col>
            <v-col cols="12" md="4" class="text-center text-md-right">
              <v-btn icon color="white" class="mx-2">
                <v-icon>mdi-facebook</v-icon>
              </v-btn>
              <v-btn icon color="white" class="mx-2">
                <v-icon>mdi-twitter</v-icon>
              </v-btn>
              <v-btn icon color="white" class="mx-2">
                <v-icon>mdi-linkedin</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, reactive } from "vue";
import ScrollTriggeredAnimatedNumber from "@/components/ScrollTriggeredAnimatedNumber.vue";
import { useTheme } from "vuetify";

// Import assets
import logo from "@/assets/BITLogoTest.webp";
import background1 from "@/assets/BIT_background1.webp";
import background2 from "@/assets/BIT_background2.webp";
import trademark1 from "@/assets/portfolioImgs/trademark1.png";
import mable1 from "@/assets/portfolioImgs/mable1.png";
import mable2 from "@/assets/portfolioImgs/mable2.png";

// Set theme
const theme = useTheme();
theme.global.name.value = "light";

// Reactive state
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

// Data
const stats = ref([
  { value: 50, symbol: "+", label: "Projects Completed" },
  { value: 98, symbol: "%", label: "Client Satisfaction" },
  { value: 5, symbol: "+", label: "Years of Experience" },
]);

const menuItems = [
  {
    text: "Home",
    action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  },
  {
    text: "About",
    action: () =>
      document.querySelector("#about").scrollIntoView({ behavior: "smooth" }),
  },
  {
    text: "Projects",
    action: () =>
      document
        .querySelector("#projects")
        .scrollIntoView({ behavior: "smooth" }),
  },
  {
    text: "Services",
    action: () =>
      document
        .querySelector("#services")
        .scrollIntoView({ behavior: "smooth" }),
  },
  {
    text: "Contact",
    action: () =>
      document.querySelector("#contact").scrollIntoView({ behavior: "smooth" }),
  },
];

const services = ref([
  {
    title: "Web Development",
    icon: "mdi-web",
    description: "Custom web applications tailored to your needs",
  },
  {
    title: "Mobile Apps",
    icon: "mdi-cellphone",
    description: "Native and cross-platform mobile solutions",
  },
  {
    title: "Cloud Solutions",
    icon: "mdi-cloud",
    description: "Scalable and secure cloud infrastructure",
  },
]);

const projects = reactive([
  {
    name: "Trademark Inventory Management",
    tagline:
      "A robust inventory management system developed using Vue and AWS tools.",
    description:
      "Fully developed inventory management system for a local business to manage their inventory and sales. Manages 1000s of customer orders a month, with a full managed database for products and users with analytics and full store customization.",
    images: [trademark1, background1, trademark1, background2],
  },
  {
    name: "Mable's Pantry",
    tagline:
      "A Squarespace site for a local jam company to sell jams in a marketplace.",
    description:
      "Manages orders, payments, and inventory in a user friendly interface.",
    images: [mable1, mable2, background2],
  },
  {
    name: "Posh and Pony",
    tagline: "A portfolio site for a wedding photography company.",
    description: "Squarespace site for a local wedding photography company.",
    images: [trademark1, background1, mable1, background2],
  },
]);

const testimonials = reactive([
  {
    text: "Beltline Innovation Technologies exceeded our expectations with their innovative solutions and exceptional service.",
    name: "Jane Doe",
    position: "CEO of Trademark",
  },
  {
    text: "The team at BIT is highly professional and delivered our project on time and within budget.",
    name: "John Smith",
    position: "Founder of Mable's Pantry",
  },
  {
    text: "Working with BIT was a fantastic experience. Their expertise and dedication are unmatched.",
    name: "Emily Johnson",
    position: "Owner of Posh and Pony",
  },
]);

const faqs = reactive([
  {
    question: "What services do you offer?",
    answer:
      "We offer web development, cloud solutions, and e-commerce platform development.",
  },
  {
    question: "What is the process of getting a quote?",
    answer:
      "You can contact our customer support team via the contact form on our website or call us at (123) 456-7890.",
  },
  {
    question: "Do you offer international services?",
    answer:
      "Yes, we provide our services internationally. Please contact us for more details.",
  },
]);

// Typing effect
const typedTextSpan = ref(null);
const cursorSpan = ref(null);
const textArray = [
  "Innovative Web Solutions",
  "Powerful Mobile Apps",
  "Scalable Cloud Systems",
];
const typingDelay = 100;
const erasingDelay = 50;
const newTextDelay = 1000;
let textArrayIndex = 0;
let charIndex = 0;

function type() {
  if (charIndex < textArray[textArrayIndex].length) {
    if (!cursorSpan.value.classList.contains("typing"))
      cursorSpan.value.classList.add("typing");
    typedTextSpan.value.textContent +=
      textArray[textArrayIndex].charAt(charIndex);
    charIndex++;
    setTimeout(type, typingDelay);
  } else {
    cursorSpan.value.classList.remove("typing");
    setTimeout(erase, newTextDelay);
  }
}

function erase() {
  if (charIndex > 0) {
    if (!cursorSpan.value.classList.contains("typing"))
      cursorSpan.value.classList.add("typing");
    typedTextSpan.value.textContent = textArray[textArrayIndex].substring(
      0,
      charIndex - 1
    );
    charIndex--;
    setTimeout(erase, erasingDelay);
  } else {
    cursorSpan.value.classList.remove("typing");
    textArrayIndex++;
    if (textArrayIndex >= textArray.length) textArrayIndex = 0;
    setTimeout(type, typingDelay + 1100);
  }
}

if (textArray.length) setTimeout(type, newTextDelay + 250);

// Form submission
const subscribe = () => {
  if (state.valid) {
    // Handle form submission
    console.log("Form submitted:", state.email, state.message);
  } else {
    console.log("Form is invalid");
  }
};

// Scroll functions
const scrollToContact = () => {
  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
};
</script>

<style>
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.animate-blink {
  animation: blink 1s infinite;
}

.cursor.typing {
  animation: none;
}
</style>

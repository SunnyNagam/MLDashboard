<template>
  <v-app light>
    <v-toolbar class="bg-white">
      <v-toolbar-side-icon>
        <img :src="logo" alt="BIT Logo" class="h-16" />
      </v-toolbar-side-icon>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn @click="scrollToProjects">Projects</v-btn>
        <v-btn @click="scrollToContact">Contact Us</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-main>
      <!-- Hero Section -->
      <v-parallax :src="background1" height="600px">
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
            Beltline Innovation Technologies
          </h1>
          <h2 class="mb-4 text-3xl font-black text-center text-grey-darken-3">
            This site is under construction, and you're's could be too.
          </h2>
          <v-btn
            class="bg-blue-500 text-white mt-6"
            rounded="xl"
            size="large"
            @click="scrollToContact"
          >
            Get In Touch
          </v-btn>
        </v-container>
      </v-parallax>

      <!-- About Us Section -->
      <v-container class="my-10 py-10" style="background: #f9f9f9">
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl mb-3">About Us</h2>
            <p class="subheading">
              Beltline Innovation Technologies (BIT) is a local Calgary based
              software consulting company specializing in designing and
              developing software solutions. We work with clients to understand
              their needs and build something that reflects their vision.
            </p>
          </v-col>
        </v-row>
      </v-container>

      <!-- Projects Section -->
      <v-container id="projects" ref="projectsSection" class="py-10">
        <v-row class="text-center mb-6">
          <v-col cols="12">
            <h2 class="headline font-bold text-4xl mb-3">Our Projects</h2>
            <p class="subheading">
              Projects completed in collaboration with our clients.
            </p>
          </v-col>
        </v-row>
        <v-row class="mb-6" v-for="project in projects" :key="project.name">
          <v-carousel
            show-arrows="hover"
            hide-delimiter-background
            cycle
            :interval="3000"
          >
            <v-carousel-item
              v-for="(image, index) in project.images"
              :key="index"
              :src="image"
              cover
            >
            </v-carousel-item>
          </v-carousel>
          <v-card class="elevation-2 mt-4 w-full">
            <v-card-text class="text-center">
              <h1 class="mb-2 text-3xl font-bold">{{ project.name }}</h1>
              <p>{{ project.description }}</p>
            </v-card-text>
          </v-card>
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
          <v-col
            cols="12"
            md="6"
            class="mb-6"
            v-for="testimonial in testimonials"
            :key="testimonial.name"
          >
            <v-card class="elevation-2">
              <v-card-text>
                <p>{{ testimonial.text }}</p>
                <footer class="blockquote-footer">
                  {{ testimonial.name }}, {{ testimonial.position }}
                </footer>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

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
              <v-expansion-panel v-for="faq in faqs" :key="faq.question">
                <v-expansion-panel-title>{{
                  faq.question
                }}</v-expansion-panel-title>
                <v-expansion-panel-text>{{
                  faq.answer
                }}</v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-container>

      <!-- Contact Section -->
      <v-container
        id="contact"
        ref="contactSection"
        class="my-10 py-10"
        style="background: #f9f9f9"
      >
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-6">
            <h2 class="headline font-bold text-4xl mb-3">Contact Us</h2>
            <p>Have an idea or vision? Contact us for a free evaluation!</p>
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

      <!-- Footer Section -->
      <v-container>
        <v-layout class="d-flex align-center justify-center">
          <v-col class="text-center">
            <div class="d-flex justify-center">
              <img :src="logo" alt="BIT Logo" class="mb-4 h-16" />
            </div>
            <h2 class="headline font-bold">
              Copyright © 2024 Beltline Innovation Technologies. All rights
              reserved.
            </h2>
          </v-col>
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useTheme } from "vuetify";

import logo from "@/assets/BITLogoTest.webp";
import background1 from "@/assets/BIT_background1.webp";
import trademark1 from "@/assets/portfolioImgs/trademark1.png";

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
  // can link to a simple lambda or something to email us with this info
  // Add your subscription logic here
  console.log("Contacted with", state.email, state.message);
};

const projects = reactive([
  {
    name: "Trademark Inventory Management",
    tagline:
      "A robust inventory management system developed using Vue and AWS tools.",
    description:
      "Fully developed inventory management system for a local business to manage their inventory and sales. Manages 1000s of customer orders a month, with a full managed database for products and users with analytics and full store customization.",
    images: [
      "src/assets/portfolioImgs/trademark1.png",
      "src/assets/BIT_background1.webp",
      "src/assets/portfolioImgs/trademark1.png",
    ],
  },
  {
    name: "Mable's Pantry",
    tagline:
      "A Squarespace site for a local jam company to sell jams in a marketplace.",
    description:
      "Manages orders, payments, and inventory in a user friendly interface.",
    images: [
      "src/assets/portfolioImgs/mable1.png",
      "src/assets/portfolioImgs/mable2.png",
    ],
  },
  {
    name: "Posh and Pony",
    tagline: "A portfolio site for a wedding photography company.",
    description: "Squarespace site for a local wedding photography company.",
    images: [
      "src/assets/portfolioImgs/trademark1.png",
      "src/assets/BIT_background1.webp",
      "src/assets/portfolioImgs/mable1.png",
      "src/assets/portfolioImgs/mable2.png",
    ],
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

const scrollToContact = () => {
  const contactSection = document.getElementById("contact");
  contactSection.scrollIntoView({ behavior: "smooth" });
};

const scrollToProjects = () => {
  const projectsSection = document.getElementById("projects");
  projectsSection.scrollIntoView({ behavior: "smooth" });
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

.overlay {
  background: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 10px;
}

.hoverable-icon {
  transition: transform 0.3s, color 0.3s;
}
.hoverable-icon:hover {
  transform: scale(1.2);
  color: #44cd48; /* Change to desired hover color */
}
</style>

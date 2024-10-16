<template>
  <!-- Enhanced Landing Page -->
  <v-app light>
    <!-- Toolbar with Tabs -->
    <v-app-bar light>
      <v-img :src="imageLink.logo" alt="ASSK Logo"></v-img>
      <v-spacer></v-spacer>
      <v-tabs
        v-model="activeTab"
        background-color="transparent"
        slider-color="primary"
        align-with-title
      >
        <v-tab @click="navigateTo('hero-banner')">View Marketplace</v-tab>
        <v-tab @click="navigateTo('contact-us')">Source Equipment</v-tab>
        <v-tab @click="navigateTo('sell-equipment')">Sell Your Equipment</v-tab>
        <v-tab @click="navigateTo('financing')">Financing Options</v-tab>
        <v-tab @click="navigateTo('community-board')">Community Board</v-tab>
      </v-tabs>
    </v-app-bar>

    <!-- Hero Section -->
    <v-parallax
      src="https://app.theironhub.com/assets/themes/assk-inc/banner-0cb61e5e11b120d4975eb23bf5e0963384cc6e0d6ef7c6755a2bec750aa02e3e.jpg"
      height="100vh"
      id="hero-banner"
    >
      <v-container class="fill-height d-flex align-center justify-center">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="text-h1 font-weight-bold text-white mb-4 text-shadow">
              ASSK Inc.
            </h1>
            <h3 class="text-h4 font-weight-light text-white mb-6">
              Leading Oil and Gas Equipment Supplier
            </h3>
            <v-btn
              color="secondary"
              large
              rounded
              class="px-8 py-1"
              href="https://www.assk.ca/"
              :ripple="false"
            >
              View Our Marketplace
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-parallax>

    <!-- About Section -->
    <v-container fluid class="py-16 bg-light" id="about">
      <v-row align="center">
        <v-col cols="12" md="6">
          <v-img :src="imageLink.main" alt="About ASSK" height="400"></v-img>
        </v-col>
        <v-col cols="12" md="6">
          <h2 class="text-3xl font-bold mb-4">About ASSK Inc.</h2>
          <p class="text-lg text-gray-700">
            Let ASSK SELL &amp; Source Your equipment and OCTG needs. - Freeing
            time for you to focus on core initiatives – Since inception,
            supporting transactions that have always been fair to the buyer,
            seller, and broker. ASSK has been providing the new, unused,
            reconditioned, and used oil and gas production equipment and pipe
            you have come to expect. Combine this with timely communication,
            quality execution, and the hands- on deck approach to move each case
            along; strong results can be expected. Give ASSK Sell &amp; Source a
            try, What have you got to lose? You are not locked in.
          </p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Services Section -->
    <v-container class="py-16">
      <h2 class="text-3xl font-bold text-center mb-8">Our Services</h2>
      <v-row>
        <v-col cols="12" md="4" class="d-flex">
          <v-card
            class="elevation-3 pa-6 flex-grow-1 transition-transform duration-300 hover:scale-105"
          >
            <v-icon large color="primary" class="mb-4">mdi-cogs</v-icon>
            <h3 class="text-xl font-semibold mb-2">Sales</h3>
            <p>
              Providing the equipment and pipe, you requested and require is
              paramount. Whether this is achieved through surplus, rentals,
              service companies or from original equipment manufacturers we have
              relationships with who extend discounted pricing, the idea is to
              make it happen.
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="d-flex">
          <v-card
            class="elevation-3 pa-6 flex-grow-1 transition-transform duration-300 hover:scale-105"
          >
            <v-icon large color="primary" class="mb-4">mdi-source-fork</v-icon>
            <h3 class="text-xl font-semibold mb-2">Sourcing</h3>
            <p>
              Not every piece of equipment is listed publicly on our website or
              other marketplace listings. We spend the time to source from as
              many places as can be imagined, including a large list of
              non-traditional sources so you have the best options to consider.
            </p>
            <v-btn
              text
              color="primary"
              class="mt-4"
              @click="navigateTo('contact-us')"
            >
              Request Equipment Sourcing
            </v-btn>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="d-flex">
          <v-card
            class="elevation-3 pa-6 flex-grow-1 transition-transform duration-300 hover:scale-105"
          >
            <v-icon large color="primary" class="mb-4"
              >mdi-clipboard-list</v-icon
            >
            <h3 class="text-xl font-semibold mb-2">
              Taking inventory and listing your equipment
            </h3>
            <p>
              Considered taking inventory of assets to list and sell but have
              not been able to get it done? Give ASSK a shout and we will work
              to head out, take photos and list your assets on a public
              marketplace. The location is kept confidential and the public
              discussion is handled by our team eliminating wasted time and tire
              kickers on your end if dealing directly. Final sale and removal of
              any piece of equipment or pipe is not acted on without the full
              knowledge and approval of the owner of the asset and payment in
              full received. Conditions also exist to do a full inventory and
              management of company assets.
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Sustainability Section -->
    <v-container fluid class="py-16 bg-light" id="carbon-meter">
      <v-row justify="center">
        <v-col cols="12" class="text-center mb-8">
          <h2 class="text-3xl font-bold mb-4">
            Our Commitment to Sustainability
          </h2>
          <p class="text-lg text-gray-700 mb-4">
            ASSK Inc. is dedicated to environmental responsibility and
            sustainability in all our operations.
          </p>
          <v-row justify="center">
            <v-col cols="auto">
              <v-tooltip
                location="top"
                text="Reutilization of assets versus a new build dramatically reduces
                  CO2. As the origin of steel from surplus material is unknown, a
                  conservative approach is used. The reutilization of assets
                  results in the avoidance of approximately 0.5 kilogram of CO2
                  production per kilogram of steel manufactured. While not being
                  tracked for the purposes of official carbon credit, we will
                  track the amount of CO2 production avoided by selling surplus."
              >
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="mt-4 pb-4">
                    <v-img
                      src="https://static.vecteezy.com/system/resources/previews/041/290/226/original/co2-emission-reduction-green-leaf-logo-icon-free-png.png"
                      alt="CO2 Emission Reduction"
                      height="100"
                      width="100"
                      class="animate-spin-slow"
                    ></v-img>
                  </div>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>

          <div class="cursor-pointer">
            <div>
              <span class="text-4xl font-bold"
                >{{ carbonSaved.toFixed(2) }} kg</span
              >
              <div class="text-lg">Carbon Saved</div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Sell Your Equipment Section -->
    <v-container class="py-16 bg-primary text-white" id="sell-equipment">
      <v-row justify="center">
        <v-col cols="12" class="text-center mb-8">
          <h2 class="text-3xl font-bold mb-4">Sell Your Equipment</h2>
          <p>
            Have surplus equipment? Let ASSK Inc. help you sell it quickly and
            efficiently.
          </p>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="bg-transparent">
            <v-card-text>
              <v-form v-model="sellForm.valid" @submit.prevent="submitSellForm">
                <v-text-field
                  v-model="sellForm.equipment"
                  :rules="[(v) => !!v || 'Equipment description is required']"
                  label="Equipment Description"
                  required
                  outlined
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-model="sellForm.contactEmail"
                  :rules="emailRules"
                  label="Your Email"
                  required
                  outlined
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="sellForm.additionalInfo"
                  label="Additional Information"
                  rows="3"
                  outlined
                  class="mb-4"
                ></v-textarea>
                <v-btn type="submit" color="secondary" large rounded
                  >Submit Inquiry</v-btn
                >
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Community Board Section -->
    <v-container
      class="my-16 py-16 bg-secondary text-white"
      id="community-board"
    >
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-3xl font-bold mb-4">
            Community Board and Rolling Banner
          </h2>
          <p class="mb-6">
            Have an industry related business or piece of equipment that you
            want a little more industry exposure on? Maybe some gas for Bitcoin
            mining or Peaker energy? How about well heads you are trying to find
            and having no luck!
            <br /><br />
            Contact us to have your company name or product put on our community
            board or rolling banner.
          </p>
          <v-btn
            color="primary"
            large
            :to="{ name: 'landing-community-board' }"
          >
            Visit Community Board
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Financing Options Section -->
    <v-container class="py-16" id="financing">
      <h2 class="text-3xl font-bold text-center mb-8">Financing Options</h2>
      <v-row>
        <v-col cols="12" md="6" class="mb-6">
          <v-card
            class="h-full pa-6 elevation-3 hover:scale-105 transition-transform duration-300 d-flex flex-column"
          >
            <v-card-title class="d-flex align-center">
              <v-icon color="primary" size="48" class="mr-4"
                >mdi-calculator-variant</v-icon
              >
              <span class="text-2xl font-semibold">Instant Lease Quote</span>
            </v-card-title>
            <v-card-text class="text-gray-700 flex-grow-1">
              Get an instant quote for leasing equipment tailored to your
              business needs. Our leasing options are designed to be flexible
              and cost-effective.
            </v-card-text>
            <v-card-actions class="mt-auto">
              <v-btn
                class="bg-primary"
                block
                border
                href="https://go.mycreditportal.ca/assk-inc-/robert-siroishka/instant-quote?lang=en"
                target="_blank"
                >Get Lease Quote</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" class="mb-6">
          <v-card
            class="h-full pa-6 elevation-3 hover:scale-105 transition-transform duration-300 d-flex flex-column"
          >
            <v-card-title class="d-flex align-center">
              <v-icon color="primary" size="48" class="mr-4"
                >mdi-credit-card-outline</v-icon
              >
              <span class="text-2xl font-semibold"
                >Online Credit Application</span
              >
            </v-card-title>
            <v-card-text class="text-gray-700 flex-grow-1">
              Apply online for credit easily and quickly to finance your
              equipment purchase. Our streamlined process ensures a fast and
              efficient application experience.
            </v-card-text>
            <v-card-actions class="mt-auto">
              <v-btn
                class="bg-primary"
                block
                border
                href="https://community.mycreditportal.ca/s/customer-application-form?oid=0055X000000KaVP&vid=001JQ00000Ue4Ez&vname=ASSK%20Inc."
                target="_blank"
                >Apply for Credit</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- News & Highlights Section -->
    <v-container class="py-16">
      <h2 class="text-3xl font-bold text-center mb-8">News & Highlights</h2>
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
                    <v-btn color="secondary" rounded :to="slide.link"
                      >Read More</v-btn
                    >
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
        <v-col cols="12" md="6">
          <v-card class="elevation-3 pa-6">
            <v-card-text>
              <v-form @submit.prevent="submitContactForm" ref="contactForm">
                <v-text-field
                  v-model="contactForm.email"
                  label="Email Address"
                  type="email"
                  required
                  :rules="emailRules"
                  outlined
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="contactForm.message"
                  label="Your Message"
                  required
                  outlined
                  rows="4"
                  class="mb-4"
                ></v-textarea>
                <v-btn type="submit" color="primary" class="w-full"
                  >Send Message</v-btn
                >
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="12" md="4" class="mb-6">
          <v-card
            class="pa-6 text-center transition-all duration-300 hover:shadow-lg"
          >
            <v-icon color="primary" size="32" class="mb-4">mdi-phone</v-icon>
            <h3 class="text-xl font-semibold mb-2">Phone</h3>
            <p>(123) 456-7890</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="mb-6">
          <v-card
            class="pa-6 text-center transition-all duration-300 hover:shadow-lg"
          >
            <v-icon color="primary" size="32" class="mb-4">mdi-email</v-icon>
            <h3 class="text-xl font-semibold mb-2">Email</h3>
            <p>info@assk.ca</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="mb-6">
          <v-card
            class="pa-6 text-center transition-all duration-300 hover:shadow-lg"
          >
            <v-icon color="primary" size="32" class="mb-4"
              >mdi-map-marker</v-icon
            >
            <h3 class="text-xl font-semibold mb-2">Address</h3>
            <p>1234 Oil &amp; Gas Ave, Alberta, Canada</p>
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
    <ScrollingFeed />
  </v-app>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useTheme } from "vuetify";
import ScrollingFeed from "./ScrollingFeed.vue"; // Adjust the path as needed

const theme = useTheme();
theme.global.name.value = "light";

// Reactive state for Sell Equipment Form
const sellForm = reactive({
  equipment: "",
  contactEmail: "",
  additionalInfo: "",
  valid: false,
});

// Reactive state for Contact Form
const contactForm = reactive({
  email: "",
  message: "",
});

// Reactive state for Carbon Meter
const showCarbonInfo = ref(false);
const carbonSaved = ref(7500); // Initial number

// Reactive state for Equipment Sold
const equipmentSold = ref(0);

// Watch for changes in equipmentSold to update carbonSaved
watch(equipmentSold, (newVal) => {
  carbonSaved.value = newVal * 0.5; // 0.5 kg CO2 per kg of steel
});

// Method to update equipment sold (this should be called wherever equipment is sold)
const addEquipmentSold = (weight) => {
  equipmentSold.value += weight;
};

// Email validation rules
const emailRules = [
  (v) => !!v || "E-mail is required",
  (v) =>
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
    "E-mail must be valid",
];

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

// Handle Contact Form Submission
const submitContactForm = () => {
  // Handle form submission logic here
  console.log(
    "Contact Form Submitted:",
    contactForm.email,
    contactForm.message
  );
  // Reset form
  contactForm.email = "";
  contactForm.message = "";
};

// Toggle Carbon Info Dialog
const toggleCarbonInfo = () => {
  showCarbonInfo.value = !showCarbonInfo.value;
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

const isCaptchaVerified = ref(false);

// Handle reCAPTCHA verification
const onCaptchaVerified = (response) => {
  if (response) {
    isCaptchaVerified.value = true;
    // Optionally, store the response token for backend verification
  }
};

const activeTab = ref(null);

// Methods
const navigateTo = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<style scoped>
/* General Styles */
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.bg-light {
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
</style>

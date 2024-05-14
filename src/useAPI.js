import { ref } from "vue";
import Cookies from "vue-cookies";

// Store the API key in a reactive variable
const apiKey = ref("");
apiKey.value = Cookies.get("API_KEY") || "";

// Function to update the API key
export const useApi = () => {
  const setApiKey = (key) => {
    apiKey.value = key;
    Cookies.set("API_KEY", apiKey.value);
  };

  const getApiKey = () => apiKey.value;

  return { apiKey, setApiKey, getApiKey };
};

import { ref, computed } from "vue";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();
const notes = ref(null);
const isLoading = ref(false);
const lastFetchTime = ref(null);
const CACHE_DURATION = 2 * 60 * 1000;
let currentFetchPromise = null;

export function useNotesStore() {
  const fetchNotes = async (force = false) => {
    // Return cached data if available and not expired
    if (!force && notes.value && lastFetchTime.value && Date.now() - lastFetchTime.value < CACHE_DURATION) {
      console.log("Returning cached notes");
      return notes.value;
    }

    // If there's already a fetch in progress, return that promise
    if (currentFetchPromise) {
      console.log("Returning in-progress fetch promise");
      return currentFetchPromise;
    }

    isLoading.value = true;
    console.log("Sending request to fetch notes");
    currentFetchPromise = fetch("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=Notes", {
      headers: { "X-Api-Key": getApiKey() },
    })
      .then((response) => response.json())
      .then((data) => {
        notes.value = data;
        lastFetchTime.value = Date.now();
        return data;
      })
      .catch((error) => {
        console.error("Error fetching notes:", error);
        throw error;
      })
      .finally(() => {
        isLoading.value = false;
        currentFetchPromise = null;
      });

    return currentFetchPromise;
  };

  // Helper functions to find specific notes (like API keys)
  const findApiKey = async (service) => {
    if (!notes.value) await fetchNotes();
    const apiKeys = notes.value.find((item) => item.text === "API keys");
    const serviceKey = apiKeys?.children?.find((item) => item.text === service);
    return serviceKey?.children?.[0]?.text;
  };

  return {
    notes,
    isLoading,
    fetchNotes,
    findApiKey,
  };
}

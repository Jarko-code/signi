// store.js
import { defineStore } from "pinia";
import { ref, nextTick } from "vue";
import axios from "axios";
import { getRandomColor } from "/src/composables/getRandomColor";

// Scroll position management
let previousScrollTop = 0;

const BASE_URL = import.meta.env.VITE_VUE_URL;

export const useWordStore = defineStore("wordStore", () => {
    // State
    const data = ref([]);
    const loading = ref(false);
    const page = ref(1);
    const wordsPerPage = 200;
    const newWord = ref("");
    const wordId = ref(null);

    // Track if there are more words to load
    const hasMore = ref(true);

    // Check local storage for existing words
    const wordsFromLocalStorage = () => {
        const storedData = localStorage.getItem("words");
        if (storedData) {
            data.value = JSON.parse(storedData).sort((a, b) => b.id - a.id);
            loading.value = false;
        } else {
            fetchData(); // if local data are empty, make fetch
        }
    };

    // Function to save the scroll position before fetching new data
    const saveScrollPosition = (scrollElement) => {
        previousScrollTop = scrollElement.scrollTop;
    };

    // Fetch words from API
    const fetchData = async () => {
        if (loading.value || !hasMore.value) return; // Prevent multiple fetches and stop if no more data

        loading.value = true;
        try {
            const response = await axios.get(
                `${BASE_URL}?page=${page.value}&limit=${wordsPerPage}`
            );

            // Log the API response for debugging purposes
            // console.log("API response:", response);

            // Check if response.data is an array
            if (Array.isArray(response.data)) {
                const newWords = response.data.map((item) => ({
                    ...item,
                    color: item.color || getRandomColor(), // Keep existing color or assign a new one
                }));

                // Append new words to the existing data
                data.value = [...data.value, ...newWords];

                page.value++; // Increment the page number for the next fetch

                // If no new words are returned, stop further requests
                if (response.data.length === 0) {
                    hasMore.value = false;
                }

                // Store updated words in local storage
                localStorage.setItem("words", JSON.stringify(data.value));
            } else if (
                response.data &&
                response.data.data &&
                Array.isArray(response.data.data)
            ) {
                // If the API returns an object containing a "data" array
                const newWords = response.data.data.map((item) => ({
                    ...item,
                    color: item.color || getRandomColor(), // Keep existing color or assign a new one
                }));

                // Append new words to the existing data
                data.value = [...data.value, ...newWords];

                page.value++; // Increment the page number for the next fetch

                // If no new words are returned, stop further requests
                if (response.data.data.length === 0) {
                    hasMore.value = false;
                }

                // Store updated words in local storage
                localStorage.setItem("words", JSON.stringify(data.value));
            } else {
                // Handle error case if response data doesn't match the expected structure
                console.error(
                    "Error: response.data is not an array or doesn't contain an array",
                    response.data
                );
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            loading.value = false; // Reset loading flag after data fetch
        }
    };

    // Scroll restoration after data fetch
    const restoreScrollPosition = (scrollElement) => {
        nextTick(() => {
            scrollElement.scrollTop = previousScrollTop;
        });
    };

    // add new word
    const addWord = async () => {
        if (newWord.value.trim()) {
            try {
                // id autoincrement
                const lastId =
                    data.value.length > 0
                        ? Math.max(...data.value.map((item) => item.id))
                        : 0;
                const newId = lastId + 1;

                const newColor = getRandomColor(); // Ensure color is generated

                const response = await axios.post(BASE_URL, {
                    id: newId,
                    word: newWord.value,
                    color: newColor, // Store color in DB if needed
                });

                const newWordWithColor = {
                    ...response.data,
                    color: newColor, // Ensure color is included
                };

                data.value.unshift(newWordWithColor);

                // Save updated data to local storage
                localStorage.setItem("words", JSON.stringify(data.value));

                newWord.value = "";
            } catch (error) {
                console.error("Error adding word:", error);
            }
        }
    };

    // edit form
    const editForm = (id) => {
        wordId.value = id;
    };

    // update word
    const updateWord = async (item) => {
        try {
            await axios.put(`${BASE_URL}/${item.id}`, {
                word: item.word,
            });
            wordId.value = null;

            // Save updated data to local storage
            localStorage.setItem("words", JSON.stringify(data.value));
        } catch (error) {
            console.error("Updating error:", error);
        }
    };

    const deleteWord = async (id) => {
        // Ask for user confirmation before proceeding
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this word?"
        );

        // If user confirms, proceed with deletion
        if (isConfirmed) {
            try {
                await axios.delete(`${BASE_URL}/${id}`);
                data.value = data.value.filter((item) => item.id !== id);

                // Save updated data to local storage
                localStorage.setItem("words", JSON.stringify(data.value));
            } catch (error) {
                console.error("Error deleting word:", error);
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };

    // Load data from local storage on store initialization
    wordsFromLocalStorage();

    return {
        data,
        loading,
        newWord,
        wordId,
        page,
        hasMore,
        fetchData,
        addWord,
        editForm,
        updateWord,
        deleteWord,
        saveScrollPosition,
        restoreScrollPosition,
    };
});

<template>
    <div class="flex flex-col items-center">
        <h1 class="text-2xl font-semibold mb-4 text-center">{{ title }}</h1>
        <div class="mb-4 flex flex-col items-center space-y-2">
            <input
                v-model="wordStore.newWord"
                class="border p-2 rounded-md w-64 text-center"
                placeholder="Enter a new word"
                @input="validateSpecialCharacters"
                @keypress.enter="validateAndAddWord"
            />
            <button
                @click="validateAndAddWord"
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
                {{ button }}
            </button>
            <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useWordStore } from "/src/store/wordStore";

// props
const props = defineProps(["title", "button"]);

const wordStore = useWordStore();
const errorMessage = ref("");

// validations
const validateSpecialCharacters = () => {
    if (/[^a-zA-Z0-9 ]/.test(wordStore.newWord)) {
        errorMessage.value = "Special characters are not allowed.";
    } else {
        errorMessage.value = "";
    }
};

const validateAndAddWord = () => {
    if (!wordStore.newWord.trim()) {
        errorMessage.value = "Word cannot be empty.";
        return;
    }
    if (!errorMessage.value) {
        wordStore.addWord();
    }
};

watch(() => wordStore.newWord, validateSpecialCharacters);
</script>

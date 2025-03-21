<template>
    <ul
        ref="wordList"
        @scroll="handleScroll"
        style="height: 80vh; overflow-y: auto; padding: 0"
    >
        <li
            v-for="(item, index) in wordStore.data"
            :key="item.id"
            class="inline-block px-2 py-2"
            :draggable="true"
            @dragstart="onDragStart(index, $event)"
            @dragover="onDragOver($event)"
            @drop="onDrop(index, $event)"
            @dragend="onDragEnd"
        >
            <div
                v-if="wordStore.wordId === item.id"
                class="flex items-center space-x-2 min-w-xs"
            >
                <input
                    v-model="item.word"
                    @keypress.enter="wordStore.updateWord(item)"
                    class="border p-2 rounded-md flex-grow min-w-xs"
                />
                <button
                    @click="wordStore.updateWord(item)"
                    class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                    Save
                </button>
            </div>
            <div
                v-else
                class="flex items-center space-x-2 p-2 rounded-full text-white cursor-pointer"
                :style="{ backgroundColor: item.color }"
            >
                <span>{{ item.word }}</span>
                <span @click="wordStore.editForm(item.id)" class="text-black">
                    <i class="pi pi-pencil bg-white px-1 py-1 rounded-full"></i>
                </span>
                <span
                    @click="wordStore.deleteWord(item.id)"
                    class="text-red-500 hover:text-red-400"
                >
                    <i class="pi pi-trash bg-white px-1 py-1 rounded-full"></i>
                </span>
            </div>
        </li>
    </ul>
    <div v-if="wordStore.loading" class="text-center my-4">
        <span>Loading...</span>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick, watch } from "vue";
import { useWordStore } from "/src/store/wordStore";
import { getRandomColor } from "/src/composables/getRandomColor";

const wordStore = useWordStore();
const draggedIndex = ref(null);

const wordList = ref(null); // ref for the scrollable list

let isFetching = false; // Flag to track if a fetch is in progress
let lastScrollTop = 0; // Track the scroll position

const handleScroll = () => {
    const list = wordList.value;
    const scrollTop = list.scrollTop;
    const scrollHeight = list.scrollHeight;
    const clientHeight = list.clientHeight;

    // Check if the user is near the bottom of the list and there's more data to load
    if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        !isFetching &&
        wordStore.hasMore
    ) {
        // Save the scroll position before fetching data
        lastScrollTop = scrollTop;

        // Set fetching flag to true
        isFetching = true;

        // Use requestAnimationFrame to ensure smooth operation
        window.requestAnimationFrame(() => {
            wordStore.saveScrollPosition(list); // Save the scroll position before fetching
            wordStore.fetchData().finally(() => {
                // Once the data is loaded, reset fetching flag
                isFetching = false;

                // Restore scroll position after the new data is appended
                list.scrollTop = lastScrollTop; // Prevents jumping to the top
            });
        });
    }
};

// Watch for changes to the data and restore the scroll position after data is fetched
watch(
    () => wordStore.data,
    () => {
        const list = wordList.value;
        wordStore.restoreScrollPosition(list); // Restore scroll position after data is fetched
    }
);

// Load data from localStorage when the component is mounted
onMounted(async () => {
    const savedWords = localStorage.getItem("words");
    if (savedWords) {
        wordStore.data = JSON.parse(savedWords);
    } else {
        await wordStore.fetchData(); // Load the initial batch of data
    }

    // Ensure each word has a color assigned if not already
    wordStore.data.forEach((item) => {
        if (!item.color) {
            item.color = getRandomColor();
        }
    });
});

// Handle the start of dragging
const onDragStart = (index, event) => {
    draggedIndex.value = index;
    event.dataTransfer.effectAllowed = "move";
};

// Allow dragging over the list
const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
};

// Handle drop event and reorder items
const onDrop = (index, event) => {
    event.preventDefault();
    if (draggedIndex.value === index) return;

    const movedItem = wordStore.data[draggedIndex.value];
    wordStore.data.splice(draggedIndex.value, 1);
    wordStore.data.splice(index, 0, movedItem);

    // Save the updated list to localStorage
    localStorage.setItem("words", JSON.stringify(wordStore.data));

    draggedIndex.value = null; // Reset the dragged index
};

// Reset the dragged index after drag ends
const onDragEnd = () => {
    draggedIndex.value = null;
};
</script>

<style>
ul {
    width: 100%;
    padding: 0;
    margin: 0;
    overflow-y: scroll;
    height: 80vh;
}

ul::-webkit-scrollbar {
    display: none;
}

ul {
    scrollbar-width: none;
}

html {
    overflow: hidden;
}

body {
    overflow: hidden;
}

body,
html {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>

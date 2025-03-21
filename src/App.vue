<template>
    <div>
        <AddForm :title="'Add your word'" :button="'Add word'" />
        <LoadingSpinner v-if="wordStore.loading" />
        <WordList v-else />
    </div>
</template>

<script setup>
import AddForm from "/src/components/AddForm.vue";
import LoadingSpinner from "/src/components/LoadingSpinner.vue";
import WordList from "/src/components/WordList.vue";
import { useWordStore } from "/src/store/wordStore";

const wordStore = useWordStore();
</script>

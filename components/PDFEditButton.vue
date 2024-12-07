<template>
  <button
    @click="$emit('click')"
    class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors lg:hidden flex items-center gap-2"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
    Edit PDF
  </button>
</template>

<script setup lang="ts">
defineEmits(['click'])
</script>
<template>
  <div
    class="fixed z-50 lg:right-4 lg:top-24 lg:w-64"
    :class="{
      'inset-x-0 bottom-0': true,
      'inset-x-0 bottom-0': isOpen && isMobile,
      'bg-white rounded-lg shadow-lg': true
    }"
    :style="{
      'transition': 'transform 0.3s ease-in-out',
      'transform': isOpen || !isMobile ? 'translateY(0)' : 'translateY(100%)'
    }">
    <div
      v-if="isMobile"
      @click="isOpen = !isOpen"
      class="absolute -top-7 inset-x-0 h-7 bg-white rounded-t-lg flex items-center justify-center cursor-pointer">
      <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
    </div>

    <div class="p-4 space-y-4">
      <h3 class="text-lg font-medium text-gray-900">PDF Tools</h3>
      
      <!-- Tools List -->
      <div class="space-y-2 max-h-[60vh] overflow-y-auto">
        <button
          v-for="tool in pdfTools"
          :key="tool.id"
          @click="activeTool = activeTool === tool.id ? null : tool.id"
          class="w-full flex items-center px-3 py-2 text-sm rounded-md cursor-pointer"
          :class="activeTool === tool.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'">
          <span class="flex-1 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tool.icon" />
            </svg>
            {{ tool.name }}
          </span>
          <svg
            v-if="hasSettings(tool.id)"
            class="w-5 h-5"
            :class="activeTool === tool.id ? 'rotate-180' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Tool Settings -->
      <div v-if="activeTool === 'text'" class="space-y-3 p-3 bg-gray-50 rounded-md mt-2">
        <div>
          <label class="block text-sm font-medium text-gray-700">Text</label>
          <input
            v-model="textSettings.content"
            type="text"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
            placeholder="Enter text" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Font Size</label>
          <div class="flex items-center gap-2">
            <input
              v-model="textSettings.fontSize"
              type="range"
              min="8"
              max="72"
              step="1"
              class="flex-1" />
            <span class="text-sm text-gray-600 w-12 text-right">{{ textSettings.fontSize }}px</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Color</label>
          <div class="grid grid-cols-8 gap-2 mt-1">
            <button
              v-for="color in predefinedColors"
              :key="color"
              @click="textSettings.color = color"
              class="w-6 h-6 rounded-full border-2"
              :class="textSettings.color === color ? 'border-indigo-500' : 'border-transparent'" 
              :style="{ backgroundColor: color }"></button>
          </div>
        </div>

        <p class="text-sm text-gray-500 italic">
          Add text to the current page or all pages.
        </p>
        
        <div class="flex gap-2">
          <button
            @click="addTextToCurrentPage"
            class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Current Page
          </button>
          
          <button
            @click="addTextToAllPages"
            class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
            All Pages
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { pdfTools } from './tools/PDFTools'

const predefinedColors = [
  '#000000', '#D32F2F', '#1976D2', '#388E3C',
  '#FBC02D', '#E64A19', '#7B1FA2', '#455A64'
]

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)

const props = defineProps<{
  isOpen: boolean
  currentPage?: number
  toolsRef?: any
}>()

const emit = defineEmits(['update:isOpen'])

const activeTool = ref<string | null>(null)
const textSettings = ref({
  content: '',
  fontSize: 12,
  color: '#000000',
  lineHeight: 1.2
})

const addTextToCurrentPage = () => {
  if (props.currentPage !== undefined) {
    props.toolsRef.addTextToPage(props.currentPage)
    emit('update:isOpen', false)
  }
}

const addTextToAllPages = () => {
  const pageCount = props.toolsRef?.pdf?.getPageCount() || 0
  for (let i = 0; i < pageCount; i++) {
    props.toolsRef.addTextToPage(i)
  }
  emit('update:isOpen', false)
}

// Close toolbar when clicking outside on mobile
const handleClickOutside = (event: MouseEvent) => {
  if (isMobile.value && props.isOpen) {
    const target = event.target as HTMLElement
    if (!target.closest('.fixed')) {
      emit('update:isOpen', false)
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const hasSettings = (toolId: string): boolean => {
  // Add more tools that have settings panels
  return ['text', 'image', 'whiteout', 'highlight', 'draw', 'shapes'].includes(toolId)
}

defineExpose({
  activeTool,
  textSettings
})
</script>
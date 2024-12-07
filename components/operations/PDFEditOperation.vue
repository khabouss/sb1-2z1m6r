<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Edit PDF</h3>

    <div class="space-y-4">
      <!-- Page Thumbnails -->
      <div class="grid grid-cols-6 gap-4">
        <div
          v-for="(page, index) in pages"
          :key="index"
          class="relative group cursor-pointer"
          @click="selectPage(index)"
        >
          <div
            class="aspect-w-3 aspect-h-4 border rounded-lg overflow-hidden"
            :class="{ 'ring-2 ring-indigo-500': selectedPage === index }"
          >
            <!-- Page thumbnail preview will go here -->
            <div class="bg-gray-100 flex items-center justify-center">
              <span class="text-gray-500">Page {{ index + 1 }}</span>
            </div>
          </div>
          
          <div class="absolute top-0 right-0 p-2 hidden group-hover:block">
            <button
              @click.stop="removePage(index)"
              class="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Text Overlay Tools -->
      <div v-if="selectedPage !== null" class="space-y-4">
        <div class="flex space-x-4">
          <input
            v-model="textOverlay.content"
            type="text"
            placeholder="Enter text"
            class="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          
          <input
            v-model="textOverlay.fontSize"
            type="number"
            min="8"
            max="72"
            class="w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />

          <input
            v-model="textOverlay.color"
            type="color"
            class="w-10 h-10 p-0 border-gray-300 rounded-md"
          />
        </div>

        <div class="flex justify-end space-x-2">
          <button
            @click="addTextOverlay"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Text
          </button>
        </div>
      </div>
    </div>

    <button
      @click="saveChanges"
      class="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      :disabled="saving"
    >
      {{ saving ? 'Saving...' : 'Save Changes' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PDFDocument, rgb } from 'pdf-lib'

const props = defineProps<{
  pdf: PDFDocument
}>()

const emit = defineEmits(['operation-complete'])

const pages = ref<any[]>([])
const selectedPage = ref<number | null>(null)
const saving = ref(false)

const textOverlay = ref({
  content: '',
  fontSize: 12,
  color: '#000000',
  x: 50,
  y: 50
})

onMounted(async () => {
  pages.value = Array.from({ length: props.pdf.getPageCount() })
})

const selectPage = (index: number) => {
  selectedPage.value = index
}

const removePage = async (index: number) => {
  const newPdf = await PDFDocument.create()
  const pageIndices = props.pdf.getPageIndices().filter(i => i !== index)
  const pages = await newPdf.copyPages(props.pdf, pageIndices)
  pages.forEach(page => newPdf.addPage(page))
  emit('operation-complete', newPdf)
}

const addTextOverlay = async () => {
  if (selectedPage.value === null) return

  const newPdf = await PDFDocument.create()
  const pages = await newPdf.copyPages(props.pdf, props.pdf.getPageIndices())
  
  pages.forEach((page, index) => {
    newPdf.addPage(page)
    if (index === selectedPage.value) {
      const { r, g, b } = hexToRgb(textOverlay.value.color)
      page.drawText(textOverlay.value.content, {
        x: textOverlay.value.x,
        y: textOverlay.value.y,
        size: textOverlay.value.fontSize,
        color: rgb(r / 255, g / 255, b / 255)
      })
    }
  })

  emit('operation-complete', newPdf)
}

const saveChanges = async () => {
  try {
    saving.value = true
    emit('operation-complete', props.pdf)
  } catch (error) {
    console.error('Error saving changes:', error)
    // TODO: Add proper error handling
  } finally {
    saving.value = false
  }
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}
</script>
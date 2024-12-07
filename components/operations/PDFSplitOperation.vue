<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Split PDF</h3>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        Split Method
      </label>
      <select
        v-model="splitMethod"
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="range">Page Range</option>
        <option value="interval">Equal Intervals</option>
      </select>
    </div>

    <div v-if="splitMethod === 'range'" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        Page Ranges (e.g., 1-3,4-6)
      </label>
      <input
        v-model="pageRanges"
        type="text"
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder="1-3,4-6"
      />
    </div>

    <div v-else class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        Split every N pages
      </label>
      <input
        v-model.number="interval"
        type="number"
        min="1"
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>

    <button
      @click="splitPDF"
      class="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      :disabled="splitting"
    >
      {{ splitting ? 'Splitting...' : 'Split PDF' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'

const props = defineProps<{
  pdf: PDFDocument
}>()

const emit = defineEmits(['operation-complete'])

const splitMethod = ref('range')
const pageRanges = ref('')
const interval = ref(1)
const splitting = ref(false)

const parsePageRanges = (ranges: string): number[][] => {
  return ranges.split(',').map(range => {
    const [start, end] = range.split('-').map(num => parseInt(num.trim()) - 1)
    return [start, end || start]
  })
}

const splitPDF = async () => {
  try {
    splitting.value = true
    const pageIndices: number[][] = []

    if (splitMethod.value === 'range') {
      pageIndices.push(...parsePageRanges(pageRanges.value))
    } else {
      const totalPages = props.pdf.getPageCount()
      for (let i = 0; i < totalPages; i += interval.value) {
        pageIndices.push([i, Math.min(i + interval.value - 1, totalPages - 1)])
      }
    }

    const splitPdfs = await Promise.all(
      pageIndices.map(async ([start, end]) => {
        const newPdf = await PDFDocument.create()
        const pages = await newPdf.copyPages(
          props.pdf,
          Array.from({ length: end - start + 1 }, (_, i) => start + i)
        )
        pages.forEach(page => newPdf.addPage(page))
        return newPdf
      })
    )

    // For now, we'll just return the first split PDF
    // TODO: Implement proper handling of multiple PDFs
    emit('operation-complete', splitPdfs[0])
  } catch (error) {
    console.error('Error splitting PDF:', error)
    // TODO: Add proper error handling
  } finally {
    splitting.value = false
  }
}
</script>
<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Merge PDFs</h3>
    
    <vue-dropzone
      ref="mergeDropzoneRef"
      :options="mergeDropzoneOptions"
      @vdropzone-file-added="handleAdditionalFile"
      class="w-full"
    />

    <div v-if="pdfsToMerge.length > 0" class="space-y-2">
      <draggable
        v-model="pdfsToMerge"
        class="space-y-2"
        ghost-class="opacity-50"
        handle=".handle"
      >
        <div
          v-for="(pdf, index) in pdfsToMerge"
          :key="index"
          class="flex items-center justify-between p-2 bg-gray-50 rounded"
        >
          <div class="flex items-center">
            <span class="handle cursor-move mr-2">⋮</span>
            <span>{{ pdf.name }}</span>
          </div>
          <button
            @click="removePDF(index)"
            class="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      </draggable>

      <button
        @click="mergePDFs"
        class="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        :disabled="merging"
      >
        {{ merging ? 'Merging...' : 'Merge PDFs' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'
import VueDropzone from 'vue3-dropzone'
import draggable from 'vuedraggable'

const emit = defineEmits(['operation-complete'])

const mergeDropzoneRef = ref(null)
const pdfsToMerge = ref<any[]>([])
const merging = ref(false)

const mergeDropzoneOptions = {
  url: '#',
  acceptedFiles: '.pdf',
  autoProcessQueue: false,
  maxFilesize: 50,
  dictDefaultMessage: 'Drop additional PDFs here to merge'
}

const handleAdditionalFile = async (file: File) => {
  pdfsToMerge.value.push(file)
}

const removePDF = (index: number) => {
  pdfsToMerge.value.splice(index, 1)
}

const mergePDFs = async () => {
  try {
    merging.value = true
    const mergedPdf = await PDFDocument.create()

    for (const file of pdfsToMerge.value) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
    }

    emit('operation-complete', mergedPdf)
    pdfsToMerge.value = []
  } catch (error) {
    console.error('Error merging PDFs:', error)
    // TODO: Add proper error handling
  } finally {
    merging.value = false
  }
}
</script>
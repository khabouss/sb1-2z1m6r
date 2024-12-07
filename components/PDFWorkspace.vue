<template>
  <div class="bg-white shadow sm:rounded-lg">
    <PDFToolsSidebar
      v-if="currentPDF"
      ref="toolsRef"
      :current-page="currentPage"
      v-model:is-open="isToolbarOpen"
    />
    <PDFEditButton
      v-if="currentPDF"
      @click="isToolbarOpen = !isToolbarOpen"
    />
    <div class="px-4 py-5 sm:p-6">
      <!-- Error Alert -->
      <div
        v-if="error"
        class="mb-4 p-4 rounded-md bg-red-50 border border-red-200"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
          <div class="ml-auto pl-3">
            <button
              @click="error = ''"
              class="inline-flex text-red-400 hover:text-red-500"
            >
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Initial Upload -->
        <PDFDropzone
          :multiple="true"
          :max-file-size-m-b="50"
          @file-added="handleFileAdded"
          @files-added="handleFilesAdded"
          @error="handleError"
        />

        <!-- PDF Pages -->
        <div v-if="currentPDF" class="space-y-4">
          <PDFPageViewer
            v-model:pdf="currentPDF"
            :tools-ref="toolsRef"
            @add-blank-page="handleAddBlankPage"
            @add-pdf="handleAddPDF"
          />
          
          <button
            @click="downloadPDF"
            class="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PDFDocument, PageSizes, degrees } from 'pdf-lib'
import { useTimeoutFn } from '@vueuse/core'
import PDFEditButton from './PDFEditButton.vue'
import PDFToolsSidebar from './PDFToolsSidebar.vue'

const currentPDF = ref<PDFDocument | null>(null)
const error = ref('')
const isProcessing = ref(false)
const toolsRef = ref(null)
const currentPage = ref(0)
const isToolbarOpen = ref(false)

const clearError = useTimeoutFn(() => {
  error.value = ''
}, 5000)

const handleFileAdded = async (file: File) => {
  try {
    isProcessing.value = true
    const arrayBuffer = await file.arrayBuffer()
    currentPDF.value = await PDFDocument.load(arrayBuffer)
  } catch (error) {
    handleError(error instanceof Error ? error.message : 'Error loading PDF')
  } finally {
    isProcessing.value = false
  }
}

const handleFilesAdded = async (files: File[]) => {
  try {
    isProcessing.value = true
    const mergedPdf = await PDFDocument.create()
    
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
    }
    
    currentPDF.value = mergedPdf
  } catch (error) {
    handleError(error instanceof Error ? error.message : 'Error merging PDFs')
  } finally {
    isProcessing.value = false
  }
}

const handleAddBlankPage = async () => {
  if (!currentPDF.value) return
  
  const page = currentPDF.value.addPage(PageSizes.A4)
  currentPDF.value = currentPDF.value
}

const handleAddPDF = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      isProcessing.value = true
      const arrayBuffer = await file.arrayBuffer()
      const newPdf = await PDFDocument.load(arrayBuffer)
      
      if (currentPDF.value) {
        const pages = await currentPDF.value.copyPages(newPdf, newPdf.getPageIndices())
        pages.forEach(page => currentPDF.value!.addPage(page))
        currentPDF.value = currentPDF.value
      } else {
        currentPDF.value = newPdf
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Error adding PDF')
    } finally {
      isProcessing.value = false
    }
  }
  input.click()
}
const downloadPDF = async () => {
  if (!currentPDF.value) return

  try {
    isProcessing.value = true
    const pdfBytes = await currentPDF.value.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'modified.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    handleError(error instanceof Error ? error.message : 'Error downloading PDF')
  } finally {
    isProcessing.value = false
  }
}

const handleError = (message: string) => {
  error.value = message
  clearError.start()
  // TODO: Add proper error UI feedback
}
</script>
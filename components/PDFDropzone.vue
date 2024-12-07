<!-- Create a reusable dropzone component -->
<template>
  <div
    ref="dropzoneRef"
    class="dropzone-container border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors"
    :class="{
      'border-indigo-500 bg-indigo-50': isOverDropzone,
      'hover:border-indigo-400 hover:bg-gray-50': !isOverDropzone
    }"
    @drop.prevent="handleDrop"
    @dragover.prevent="isOverDropzone = true"
    @dragleave.prevent="isOverDropzone = false"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="handleFileSelect"
    />
    <div class="text-center">
      <div class="text-gray-500">
        <span v-if="!isOverDropzone">
          Drop PDF files here or click to upload
        </span>
        <span v-else class="text-indigo-600">
          Release to upload files
        </span>
      </div>
      <p class="text-sm text-gray-400 mt-2">
        Maximum file size: {{ maxFileSizeMB }}MB
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

const props = defineProps({
  accept: {
    type: String,
    default: '.pdf'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxFileSizeMB: {
    type: Number,
    default: 50
  }
})

const emit = defineEmits(['file-added', 'files-added', 'error'])

const dropzoneRef = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isOverDropzone = ref(false)

const validateFiles = (files: File[]): File[] => {
  return files.filter(file => {
    const isValidType = file.type === 'application/pdf'
    const isValidSize = file.size <= props.maxFileSizeMB * 1024 * 1024

    if (!isValidType) {
      emit('error', `${file.name} is not a PDF file`)
    }
    if (!isValidSize) {
      emit('error', `${file.name} exceeds ${props.maxFileSizeMB}MB limit`)
    }

    return isValidType && isValidSize
  })
}

const handleFiles = (fileList: FileList) => {
  const files = Array.from(fileList)
  const validFiles = validateFiles(files)

  if (validFiles.length) {
    if (props.multiple) {
      emit('files-added', validFiles)
    } else {
      emit('file-added', validFiles[0])
    }
  }
}

const handleDrop = (e: DragEvent) => {
  isOverDropzone.value = false
  if (e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files)
  }
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    handleFiles(input.files)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

// Prevent default drag behaviors
useEventListener(document, 'dragenter', (e) => e.preventDefault())
useEventListener(document, 'dragover', (e) => e.preventDefault())
useEventListener(document, 'dragleave', (e) => e.preventDefault())
</script>
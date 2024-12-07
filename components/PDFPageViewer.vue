<!-- PDF page viewer with page management -->
<template>
  <div class="space-y-4">
    <!-- Page List -->
    <div class="space-y-4">
      <div
        v-for="(_, index) in pageCount"
        :key="index"
        :ref="el => { if (el) pageRefs[index] = el }"
        :data-page-index="index"
        class="relative group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex items-center"
        :class="{
          'bg-white': currentPage !== index,
          'bg-indigo-50 border-indigo-200': currentPage === index
        }"
      >
        <!-- Page Preview -->
        <div class="flex-none px-4 py-3">
          <span class="text-gray-400 font-medium">{{ index + 1 }}</span>
        </div>
        
        <div class="flex-1 p-3">
          <div
            class="w-[595px] h-[842px] origin-top-left bg-white border shadow-sm transform-gpu cursor-pointer"
            ref="el => { if (el) pageContainers[index] = el }"
            :data-page-container-index="index"
          >
            <canvas
              :width="595"
              :height="842"
              class="w-full h-full"
            ></canvas>
            
            <!-- Draggable Text Elements -->
            <div
              v-for="(text, id) in getPageTextElements(index)"
              :key="id"
              class="absolute cursor-move"
              @mousedown="startDragging($event, id)"
              :style="{
                transform: `translate(${text.x}px, ${text.y}px)`,
                color: text.color,
                fontSize: `${text.fontSize}px`,
                userSelect: 'none',
                cursor: isDragging && selectedTextId === id ? 'grabbing' : 'grab'
              }"
            >
              {{ text.content }}
            </div>
            
          </div>
        </div>

        <div class="flex-none px-4">
          <button
            @click="removePage(index)"
            class="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4">
        <!-- Add Blank Page Button -->
        <button
          @click="$emit('add-blank-page')"
          class="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Blank Page</span>
        </button>

        <!-- Add PDF Button -->
        <button
          @click="$emit('add-pdf')"
          class="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upload PDF</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { PDFDocument, rgb } from 'pdf-lib'
import * as PDFJS from 'pdfjs-dist'
import { useThrottleFn, useElementBounding, useIntersectionObserver } from '@vueuse/core'

// Initialize PDF.js worker
const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href
PDFJS.GlobalWorkerOptions.workerSrc = workerSrc

const props = defineProps<{
  pdf: PDFDocument
  toolsRef: any
}>()

const emit = defineEmits(['update:pdf', 'add-blank-page', 'add-pdf'])
const pageRefs = ref<{ [key: number]: HTMLElement }>({})
const renderedPages = ref(new Set<number>())
const currentPage = ref<number>(0)
const textElements = ref<{ [key: string]: { x: number; y: number; content: string; fontSize: number; color: string; pageIndex: number } }>({})
const selectedTextId = ref<string | null>(null)
const isDragging = ref(false)
const initialMousePosition = ref({ x: 0, y: 0 })
const draggedElement = ref<HTMLElement | null>(null)
const { x: elementX, y: elementY } = useElementBounding(draggedElement)

const pageCount = computed(() => props.pdf.getPageCount())

// Cache for loaded PDFs to prevent repeated loading
let loadedPdfDoc: any = null
let pdfBytes: Uint8Array | null = null

// Cleanup function to release resources
const cleanup = () => {
  renderedPages.value.clear()
  if (loadedPdfDoc) {
    loadedPdfDoc.destroy()
    loadedPdfDoc = null
  }
  pdfBytes = null
}

const renderPage = async (pageIndex: number) => {
  if (renderedPages.value.has(pageIndex)) return
  
  const pageElement = pageRefs.value[pageIndex]
  if (!pageElement) return
  
  const canvas = pageElement.querySelector('canvas')
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return

  try {
    if (!loadedPdfDoc) {
      pdfBytes = await props.pdf.save()
      loadedPdfDoc = await PDFJS.getDocument({
        data: pdfBytes,
        useWorkerFetch: true,
        isEvalSupported: false,
        useSystemFonts: true
      }).promise
    }

    const page = await loadedPdfDoc.getPage(pageIndex + 1)
    const scale = Math.min(
      canvas.width / page.getViewport({ scale: 1 }).width,
      canvas.height / page.getViewport({ scale: 1 }).height
    )
    const viewport = page.getViewport({ scale })
    const context = canvas.getContext('2d')
    
    if (context) {
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
    }
    renderedPages.value.add(pageIndex)
  } catch (error) {
    console.error('Error rendering page:', error)
  }
}

// Throttled render function to prevent too many simultaneous renders
const throttledRender = useThrottleFn(renderPage, 100)

watch(() => props.pdf, async () => {
  // Re-render all pages when PDF changes
  cleanup()
  // Initial render of visible pages
  Object.keys(pageRefs.value).forEach(index => {
    throttledRender(parseInt(index))
  })
}, { deep: true })

// Set up intersection observer for lazy loading
const observerCallback = async (entries: IntersectionObserverEntry[]) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const pageIndex = parseInt(entry.target.getAttribute('data-page-index') || '-1')
      if (pageIndex >= 0) {
        currentPage.value = pageIndex
        throttledRender(pageIndex)
      }
    }
  }
}

const observer = new IntersectionObserver(observerCallback, {
  root: null,
  rootMargin: '0px',
  threshold: [0.1, 0.5, 0.9]
})

const removePage = async (pageIndex: number) => {
  try {
    if (!props.pdf || props.pdf.getPageCount() <= 1) {
      console.warn('Cannot remove the last page')
      return
    }

    // Create new PDF and copy pages
    const newPdf = await PDFDocument.create()
    const pageIndices = props.pdf.getPageIndices().filter(i => i !== pageIndex)
    const pages = await newPdf.copyPages(props.pdf, pageIndices)
    
    // Copy page properties
    pages.forEach(page => newPdf.addPage(page))
    
    // Force cleanup of old PDF resources
    cleanup()
    renderedPages.value.clear()
    
    emit('update:pdf', newPdf)
  } catch (error) {
    console.error('Error removing page:', error)
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

const addTextToPage = async (pageIndex: number) => {
  const settings = props.toolsRef.textSettings
  const textId = `text-${Date.now()}-${Math.random()}`
  textElements.value[textId] = {
    x: 50,
    y: 50,
    content: settings.content,
    fontSize: settings.fontSize,
    color: settings.color,
    pageIndex
  }
}

const getPageTextElements = (pageIndex: number) => {
  return Object.entries(textElements.value).reduce((acc, [id, text]) => {
    if (text.pageIndex === pageIndex) {
      acc[id] = text
    }
    return acc
  }, {} as typeof textElements.value)
}

// Dragging functionality
const startDragging = (event: MouseEvent, id: string) => {
  event.preventDefault()
  selectedTextId.value = id
  draggedElement.value = event.target as HTMLElement
  isDragging.value = true
  
  const text = textElements.value[id]
  initialMousePosition.value = { x: event.clientX, y: event.clientY }
  
  document.addEventListener('mousemove', handleDragging)
  document.addEventListener('mouseup', stopDragging)
}

const handleDragging = (event: MouseEvent) => {
  if (!isDragging.value || !selectedTextId.value) return
  
  const dx = event.clientX - initialMousePosition.value.x
  const dy = event.clientY - initialMousePosition.value.y
  
  if (draggedElement.value) {
    const bounds = draggedElement.value.getBoundingClientRect()
    const containerBounds = draggedElement.value.parentElement?.getBoundingClientRect()
    
    if (containerBounds) {
      const newX = elementX.value + dx
      const newY = elementY.value + dy
      
      // Keep text within page bounds
      textElements.value[selectedTextId.value].x = Math.max(0, Math.min(newX, containerBounds.width - bounds.width))
      textElements.value[selectedTextId.value].y = Math.max(0, Math.min(newY, containerBounds.height - bounds.height))
    }
  }
}

const stopDragging = () => {
  if (isDragging.value) {
    isDragging.value = false
    draggedElement.value = null
    updatePDFWithText()
  }
  
  document.removeEventListener('mousemove', handleDragging)
  document.removeEventListener('mouseup', stopDragging)
}

const updatePDFWithText = async () => {
  const newPdf = await PDFDocument.create()
  const pages = await newPdf.copyPages(props.pdf, props.pdf.getPageIndices())

  pages.forEach((page, pageIndex) => {
    newPdf.addPage(page)
    const pageTexts = getPageTextElements(pageIndex)
    
    Object.values(pageTexts).forEach(text => {
      const { r, g, b } = hexToRgb(text.color)
      page.drawText(text.content, {
        x: text.x,
        y: page.getHeight() - text.y,
        size: text.fontSize,
        color: rgb(r / 255, g / 255, b / 255),
        lineHeight: 1.2
      })
    })
  })

  emit('update:pdf', newPdf)
}

onMounted(() => {
  // Let the intersection observer handle initial rendering
  Object.entries(pageRefs.value).forEach(([index, element]) => {
    observer.observe(element)
  })
})

onBeforeUnmount(() => {
  cleanup()
  document.removeEventListener('mousemove', handleDragging)
  document.removeEventListener('mouseup', stopDragging)
  observer.disconnect()
})
</script>
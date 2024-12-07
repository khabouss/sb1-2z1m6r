<template>
  <footer class="bg-white border-t">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <nav class="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
        <div class="px-5 py-2">
          <NuxtLink to="/about" class="text-base text-gray-500 hover:text-gray-900">About Us</NuxtLink>
        </div>
        <div class="px-5 py-2">
          <NuxtLink to="/help" class="text-base text-gray-500 hover:text-gray-900">Help</NuxtLink>
        </div>
        <div class="px-5 py-2">
          <NuxtLink to="/contact" class="text-base text-gray-500 hover:text-gray-900">Contact</NuxtLink>
        </div>
        <div class="px-5 py-2">
          <NuxtLink to="/legal" class="text-base text-gray-500 hover:text-gray-900">Legal Notice</NuxtLink>
        </div>
        <div class="px-5 py-2">
          <NuxtLink to="/terms" class="text-base text-gray-500 hover:text-gray-900">Terms of Use</NuxtLink>
        </div>
        <div class="px-5 py-2">
          <NuxtLink to="/privacy" class="text-base text-gray-500 hover:text-gray-900">Privacy Policy</NuxtLink>
        </div>
        <div class="px-5 py-2">
          <button @click="openPrivacySettings" class="text-base text-gray-500 hover:text-gray-900">Privacy Settings</button>
        </div>
      </nav>
      <p class="mt-8 text-center text-base text-gray-400">
        © {{ new Date().getFullYear() }} PDF Tool. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const openPrivacySettings = () => {
  // TODO: Implement privacy settings modal
  console.log('Privacy settings clicked')
}
</script>
<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
    <div class="prose prose-lg mb-8">
      <p>We're here to help! Get in touch with us for any questions or support needs.</p>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
        <input
          type="text"
          id="subject"
          v-model="form.subject"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          id="message"
          v-model="form.message"
          rows="4"
          required
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      <button
        type="submit"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Send Message
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const form = ref({
  email: '',
  subject: '',
  message: ''
})

const submitForm = () => {
  // TODO: Implement form submission
  console.log('Form submitted:', form.value)
}
</script>
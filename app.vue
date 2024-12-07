<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/" class="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                PDF Tool
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <NuxtPage />
    
    <TheFooter />
  </div>
</template>

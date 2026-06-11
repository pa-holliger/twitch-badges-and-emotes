<template>
  <div class="h-screen flex flex-col bg-bg text-text overflow-hidden">
    <AppNav />
    <main class="flex-1 overflow-hidden">
      <RouterView />
    </main>
    <UserDialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import AppNav from "@/components/layout/AppNav.vue"
import UserDialog from "@/components/UserDialog.vue"
import { useUserDialog } from "@/composables/useUserDialog"
import { useBadgeStore } from "@/stores/badgeStore"
import { useEmoteStore } from "@/stores/emoteStore"
import { useUserStore } from "@/stores/userStore"

const userStore = useUserStore()
const emoteStore = useEmoteStore()
const badgeStore = useBadgeStore()
const { open } = useUserDialog()

onMounted(async () => {
  await Promise.all([userStore.load(), emoteStore.load(), badgeStore.load()])
  if (!userStore.pseudo) open()
})
</script>

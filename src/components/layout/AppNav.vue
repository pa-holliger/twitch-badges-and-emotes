<template>
  <nav class="h-14 bg-bg-alt border-b border-border flex items-center px-4 gap-1 shrink-0">
    <div class="flex items-center gap-2 mr-4">
      <span class="i-lucide-gamepad-2 text-purple text-xl" />
      <span class="font-bold text-purple text-sm hidden sm:block">Emote & Badge</span>
    </div>

    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium text-text-muted hover:text-text hover:bg-bg-elevated transition-colors"
      active-class="!text-text bg-bg-elevated">
      <span
        :class="link.icon"
        class="text-base" />
      {{ link.label }}
    </RouterLink>

    <div class="ml-auto flex items-center gap-1">
      <AppButton
        :icon="theme === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
        variant="ghost"
        :title="theme === 'dark' ? 'Mode clair' : 'Mode sombre'"
        @click="toggleTheme" />

      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-bg-elevated transition-colors ml-1 cursor-pointer"
        @click="open">
        <img
          v-if="userBadge"
          :src="userBadge.url"
          alt="badge"
          class="w-[18px] h-[18px] shrink-0">
        <span
          class="text-sm font-medium"
          :style="{ color: userStore.color }">
          {{ userStore.pseudo || "Mon profil" }}
        </span>
        <span class="i-lucide-chevron-down text-text-muted text-xs" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue"
import AppButton from "@/components/ui/AppButton.vue"
import { useTheme } from "@/composables/useTheme"
import { useUserDialog } from "@/composables/useUserDialog"
import { useBadgeStore } from "@/stores/badgeStore"
import { useUserStore } from "@/stores/userStore"

const { theme, toggleTheme } = useTheme()
const { open } = useUserDialog()
const userStore = useUserStore()
const badgeStore = useBadgeStore()

const userBadge = computed(() =>
  userStore.badgeId ? badgeStore.badges.find(b => b.id === userStore.badgeId) : undefined,
)

const links = [
  { to: "/simulation", label: "Simulation", icon: "i-lucide-message-square" },
  { to: "/import", label: "Import", icon: "i-lucide-folder-open" },
]
</script>

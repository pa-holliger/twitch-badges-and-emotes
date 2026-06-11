<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="px-6 py-3 border-b border-border bg-bg-alt flex items-center gap-3 shrink-0">
      <AppButton
        label="Ajouter un badge"
        icon="i-lucide-shield-plus"
        @click="showAddBadge = true" />
      <AppButton
        label="Ajouter une emote"
        icon="i-lucide-smile-plus"
        @click="showAddEmote = true" />
      <AppButton
        label="Importer depuis un dossier"
        icon="i-lucide-folder-open"
        variant="subtle"
        @click="showBulkImport = true" />
      <span class="text-text-muted text-xs ml-auto">
        {{ badgeStore.badges.length + emoteStore.emotes.length }} élément(s)
      </span>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div
        v-if="badgeStore.badges.length === 0 && emoteStore.emotes.length === 0"
        class="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
        <span class="i-lucide-package-open text-6xl opacity-20" />
        <p class="text-base">
          Aucun badge ni emote importé
        </p>
        <p class="text-xs opacity-60">
          Clique sur "Ajouter" pour commencer
        </p>
      </div>

      <table
        v-else
        class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-bg-alt sticky top-0">
            <th class="text-left text-xs font-medium text-text-muted px-6 py-2 w-16">
              Aperçu
            </th>
            <th class="text-left text-xs font-medium text-text-muted px-4 py-2 w-24">
              Type
            </th>
            <th class="text-left text-xs font-medium text-text-muted px-4 py-2">
              Détails
            </th>
            <th class="w-12" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="badge in badgeStore.badges"
            :key="badge.id"
            class="border-b border-border hover:bg-bg-elevated transition-colors">
            <td class="px-6 py-3">
              <img
                :src="badge.url"
                alt="badge"
                class="w-7 h-7 object-contain">
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 text-xs font-medium bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">
                <span class="i-lucide-shield text-xs" />
                Badge
              </span>
            </td>
            <td class="px-4 py-3 text-text">
              {{ BADGE_LEVEL_LABELS[badge.level] }} - Tier {{ badge.tier }}
            </td>
            <td class="px-4 py-3">
              <AppButton
                icon="i-lucide-trash-2"
                variant="ghost-danger"
                title="Supprimer"
                @click="badgeStore.remove(badge.id)" />
            </td>
          </tr>
          <tr
            v-for="emote in emoteStore.emotes"
            :key="emote.id"
            class="border-b border-border hover:bg-bg-elevated transition-colors">
            <td class="px-6 py-3">
              <img
                :src="emote.url"
                :alt="emote.name"
                class="w-7 h-7 object-contain">
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 text-xs font-medium bg-purple/15 text-purple px-2 py-0.5 rounded-full">
                <span class="i-lucide-smile text-xs" />
                Emote
              </span>
            </td>
            <td class="px-4 py-3 text-text font-mono text-xs">
              {{ emote.prefix }}{{ emote.name }}
            </td>
            <td class="px-4 py-3">
              <AppButton
                icon="i-lucide-trash-2"
                variant="ghost-danger"
                title="Supprimer"
                @click="emoteStore.remove(emote.id)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AddBadgeDialog v-model="showAddBadge" />
    <AddEmoteDialog v-model="showAddEmote" />
    <BulkImportDialog v-model="showBulkImport" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import AddBadgeDialog from "@/components/import/AddBadgeDialog.vue"
import AddEmoteDialog from "@/components/import/AddEmoteDialog.vue"
import BulkImportDialog from "@/components/import/BulkImportDialog.vue"
import AppButton from "@/components/ui/AppButton.vue"
import { BADGE_LEVEL_LABELS, useBadgeStore } from "@/stores/badgeStore"
import { useEmoteStore } from "@/stores/emoteStore"

const badgeStore = useBadgeStore()
const emoteStore = useEmoteStore()

const showAddBadge = ref(false)
const showAddEmote = ref(false)
const showBulkImport = ref(false)
</script>

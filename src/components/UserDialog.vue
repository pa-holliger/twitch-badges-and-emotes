<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
        @click.self="tryClose">
        <div class="bg-bg-alt border border-border rounded-xl w-full max-w-sm overflow-hidden shadow-xl">
          <div class="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 class="font-semibold text-text">
              Mon profil
            </h2>
            <AppButton
              v-if="!isFirstVisit"
              icon="i-lucide-x"
              variant="ghost"
              @click="close" />
          </div>

          <div class="px-5 py-4 flex flex-col gap-4">
            <div>
              <label class="text-xs font-medium text-text-muted block mb-1.5">Pseudonyme</label>
              <input
                v-model="form.pseudo"
                placeholder="Ton pseudo"
                class="w-full bg-bg-elevated border border-border rounded px-3 py-2 text-sm text-text placeholder-text-muted/40 focus:outline-none focus:border-purple">
              <p
                v-if="pseudoError"
                class="text-red-400 text-xs mt-1">
                Le pseudonyme est requis
              </p>
            </div>

            <div>
              <label class="text-xs font-medium text-text-muted block mb-1.5">Couleur</label>
              <div class="flex gap-2">
                <button
                  v-for="c in USERNAME_COLORS"
                  :key="c"
                  class="w-6 h-6 rounded-full border-2 transition-all cursor-pointer"
                  :class="form.color === c ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'"
                  :style="{ backgroundColor: c }"
                  @click="form.color = c" />
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-text-muted block mb-1.5">Badge</label>
              <div
                v-if="badgeStore.badges.length === 0"
                class="text-xs text-text-muted/50 italic">
                Aucun badge importé
              </div>
              <div
                v-else
                class="flex flex-wrap gap-2">
                <button
                  class="w-9 h-9 rounded border-2 flex items-center justify-center transition-all text-text-muted cursor-pointer"
                  :class="form.badgeId === undefined ? 'border-purple' : 'border-border hover:border-text-muted'"
                  title="Aucun badge"
                  @click="form.badgeId = undefined">
                  <span class="i-lucide-x text-xs" />
                </button>
                <button
                  v-for="badge in badgeStore.badges"
                  :key="badge.id"
                  class="w-9 h-9 rounded border-2 p-0.5 transition-all cursor-pointer"
                  :class="form.badgeId === badge.id ? 'border-purple' : 'border-border hover:border-text-muted'"
                  :title="`Tier ${badge.tier} - ${BADGE_LEVEL_LABELS[badge.level]}`"
                  @click="form.badgeId = badge.id">
                  <img
                    :src="badge.url"
                    alt="badge"
                    class="w-full h-full object-contain">
                </button>
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-text-muted block mb-1.5">Prefix des emotes</label>
              <input
                v-model="form.prefix"
                placeholder="ex: BeeDB"
                class="w-full bg-bg-elevated border border-border rounded px-3 py-2 text-sm text-text placeholder-text-muted/40 focus:outline-none focus:border-purple">
              <p class="text-xs text-text-muted/50 mt-1">
                Ex : BeeDB → les emotes s'appellent BeeDBHype, BeeDBLol…
              </p>
            </div>

            <div
              v-if="!isFirstVisit"
              class="pt-2 border-t border-border">
              <AppButton
                label="Réinitialiser badges & emotes"
                icon="i-lucide-trash-2"
                variant="danger"
                class="w-full"
                @click="resetData" />
            </div>
          </div>

          <div class="px-5 py-4 border-t border-border flex justify-end gap-2">
            <AppButton
              v-if="!isFirstVisit"
              label="Annuler"
              variant="ghost"
              @click="close" />
            <AppButton
              label="Sauvegarder"
              :is-disabled="!form.pseudo.trim() || !form.color"
              @click="save" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue"
import AppButton from "@/components/ui/AppButton.vue"
import { useUserDialog } from "@/composables/useUserDialog"
import { BADGE_LEVEL_LABELS, useBadgeStore } from "@/stores/badgeStore"
import { useEmoteStore } from "@/stores/emoteStore"
import { USERNAME_COLORS, useUserStore } from "@/stores/userStore"

const { isOpen, close } = useUserDialog()
const userStore = useUserStore()
const badgeStore = useBadgeStore()
const emoteStore = useEmoteStore()

const isFirstVisit = computed(() => !userStore.pseudo)

const form = reactive({
  pseudo: "",
  color: USERNAME_COLORS[0],
  badgeId: undefined as string | undefined,
  prefix: "",
})

const pseudoError = computed(() => form.pseudo.trim() === "" && form.pseudo !== "")

watch(isOpen, (open) => {
  if (open) {
    form.pseudo = userStore.pseudo
    form.color = userStore.color
    form.badgeId = userStore.badgeId
    form.prefix = userStore.prefix
  }
})

function tryClose() {
  if (!isFirstVisit.value)
    close()
}

async function resetData() {
  // eslint-disable-next-line no-alert
  if (!confirm("Supprimer tous les badges et emotes importés ?"))
    return
  await Promise.all([badgeStore.clear(), emoteStore.clear()])
  form.badgeId = undefined
}

async function save() {
  if (!form.pseudo.trim()) {
    form.pseudo = ""
    return
  }
  await userStore.save({
    pseudo: form.pseudo.trim(),
    color: form.color,
    badgeId: form.badgeId,
    prefix: form.prefix,
  })
  close()
}
</script>

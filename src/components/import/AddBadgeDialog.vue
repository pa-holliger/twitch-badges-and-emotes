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
        v-if="modelValue"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
        @click.self="close">
        <div class="bg-bg-alt border border-border rounded-xl w-full max-w-sm overflow-hidden shadow-xl">
          <div class="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 class="font-semibold text-text">
              Ajouter un badge
            </h2>
            <AppButton
              icon="i-lucide-x"
              variant="ghost"
              @click="close" />
          </div>

          <div class="px-5 py-4 flex flex-col gap-4">
            <div>
              <label class="text-xs font-medium text-text-muted block mb-1.5">Niveau</label>
              <select
                v-model="form.level"
                class="w-full bg-bg-elevated border border-border rounded px-3 py-2 text-sm text-text focus:outline-none focus:border-purple cursor-pointer">
                <option
                  v-for="lvl in BADGE_LEVELS"
                  :key="lvl"
                  :value="lvl">
                  {{ BADGE_LEVEL_LABELS[lvl] }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-xs font-medium text-text-muted block mb-1.5">Tier</label>
              <div class="flex gap-2">
                <AppButton
                  v-for="t in [1, 2, 3] as const"
                  :key="t"
                  :label="`Tier ${t}`"
                  :variant="form.tier === t ? 'primary' : 'subtle'"
                  class="flex-1"
                  @click="form.tier = t" />
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-text-muted block mb-1.5">Image</label>
              <div
                class="border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer transition-colors"
                :class="isDragging ? 'border-purple bg-purple/5' : 'border-border hover:border-text-muted'"
                @click="fileInput?.click()"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop">
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  alt="preview"
                  class="max-h-full max-w-full object-contain p-2">
                <template v-else>
                  <span class="i-lucide-image-plus text-3xl text-text-muted/40" />
                  <p class="text-xs text-text-muted/60 mt-1">
                    Clic ou glisser-déposer
                  </p>
                </template>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/png,image/gif,image/webp,image/jpeg"
                class="hidden"
                @change="handleInputChange">
              <p
                v-if="form.sizeWarning"
                class="text-amber-400 text-xs mt-1.5 flex items-center gap-1">
                <span class="i-lucide-triangle-alert" />
                GIF volumineux (>500 KB) - peut ralentir le stockage
              </p>
            </div>
          </div>

          <div class="px-5 py-4 border-t border-border flex justify-end gap-2">
            <AppButton
              label="Annuler"
              variant="ghost"
              @click="close" />
            <AppButton
              label="Ajouter"
              :is-disabled="!form.blob"
              @click="confirm" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, ref, watch } from "vue"
import AppButton from "@/components/ui/AppButton.vue"
import { BADGE_LEVEL_LABELS, BADGE_LEVELS, useBadgeStore } from "@/stores/badgeStore"
import { processImage } from "@/utils/imageUtils"

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ "update:modelValue": [boolean] }>()

const badgeStore = useBadgeStore()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const isDragging = ref(false)

const form = reactive({
  level: 1,
  tier: 1 as 1 | 2 | 3,
  blob: null as Blob | null,
  sizeWarning: false,
})

watch(() => props.modelValue, (open) => {
  if (open)
    resetForm()
})

function resetForm() {
  form.level = 1
  form.tier = 1
  form.blob = null
  form.sizeWarning = false
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function close() {
  emit("update:modelValue", false)
}

async function processFile(file: File) {
  const result = await processImage(file)
  form.blob = result.blob
  form.sizeWarning = result.sizeWarning
  if (previewUrl.value)
    URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(result.blob)
}

function handleInputChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file)
    processFile(file)
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file)
    processFile(file)
}

async function confirm() {
  if (!form.blob)
    return

  const existing = badgeStore.badges.find(b => b.tier === form.tier && b.level === form.level)
  if (existing)
    await badgeStore.remove(existing.id)

  await badgeStore.add({
    id: crypto.randomUUID(),
    filename: "",
    level: form.level,
    tier: form.tier,
    blob: form.blob,
  })
  close()
}

onUnmounted(() => {
  if (previewUrl.value)
    URL.revokeObjectURL(previewUrl.value)
})
</script>

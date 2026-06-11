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
              Ajouter une emote
            </h2>
            <AppButton
              icon="i-lucide-x"
              variant="ghost"
              @click="close" />
          </div>

          <div class="px-5 py-4 flex flex-col gap-4">
            <div>
              <label class="text-xs font-medium text-text-muted block mb-1.5">Nom</label>
              <div class="flex items-center gap-0">
                <span
                  v-if="userStore.prefix"
                  class="px-3 py-2 bg-bg-elevated border border-border border-r-0 rounded-l text-sm text-text-muted shrink-0">
                  {{ userStore.prefix }}
                </span>
                <input
                  v-model="form.name"
                  placeholder="Kappa"
                  class="flex-1 bg-bg-elevated border border-border px-3 py-2 text-sm text-text placeholder-text-muted/40 focus:outline-none focus:border-purple"
                  :class="userStore.prefix ? 'rounded-r' : 'rounded'">
              </div>
              <p
                v-if="nameError"
                class="text-red-400 text-xs mt-1">
                Le nom est requis
              </p>
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
              :is-disabled="!form.blob || !form.name.trim()"
              @click="confirm" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from "vue"
import AppButton from "@/components/ui/AppButton.vue"
import { useEmoteStore } from "@/stores/emoteStore"
import { useUserStore } from "@/stores/userStore"
import { processImage } from "@/utils/imageUtils"

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ "update:modelValue": [boolean] }>()

const IMAGE_EXTENSION_REGEX = /\.(png|gif|webp|jpe?g)$/i

const emoteStore = useEmoteStore()
const userStore = useUserStore()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const isDragging = ref(false)

const form = reactive({
  name: "",
  blob: null as Blob | null,
  sizeWarning: false,
})

const nameError = computed(() => form.name === "" && form.blob !== null)

watch(() => props.modelValue, (open) => {
  if (open)
    resetForm()
})

function resetForm() {
  form.name = ""
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
  if (!form.name) {
    form.name = file.name.replace(IMAGE_EXTENSION_REGEX, "")
  }
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
  if (!form.blob || !form.name.trim())
    return

  const fullName = `${userStore.prefix}${form.name.trim()}`
  const existing = emoteStore.emotes.find(e => `${e.prefix}${e.name}` === fullName)
  if (existing)
    await emoteStore.remove(existing.id)

  await emoteStore.add({
    id: crypto.randomUUID(),
    filename: "",
    name: form.name.trim(),
    prefix: userStore.prefix,
    blob: form.blob,
  })
  close()
}

onUnmounted(() => {
  if (previewUrl.value)
    URL.revokeObjectURL(previewUrl.value)
})
</script>

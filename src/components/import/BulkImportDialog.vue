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
        @click.self="tryClose">
        <div class="bg-bg-alt border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[80vh]">
          <div class="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
            <h2 class="font-semibold text-text">
              Importer depuis un dossier
            </h2>
            <AppButton
              icon="i-lucide-x"
              variant="ghost"
              @click="close" />
          </div>

          <div class="flex-1 overflow-y-auto">
            <div
              v-if="state === 'idle'"
              class="px-5 py-4 flex flex-col gap-4">
              <p class="text-sm text-text-muted">
                Sélectionne un dossier - les images sont reconnues selon leur nom :
              </p>

              <div class="bg-bg-elevated rounded-lg p-4 flex flex-col gap-3">
                <div class="flex items-start gap-3">
                  <code class="text-xs text-blue-400 shrink-0 min-w-40">badge-1-tier-2.png</code>
                  <span class="text-xs text-text-muted">Badge niveau 1 mois, tier 2</span>
                </div>
                <div class="flex items-start gap-3">
                  <code class="text-xs text-blue-400 shrink-0 min-w-40">badge-6.png</code>
                  <span class="text-xs text-text-muted">Badge niveau 6 mois, tier 1 (par défaut)</span>
                </div>
                <div class="flex items-start gap-3">
                  <code class="text-xs text-purple shrink-0 min-w-40">emote-Kappa.png</code>
                  <span class="text-xs text-text-muted">
                    Emote nommée
                    <span class="text-text">{{ userStore.prefix || '{prefix}' }}Kappa</span>
                  </span>
                </div>
              </div>

              <div class="text-xs text-text-muted/60 flex flex-col gap-1">
                <p>Niveaux valides : {{ BADGE_LEVELS.join(", ") }} mois</p>
                <p>Formats acceptés : PNG, GIF, WebP, JPEG</p>
                <p>Les fichiers non reconnus seront ignorés.</p>
              </div>
            </div>

            <div
              v-else-if="state === 'preview'"
              class="px-5 py-4 flex flex-col gap-4">
              <div
                v-if="parsed.length === 0 && ignored.length === 0"
                class="text-center py-8 text-sm text-text-muted">
                Aucun fichier reconnu dans ce dossier.
              </div>

              <div v-if="parsed.length > 0">
                <p class="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                  {{ parsed.length }} élément(s) à importer
                </p>
                <div class="flex flex-col gap-1">
                  <div
                    v-for="item in parsed"
                    :key="item.filename"
                    class="flex items-center gap-3 py-2 px-3 rounded-lg bg-bg-elevated">
                    <img
                      :src="item.previewUrl"
                      alt=""
                      class="w-8 h-8 object-contain shrink-0">
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-text truncate font-mono">
                        {{ item.filename }}
                      </p>
                      <p class="text-xs text-text-muted">
                        <template v-if="item.kind === 'badge'">
                          Badge - {{ BADGE_LEVEL_LABELS[item.level] }}, Tier {{ item.tier }}
                        </template>
                        <template v-else>
                          Emote - {{ userStore.prefix }}{{ item.name }}
                        </template>
                      </p>
                    </div>
                    <span
                      class="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                      :class="item.kind === 'badge' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple/15 text-purple'">
                      {{ item.kind === "badge" ? "Badge" : "Emote" }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="ignored.length > 0">
                <p class="text-xs font-medium text-text-muted/50 uppercase tracking-wide mb-2">
                  {{ ignored.length }} fichier(s) ignoré(s)
                </p>
                <div class="flex flex-col gap-1">
                  <div
                    v-for="item in ignored"
                    :key="item.filename"
                    class="flex items-center gap-3 py-2 px-3 rounded-lg bg-bg-elevated">
                    <span class="i-lucide-ban text-text-muted/30 text-lg block shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="text-xs text-text-muted truncate font-mono">
                        {{ item.filename }}
                      </p>
                      <p class="text-xs text-text-muted/50">
                        {{ item.reason }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-5 py-4 border-t border-border flex items-center justify-between gap-2 shrink-0">
            <div>
              <AppButton
                v-if="state === 'preview'"
                label="Rechoisir"
                icon="i-lucide-folder-open"
                variant="ghost"
                :is-loading="isPicking"
                @click="pickFolder" />
            </div>
            <div class="flex gap-2">
              <AppButton
                label="Annuler"
                variant="ghost"
                @click="close" />
              <AppButton
                v-if="state === 'idle'"
                label="Choisir un dossier"
                icon="i-lucide-folder-open"
                :is-loading="isPicking"
                @click="pickFolder" />
              <AppButton
                v-else-if="state === 'preview'"
                label="Importer"
                icon="i-lucide-download"
                :is-disabled="parsed.length === 0"
                :is-loading="isImporting"
                @click="doImport" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue"
import AppButton from "@/components/ui/AppButton.vue"
import { BADGE_LEVEL_LABELS, BADGE_LEVELS, useBadgeStore } from "@/stores/badgeStore"
import { useEmoteStore } from "@/stores/emoteStore"
import { useUserStore } from "@/stores/userStore"
import { processImage } from "@/utils/imageUtils"

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ "update:modelValue": [boolean] }>()

type ParsedBadge = { kind: "badge", level: number, tier: 1 | 2 | 3, file: File, previewUrl: string, filename: string }
type ParsedEmote = { kind: "emote", name: string, file: File, previewUrl: string, filename: string }
type ParsedItem = ParsedBadge | ParsedEmote
type IgnoredItem = { filename: string, reason: string }

const IMAGE_EXT_REGEX = /\.(png|gif|webp|jpe?g)$/i
const BADGE_FILE_REGEX = /^badge-(\d+)(?:-tier-([123]))?$/i
const EMOTE_FILE_REGEX = /^emote-(.+)$/i

const badgeStore = useBadgeStore()
const emoteStore = useEmoteStore()
const userStore = useUserStore()

const state = ref<"idle" | "preview">("idle")
const isPicking = ref(false)
const isImporting = ref(false)
const parsed = ref<ParsedItem[]>([])
const ignored = ref<IgnoredItem[]>([])

watch(() => props.modelValue, (open) => {
  if (open)
    reset()
  else revokeAll()
})

function revokeAll() {
  parsed.value.forEach(item => URL.revokeObjectURL(item.previewUrl))
}

function reset() {
  revokeAll()
  state.value = "idle"
  parsed.value = []
  ignored.value = []
}

function close() {
  emit("update:modelValue", false)
}

function tryClose() {
  if (!isImporting.value)
    close()
}

async function pickFolder() {
  if (isPicking.value)
    return
  isPicking.value = true
  try {
    const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker()
    revokeAll()
    const newParsed: ParsedItem[] = []
    const newIgnored: IgnoredItem[] = []

    for await (const handle of (dirHandle as any).values()) {
      if (handle.kind !== "file")
        continue
      const name: string = handle.name
      if (!IMAGE_EXT_REGEX.test(name))
        continue

      const stem = name.replace(IMAGE_EXT_REGEX, "")
      const file: File = await handle.getFile()

      const badgeMatch = stem.match(BADGE_FILE_REGEX)
      if (badgeMatch) {
        const level = Number(badgeMatch[1])
        if (!(BADGE_LEVELS as readonly number[]).includes(level)) {
          newIgnored.push({ filename: name, reason: `Niveau ${level} invalide (valides : ${BADGE_LEVELS.join(", ")})` })
          continue
        }
        const tier = (badgeMatch[2] ? Number(badgeMatch[2]) : 1) as 1 | 2 | 3
        newParsed.push({ kind: "badge", level, tier, file, previewUrl: URL.createObjectURL(file), filename: name })
        continue
      }

      const emoteMatch = stem.match(EMOTE_FILE_REGEX)
      if (emoteMatch) {
        newParsed.push({ kind: "emote", name: emoteMatch[1], file, previewUrl: URL.createObjectURL(file), filename: name })
        continue
      }

      newIgnored.push({ filename: name, reason: "Nom non reconnu (attendu : badge-X[-tier-Y] ou emote-Nom)" })
    }

    parsed.value = newParsed
    ignored.value = newIgnored
    state.value = "preview"
  }
  catch (err: unknown) {
    if ((err as { name?: string })?.name !== "AbortError")
      console.error(err)
  }
  finally {
    isPicking.value = false
  }
}

async function doImport() {
  if (isImporting.value)
    return
  isImporting.value = true
  try {
    for (const item of parsed.value) {
      const { blob } = await processImage(item.file)
      if (item.kind === "badge") {
        const existing = badgeStore.badges.find(b => b.tier === item.tier && b.level === item.level)
        if (existing)
          await badgeStore.remove(existing.id)
        await badgeStore.add({ id: crypto.randomUUID(), filename: item.filename, level: item.level, tier: item.tier, blob })
      }
      else {
        const fullName = `${userStore.prefix}${item.name}`
        const existing = emoteStore.emotes.find(e => `${e.prefix}${e.name}` === fullName)
        if (existing)
          await emoteStore.remove(existing.id)
        await emoteStore.add({ id: crypto.randomUUID(), filename: item.filename, name: item.name, prefix: userStore.prefix, blob })
      }
    }
  }
  finally {
    isImporting.value = false
    close()
  }
}

onUnmounted(revokeAll)
</script>

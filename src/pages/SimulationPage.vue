<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center gap-3 px-4 py-2 border-b border-border bg-bg-alt flex-shrink-0 flex-wrap">
      <AppButton
        :icon="isRunning ? 'i-lucide-square' : 'i-lucide-play'"
        :label="isRunning ? 'Arrêter' : 'Démarrer'"
        :variant="isRunning ? 'subtle-danger' : 'subtle-primary'"
        class="flex-shrink-0"
        @click="toggleRunning" />

      <div class="flex items-center gap-2">
        <span class="i-lucide-gauge text-text-muted text-base flex-shrink-0" />
        <input
          v-model.number="speed"
          type="range"
          min="0"
          max="4"
          step="0.1"
          class="w-28 accent-purple cursor-pointer"
        />
        <span class="text-xs text-text-muted w-16 flex-shrink-0">
          {{ speed === 0 ? "En pause" : `${speed.toFixed(1)} msg/s` }}
        </span>
      </div>

      <AppButton
        icon="i-lucide-trash-2"
        variant="subtle"
        class="flex-shrink-0"
        @click="clearChat" />

      <span class="text-text-muted text-xs">{{ messages.length }} messages</span>
    </div>

    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto py-1"
      style="scrollbar-width: thin; scrollbar-color: var(--border) transparent"
    >
      <ChatMessage
        v-for="msg in messages"
        :key="msg.id"
        :username="msg.username"
        :username-color="msg.color"
        :badge="msg.badge"
        :message="msg.message"
      />
      <div
        v-if="messages.length === 0"
        class="flex flex-col items-center justify-center h-full gap-3 text-text-muted"
      >
        <span class="i-lucide-message-square text-5xl opacity-20" />
        <p class="text-sm">Lance la simulation pour voir le chat défiler</p>
      </div>
    </div>

    <div class="border-t border-border bg-bg-alt px-4 py-3 flex-shrink-0">
      <div
        v-if="showEmotePicker"
        class="mb-2 bg-bg-elevated border border-border rounded-lg p-2 flex flex-col gap-2 max-h-36 overflow-y-auto"
      >
        <div v-if="emoteStore.emotes.length > 0">
          <p class="text-xs font-medium text-text-muted px-1 mb-1">{{ userStore.pseudo }}</p>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="emote in emoteStore.emotes"
              :key="emote.id"
              class="group relative p-1 rounded hover:bg-bg-alt transition-colors cursor-pointer"
              @click="insertEmote(emote)"
            >
              <img :src="emote.url" :alt="emote.name" class="w-8 h-8 object-contain" />
              <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-bg-alt border border-border rounded text-xs text-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {{ userStore.prefix }}{{ emote.name }}
              </span>
            </button>
          </div>
        </div>

        <div
          v-if="emoteStore.emotes.length > 0"
          class="border-t border-border" />

        <div class="flex flex-wrap gap-1">
          <button
            v-for="emote in DEFAULT_EMOTES"
            :key="emote.id"
            class="group relative p-1 rounded hover:bg-bg-alt transition-colors cursor-pointer"
            @click="insertEmote(emote)"
          >
            <img :src="emote.url" :alt="emote.name" class="w-8 h-8 object-contain" />
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-bg-alt border border-border rounded text-xs text-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              {{ emote.name }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <img
          v-if="userBadge"
          :src="userBadge.url"
          alt="badge"
          class="w-[18px] h-[18px] flex-shrink-0"
        />

        <button
          class="flex-shrink-0 p-1.5 rounded hover:bg-bg-elevated transition-colors"
          :class="showEmotePicker ? 'text-purple' : 'text-text-muted hover:text-text'"
          @click="showEmotePicker = !showEmotePicker"
        >
          <span class="i-lucide-smile text-lg block" />
        </button>

        <input
          ref="messageInput"
          v-model="ownMessage"
          placeholder="Envoyer un message..."
          class="flex-1 bg-bg-elevated border border-border rounded px-3 py-2 text-sm text-text placeholder-text-muted/40 focus:outline-none focus:border-purple"
          @keydown.enter="sendOwnMessage"
        />

        <AppButton
          icon="i-lucide-send-horizontal"
          :is-disabled="!ownMessage.trim()"
          class="flex-shrink-0"
          @click="sendOwnMessage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue"
import AppButton from "@/components/ui/AppButton.vue"
import ChatMessage from "@/components/chat/ChatMessage.vue"
import { DEFAULT_EMOTES } from "@/data/defaultEmotes"
import { useBadgeStore } from "@/stores/badgeStore"
import { useEmoteStore } from "@/stores/emoteStore"
import { useUserStore } from "@/stores/userStore"
import type { Badge } from "@/stores/badgeStore"
import type { Emote } from "@/stores/emoteStore"

const badgeStore = useBadgeStore()
const emoteStore = useEmoteStore()
const userStore = useUserStore()

const USERNAME_COLORS = ["#ff4500", "#ff0000", "#ff69b4", "#9acd32", "#1e90ff", "#daa520", "#8a2be2"]

const USERNAMES = [
  "xXSniperPro99Xx", "PogChampion42", "NightOwl_Gamer", "StreamerFan2024",
  "TwitchAddict_Fr", "LootGoblin", "ChaoticNeutral", "PixelKnight77",
  "DragonSlayer_EU", "MidnightCoder", "RetroGamer90s", "CryptoVibes",
  "VoidWalker69", "ProClipperXD", "BaguettePower", "GigaChad_Real",
  "TouchGrassPlz", "NoCapsLock", "Rattatouille_", "SpeedrunAnon",
  "BasedAndPilled", "Sheeeeeesh", "NotLikeThis99", "KappaKing",
  "ModeratorGod", "SubGifterLvl9", "Hypemaster3000", "ValorantPro_",
  "GenshinMain_", "LeagueOfPain", "WarzoneCarry", "MinecraftDad",
  "AmongUsPlayer", "FortniteKid_", "WoWVeteran2004", "DarkSoulsLore",
  "AnimeWatcher_", "VTuberSimp", "BackseatGamer", "JustChatting_",
  "Monsieur_Baguette", "Croissant_Fr", "Pierre_Gaming", "LaSainteUnion",
  "RaidLeader99", "ClipOrMiss", "EmoteOnly_", "Lurker_Supreme",
  "F_in_Chat", "Sadge_Moment",
]

const BASE_MESSAGES = [
  "KEKW", "PogChamp!!", "that was insane", "Clap Clap Clap", "OMEGALUL",
  "ez clap", "W", "LETS GOOOO", "skill issue", "FeelsGoodMan",
  "actually cracked", "hold on what", "no way bro", "gg", "gg ez",
  "im crying", "wtf was that", "based", "W streamer", "chat is this real",
  "go next", "bruh", "copium", "touch grass", "actually insane",
  "no shot", "banger", "true", "he doesnt know", "the audacity",
  "mid", "bozo", "rookie numbers", "certified moment", "lowkey clean",
  "sus", "no cap", "we are SO back", "its over", "we go again",
  "first try pls", "respectfully no", "real", "he cooked", "Clap",
  "literally insane", "my sides", "unreal", "this is normal", "THE PEAK",
]

type ChatEntry = {
  id: number
  username: string
  color: string
  badge?: Badge
  message: string
}

function hash(str: string) {
  return str.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

const userBadge = computed(() =>
  userStore.badgeId ? badgeStore.badges.find(b => b.id === userStore.badgeId) : undefined,
)

const allEmotes = computed(() => [...DEFAULT_EMOTES, ...emoteStore.emotes])

function getBadgeForUser(username: string): Badge | undefined {
  if (!badgeStore.badges.length) return undefined
  const slot = hash(username) % (badgeStore.badges.length + 1)
  return slot < badgeStore.badges.length ? badgeStore.badges[slot] : undefined
}

function buildMessage(): string {
  const base = BASE_MESSAGES[Math.floor(Math.random() * BASE_MESSAGES.length)]
  if (Math.random() > 0.4) return base
  const pool = allEmotes.value
  const emote = pool[Math.floor(Math.random() * pool.length)]
  const name = emote.id.startsWith("__") ? emote.name : `${userStore.prefix}${emote.name}`
  const r = Math.random()
  if (r < 0.33) return `${name} ${base}`
  if (r < 0.66) return `${base} ${name}`
  return `${name} ${base} ${name}`
}

const messages = ref<ChatEntry[]>([])
const chatContainer = ref<HTMLElement | null>(null)
const messageInput = ref<HTMLInputElement | null>(null)
const isRunning = ref(false)
const speed = ref(1)
const ownMessage = ref("")
const showEmotePicker = ref(false)
let msgId = 0
let timeoutId: ReturnType<typeof setTimeout> | null = null

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  })
}

function pushMessage(entry: ChatEntry) {
  messages.value.push(entry)
  if (messages.value.length > 200) messages.value.shift()
  scrollToBottom()
}

function scheduleNext() {
  if (!isRunning.value || speed.value === 0) return
  const base = 1000 / speed.value
  timeoutId = setTimeout(() => {
    timeoutId = null
    const username = USERNAMES[Math.floor(Math.random() * USERNAMES.length)]
    pushMessage({
      id: msgId++,
      username,
      color: USERNAME_COLORS[hash(username) % USERNAME_COLORS.length],
      badge: getBadgeForUser(username),
      message: buildMessage(),
    })
    scheduleNext()
  }, base * (0.8 + Math.random() * 0.4))
}

function toggleRunning() {
  isRunning.value = !isRunning.value
  if (isRunning.value) {
    scheduleNext()
  }
  else {
    if (timeoutId) { clearTimeout(timeoutId); timeoutId = null }
  }
}

watch(speed, (newSpeed) => {
  if (!isRunning.value) return
  if (timeoutId) { clearTimeout(timeoutId); timeoutId = null }
  if (newSpeed > 0) scheduleNext()
})

function clearChat() {
  messages.value = []
}

function sendOwnMessage() {
  if (!ownMessage.value.trim()) return
  pushMessage({
    id: msgId++,
    username: userStore.pseudo || "Moi",
    color: userStore.color,
    badge: userBadge.value,
    message: ownMessage.value.trim(),
  })
  ownMessage.value = ""
  showEmotePicker.value = false
  messageInput.value?.focus()
}

function insertEmote(emote: Emote) {
  const name = emote.id.startsWith("__") ? emote.name : `${userStore.prefix}${emote.name}`
  ownMessage.value = ownMessage.value ? `${ownMessage.value} ${name}` : name
  messageInput.value?.focus()
}

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <div class="flex items-start gap-1 py-0.5 px-3 hover:bg-bg-elevated transition-colors">
    <span
      v-if="badge"
      class="shrink-0 mt-[3px] w-[18px] h-[18px]">
      <img
        :src="badge.url"
        :alt="`${badge.level}m`"
        class="w-[18px] h-[18px]">
    </span>
    <span class="text-sm wrap-break-word min-w-0 leading-[22px]">
      <span
        class="font-semibold"
        :style="{ color: usernameColor }">{{ username }}</span>
      <span class="text-text-muted">: </span>
      <template
        v-for="(part, i) in parsedMessage"
        :key="i">
        <img
          v-if="part.type === 'emote'"
          :src="part.url"
          :alt="part.text"
          class="w-7 h-7 inline-block align-middle mx-0.5">
        <span
          v-else
          class="text-text">{{ part.text }}</span>
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { Badge } from "@/stores/badgeStore"
import { computed } from "vue"
import { useEmoteStore } from "@/stores/emoteStore"

const props = defineProps<{
  username: string
  usernameColor: string
  badge?: Badge
  message: string
}>()

const emoteStore = useEmoteStore()

type MessagePart = { type: "text" | "emote", text: string, url?: string }

const parsedMessage = computed<MessagePart[]>(() => {
  const parts: MessagePart[] = []

  for (const word of props.message.split(" ")) {
    const emote = emoteStore.emotes.find((e) => {
      const fullName = e.prefix ? `${e.prefix}${e.name}` : e.name
      return fullName === word
    })

    if (emote) {
      parts.push({ type: "emote", text: word, url: emote.url })
    }
    else {
      const last = parts.at(-1)
      if (last?.type === "text") {
        last.text += ` ${word}`
      }
      else {
        parts.push({ type: "text", text: word })
      }
    }
  }

  return parts
})
</script>

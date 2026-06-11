<template>
  <button
    :disabled="isDisabled || isLoading"
    class="inline-flex items-center justify-center gap-1.5 h-9 rounded text-sm font-medium transition-colors"
    :class="[variantClasses, cursorClass, paddingClass]"
  >
    <span
      v-if="isLoading"
      class="i-lucide-loader-circle animate-spin text-base block shrink-0" />
    <span
      v-else-if="icon"
      :class="icon"
      class="text-base block shrink-0" />
    <span v-if="label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(defineProps<{
  label?: string
  icon?: string
  isDisabled?: boolean
  isLoading?: boolean
  variant?: "primary" | "ghost" | "ghost-danger" | "danger" | "subtle" | "subtle-primary" | "subtle-danger"
}>(), {
  variant: "primary",
  isDisabled: false,
  isLoading: false,
})

const inactive = computed(() => props.isDisabled || props.isLoading)

const paddingClass = computed(() => props.label ? "px-4" : "px-2")

const cursorClass = computed(() => {
  if (props.isDisabled) return "cursor-not-allowed"
  if (props.isLoading) return "cursor-wait"
  return "cursor-pointer"
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case "ghost":
      return inactive.value
        ? "text-text-muted/40"
        : "text-text-muted hover:text-text hover:bg-bg-elevated"
    case "ghost-danger":
      return inactive.value
        ? "text-text-muted/40"
        : "text-text-muted hover:text-red-400 hover:bg-red-500/10"
    case "danger":
      return inactive.value
        ? "text-text-muted/40"
        : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
    case "subtle":
      return inactive.value
        ? "bg-bg-elevated text-text-muted/40"
        : "bg-bg-elevated text-text-muted hover:text-text"
    case "subtle-primary":
      return inactive.value
        ? "bg-bg-elevated text-text-muted/40"
        : "bg-purple/20 text-purple hover:bg-purple/30"
    case "subtle-danger":
      return inactive.value
        ? "bg-bg-elevated text-text-muted/40"
        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
    default:
      return inactive.value
        ? "bg-bg-elevated text-text-muted"
        : "bg-purple text-white hover:bg-purple-hover"
  }
})
</script>

<template>
  <div class="page-actions" v-if="!readonly">
    <BaseButton
      v-if="isEdit"
      variant="outline-danger"
      @click="$emit('delete')"
      :disabled="isLoading"
    >
      Удалить
    </BaseButton>
    <BaseButton
      variant="secondary"
      @click="$emit('cancel')"
      :disabled="isLoading"
    >
      Отменить
    </BaseButton>
    <BaseButton
      variant="primary"
      @click="$emit('save')"
      :loading="isLoading"
      :disabled="!isFormValid"
    >
      {{ isEdit ? "Сохранить" : "Создать" }}
    </BaseButton>
  </div>
</template>

<script>
import BaseButton from "@/components/ui/BaseButton.vue";

export default {
  name: "TemplateActions",

  components: {
    BaseButton,
  },

  props: {
    readonly: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isFormValid: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["delete", "cancel", "save"],
};
</script>

<style lang="scss" scoped>
@use "@/styles/variables" as *;

.page-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}
</style>

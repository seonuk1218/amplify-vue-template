<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import Index from "@/pages/index.vue";
</script>

<template>
  <main>
    <authenticator>
      <template v-slot="{ signOut }">
        <Index />
        <button @click="signOut">Sign Out</button>
      </template>
    </authenticator>
  </main>
</template>

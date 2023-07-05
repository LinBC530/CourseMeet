<template>
  <q-layout view="lHh lpR lFf">
    <!-- <q-drawer show-if-above v-model="leftDrawerOpen" side="left" elevated>
      <div id="user_tool">
        <q-list>
          <q-item-label header> Essential Links </q-item-label>
          <EssentialLink
            v-for="link in essentialLinks"
            :key="link.title"
            v-bind="link"
          />
        </q-list>
      </div>
    </q-drawer> -->

    <q-page-container>
      <q-page>
        <div class="window-height">
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
#user_tool {
  height: 100%;
  border: 2pt solid blue;
  margin: 20pt 0pt;
  border-radius: 0pt 50pt 50pt 0pt;
}
</style>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "#",
  },
  {
    title: "Github",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "#",
  },
  {
    title: "Discord Chat Channel",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "#",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

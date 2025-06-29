import { defineStore } from "pinia";

export const useTab = defineStore("useTab", {
  state: () => ({
    tab: 'join',
    tabHistory: [],
  }),
  persist: false,
  getters: {},
  actions: {
    /**
     * 變更當前的 tab
     * @param {string} type join | login | register | forget | reset
     */
    change_tab(type) {
      // type: join, login, register, forget, reset
      if (this.tab !== type) {
        this.tabHistory.push(this.tab);
        this.tab = type;
      }
    },
    back_to_previous_tab() {
      if (this.tabHistory.length) {
        this.tab = this.tabHistory.pop();
      }
    }
  },
});

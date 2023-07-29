import { defineStore } from "pinia";

export const useUserData = defineStore("UserData", {
  state: () => ({
    userID: null,
    userName: null,
  }),
  persist: true,
  getters: {},
  actions: {
    setUserData(id, name) {
      this.userID = id;
      this.userName = name;
    },
    haveUserData() {
      if (this.userID && this.userName) return true;
      else return false;
    },
  },
});

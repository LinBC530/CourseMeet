import { defineStore } from "pinia";

export const useUserData = defineStore("UserData", {
  state: () => ({
    userID: null,
    userEmail: null,
    userName: null,
  }),
  persist: true,
  getters: {},
  actions: {
    setUserData(id, name, email) {
      this.userID = id;
      this.userName = name;
      this.userEmail = email;
    },
    haveUserData() {
      if (this.userID && this.userName) return true;
      else return false;
    },
  },
});

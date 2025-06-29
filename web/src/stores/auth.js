import { defineStore } from "pinia";

export const useAuth = defineStore("useAuth", {
  state: () => ({
    user: {
      id: null,
      name: null,
      role: null,
      token: null,
    },
  }),
  persist: {
    storage: sessionStorage,
  },
  getters: {
    isLoggedIn: (state) => {
      return state.user.role === "user" && state.user.token !== null;
    },
    isTokenExpired: (state) => {
      if (!state.user.token) return true;

      try {
        const payload = JSON.parse(atob(state.user.token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp <= now;
      } catch (e) {
        return true;
      }
    },
  },
  actions: {
    setUser(user) {
      this.user.id = user.id;
      this.user.name = user.name;
      this.user.role = user.role;
      this.user.token = user.token;
    },
  },
});

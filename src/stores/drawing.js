import { defineStore } from "pinia";

export const useDrawData = defineStore("useDrawData", {
  state: () => ({
    // 這裡用來放變數，state會用ref()來儲存
    canvas: null,
    example: '範例'
  }),
  persist: false,
  getters: {},
  actions: {
    // 這裡用來放function
    example() {
      // 如果要在此用到上面的變數，要加上this指定變數
      console.log(this.example)
    }
  },
});

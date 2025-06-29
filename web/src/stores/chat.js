import { defineStore } from "pinia";
import { download_file } from "src/request/file.js";

export const useChatStore = defineStore("useChatStore", {
  state: () => ({
    messages: [],
  }),
  persist: false,
  getters: {},
  actions: {
    /**
     * 新增訊息到聊天記錄中
     * @description 如果訊息類型是圖片，則會下載圖片內容並將其添加到聊天記錄中，否則直接將內容添加到聊天記錄中。
     * @param {Object} message - 要新增的訊息物件
     * @param {string} message.type - 訊息類型，例如 "text" 或 "image"
     * @param {string} message.file_id - 圖片或檔案的ID，用於下載
     * @param {string} message.file_name - 圖片或檔案的名稱
     * @returns {Promise<void>}
     */
    async addMessage(message) {
      if (message.type === "image") {
        const { data } = await download_file(
          message.file_id,
        );
        message.content = data;
      }
      this.messages.push(message);
    },

    /**
     * 設定聊天記錄中的訊息
     * @description 處理每個訊息，如果訊息類型是圖片，則下載圖片內容並將其添加到聊天記錄中。
     * @param {Array} messages - 要設定的訊息陣列
     * @returns {Promise<void>}
     */
    async setMessages(messages) {
      // 處理每個訊息，下載圖片內容
      if (!Array.isArray(messages)) return;
      const processedMessages = await Promise.all(
        messages.map(async (message) => {
          if (message.type === "image") {
            const { data } = await download_file(
              message.file_id,
            );
            message.content = data;
          }
          return message;
        })
      );
      this.messages.push(...processedMessages);
    },
  },
});

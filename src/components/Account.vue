<script setup></script>

<template>
  <div id="account">
    <q-btn id="signOut" color="red" label="登出" />
  </div>
</template>

<style scoped>
#account {
  height: 100%;
}

#title {
  height: 30px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#content {
  height: calc(100% - 30px);
}

#signOut{
  width: 100%;
}

</style>

<template>
  <div class="header">
    <img class="logo" src="../../assets/imgs/DkSAPimg.png" />
    <div class="menu">
      <p id="appHeadingOne">Improved Dual-key Stealth Address Protocol for IoT</p>
    </div>
</div>
</template>

<script>
export default {
  name: 'Head',
  data () {
    return {
    }
  },
  methods: {
    handleSelect (key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style scoped>
.header {
  height: 4.5rem;
  padding: 0.5rem 1rem;
  display: flex;
  background-color: #ffffff;
}
.logo {
  height: 3rem;
}

#appHeadingOne{
    color: rgb(60, 87, 117);
    font-size: 2rem;
    font-family: sans-serif;
    margin: 0.5% auto;
}
</style>

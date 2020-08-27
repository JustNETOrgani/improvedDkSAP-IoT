<template>
  <div class="header">
    <el-row>
      <el-col :span="3" :offset="1">
        <img class="logo" src="../../assets/imgs/DkSAPimg.png" />
      </el-col>
      <el-col :span="18" :offset="1">
        <p id="appHeadingOne">Encryption and decentralized storage-based Dual-key Stealth Address Protocol for IoT</p>
      </el-col>
    </el-row>
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
  height: 5rem;
  width: 7rem;
  float: left;
}

#appHeadingOne{
    color: rgb(60, 87, 117);
    font-size: 2rem;
    font-family: sans-serif;
    margin: 0.5% auto;
    text-align: center;
}
</style>

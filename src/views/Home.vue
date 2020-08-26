<template>
  <div class="home">
    <Head></Head>
    <div id="homePage">
      <el-button id="btnInit" type="primary" plain>Initialize App</el-button>
    </div>
    <div id="footerDiv">
      <Footer></Footer>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Head from '@/components/header'
import Footer from '@/components/Footer'

export default {
  // name: 'Home',
  components: {
    Head,
    Footer
  }
}
</script>

<style scoped>
#homePage{
  margin: auto auto;
  width: 11rem;
  height: 11rem;
  border-color: rgb(155, 97, 108);
  border-radius: 50%;
  background-color: rgb(149, 173, 173);
}

#btnInit{
  margin: 4rem auto;
}
</style>

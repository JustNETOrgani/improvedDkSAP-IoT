<template>
  <div class="transact">
    <h1>This is transactions page</h1>
  </div>
</template>

<script>
// @ is an alias to /src
// import Head from '@/components/header'
// import Footer from '@/components/Footer'
// const ipfs = new window.Ipfs()
// import { symEncrypt, symDecrypt } from '@/assets/js/symEncryptAndDec'

export default {
  // name: 'Home',
  components: {
    // Footer
  },
  methods: {
    submitForm (formName) {
      if (this.userAccountIndexEntered.length !== 0) {
        this.$refs[formName].validate(valid => {
          if (valid) {
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>

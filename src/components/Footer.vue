<template>
  <div>
    <el-footer>
      <el-row :gutter="20">
          <p><u>Designed by JustNET from SWUST - P. R. CHINA</u></p>
          <p class="h6">Copyright © {{currentYear}} JPBLOCK. All rights reserved.</p>
    </el-row>
    </el-footer>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  data () {
    return {}
  },
  computed: {
    currentYear () {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>

</style>

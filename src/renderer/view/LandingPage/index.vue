<template>
  <div id="wrapper">
    <div class="main">
      <div class="tip" v-if="!initSuccess">
        <p class="tip-text">还没有您的授权记录，请点击下面的按钮进行授权</p>
        <button @click="requestAuthorize">GoogleDrive授权</button>
      </div>
    </div>
  </div>
</template>
<script>
import { checkInit, requestAuthorize } from '@/api/source'
export default {
  name: 'landing-page',
  data: () => {
    return {
      initSuccess: false
    }
  },
  async mounted () {
    let res = await checkInit()
    if (res.code == 200) {
      console.log('已存在授权信息')
      this.initSuccess = true
      this.$router.push({
        path: '/Main'
      })
    }
  },
  methods: {
    async requestAuthorize () {
      let res = await requestAuthorize()
      if (res.code == 200) {
        console.log('fetch success:', res.data)
        this.initSuccess = true
        this.$router.push({
          path: '/Main'
        })
      } else {
        console.log('fetch error:', res.message)
      }
    }
  }
}
</script>
<style lang="less" scoped>
#wrapper {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}

.main {
  text-align: center;
  position: relative;
  height: 100%;
  .tip {
    padding: 10rem 0 0 0;
    .tip-text {
      margin-bottom: 2rem;
      color: #000000;
    }
  }
}

button {
  font-size: 0.8em;
  cursor: pointer;
  outline: none;
  padding: 0.75em 2em;
  border-radius: 2em;
  display: inline-block;
  color: #fff;
  background-color: #4fc08d;
  transition: all 0.15s ease;
  box-sizing: border-box;
  border: 1px solid #4fc08d;
}
</style>

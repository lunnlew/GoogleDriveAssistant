<template>
  <div id="wrapper">
    <div class="main">
      <div class="tip" v-if="!initSuccess">
        <p class="tip-text">还没有您的授权记录，请点击下面的按钮进行授权</p>
        <button @click="showAuthorize">GoogleDrive授权</button>
      </div>
    </div>
    <Modal v-model="newKeysModel" width="50%">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>填写OAuth客户端凭据</span>
      </p>
      <div>
        <div style="padding-bottom: 10px">
          <Form :model="formItem" :label-width="0">
            <FormItem label>
              <Input
                v-model="formItem.keys"
                type="textarea"
                :autosize="{minRows: 15, maxRows: 20}"
                placeholder="请从GCP下载OAuth客户端凭据文件，将内容填写在文本框中"
              />
            </FormItem>
          </Form>
          <Alert :type="alertType" v-if="showAlert">{{alertInfo}}</Alert>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" long @click="saveKeys">提交</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { checkInit, requestAuthorize, saveKeys } from '@/api/source'
export default {
  name: 'landing-page',
  data: () => {
    return {
      formItem: {
        keys: ''
      },
      initSuccess: false,
      newKeysModel: false,
      errorCode: 200,
      showAlert: false,
      alertType: 'success',
      alertInfo: ''
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
    } else {
      this.errorCode = res.code
    }
  },
  methods: {
    async showAuthorize () {
      if (this.errorCode === 10012) {
        this.newKeysModel = true
      } else {
        await this.requestAuthorize()
      }
    },
    async saveKeys () {
      this.showAlert = false
      let res = await saveKeys(this.formItem)
      if (res.code == 200) {
        this.newKeysModel = false
        await this.requestAuthorize()
      } else {
        this.showAlert = true
        this.alertType = 'error'
        this.alertInfo = res.message
      }
    },
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

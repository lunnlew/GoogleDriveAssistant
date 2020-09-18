<template>
  <div class="PageContainer">
    <component :is="component" v-if="component" />
  </div>
</template>
<script>
export default {
  name: 'PageContainer',
  props: ['mainViewName'],
  components: {},
  data: () => {
    return {
      component: null
    }
  },
  watch: {
    mainViewName () {
      this.component = () => import(`@/view/${this.mainViewName}`)
    }
  },
  computed: {
    loadView () {
      console.log('mainViewName ' + this.mainViewName)
      if (!this.mainViewName) {
        return null
      }
      return () => import(`@/view/${this.mainViewName}`)
    }
  },
  mounted () {
    this.loadView()
      .then(() => {
        this.component = () => this.loadView()
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

</script>
<style lang="less">
.PageContainer {
  font-size: 13px;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
}

.pageHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0 25px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.15);
  color: hsla(0, 0%, 100%, 0.7);
  font-size: 15px;
  line-height: 60px;
}

.pageHeaderLeft {
  display: flex;
  align-items: center;
  flex: 1 1 25%;
  overflow: hidden;
  height: 100%;
  white-space: nowrap;
  justify-content: flex-start;
}

.pageHeaderRight {
  display: flex;
  align-items: center;
  flex: 1 1 25%;
  overflow: hidden;
  height: 100%;
  white-space: nowrap;
  justify-content: flex-end;
}

.PageScroller {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-x: hidden;
  overflow-y: scroll;
  padding-right: 5px;
  scrollbar-color: hsla(0, 0%, 100%, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 14px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    min-height: 50px;
    border: 3px solid transparent;
    border-radius: 8px;
    background-color: hsla(0, 0%, 100%, 0.2);
    background-clip: padding-box;

    &:hover {
      background-color: hsla(0, 0%, 100%, 0.3);
    }

    &:window-inactive {
      background-color: hsla(0, 0%, 100%, 0.05);
    }
  }
}
</style>

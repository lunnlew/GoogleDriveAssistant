<template>
  <div class="ContainerView">
    <div class="pageHeader">
      <div class="pageHeaderLeft">
        <Button type="primary" :loading="syncLoading" @click="syncList">同步数据</Button>
      </div>
      <div class="pageHeaderRight"></div>
    </div>
    <div class="PageContent">
      <div class="PageScroller">
        <div class="ListContainer">
          <Table stripe :columns="columns" :data="driveList">
            <template slot-scope="{ row }" slot="drive_id">{{ row.drive_id}}</template>
            <template slot-scope="{ row }" slot="drive_name">{{ row.drive_name}}</template>
            <template slot-scope="{ row }" slot="actions">
              <Button type="primary" @click="openUrl(row)">打开</Button>
            </template>
          </Table>
          <div style="text-align: left;margin-top: 30px;">
            <Page
              :total="total"
              show-total
              show-sizer
              show-elevator
              :page-size="pageSize"
              :current="currentPage"
              @on-change="changePage"
              @on-page-size-change="changeSizePage"
            ></Page>
          </div>
        </div>
      </div>
      <div class="infoWrapper" v-if="showExtraInfo">
        <div class="relativeWrapper">
          <div class="contentWrapper">
            <div class="content"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { fetchDriveList, syncDriveList, openDriveUrl } from '@/api/source'
export default {
  name: 'DriveListView',
  components: {},
  props: [],
  data: () => {
    return {
      showExtraInfo: false,
      showExtraData: {},
      currentPage: 1,
      pageSize: 10,
      syncLoading: false,
      total: 0,
      driveList: [],
      columns: [{
        title: '磁盘ID',
        key: 'drive_id',
        slot: 'drive_id'
      }, {
        title: '磁盘名称',
        key: 'drive_name',
        slot: 'drive_name'
      }, {
        title: '操作',
        slot: 'actions'
      }]
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    async loadData () {
      let res = await fetchDriveList({
        page: this.currentPage,
        size: this.pageSize
      })
      if (res && res.code == 200) {
        this.driveList = res.data.list
        this.total = res.data.total
      }
    },
    changePage (page) {
      this.currentPage = page
    },
    changeSizePage (size) {
      this.pageSize = size
    },
    openUrl (row) {
      openDriveUrl(row)
    },
    async syncList () {
      this.syncLoading = true
      let res = await syncDriveList({
        page: this.currentPage,
        size: this.pageSize
      })
      if (res && res.code == 200) {
        this.driveList = res.data.list
        this.total = res.data.total
      }
      setTimeout(() => {
        this.syncLoading = false
      }, 500)
    }
  },
  async mounted () { },
  watch: {
    pageSize () {
      this.loadData()
    },
    currentPage () {
      this.loadData()
    }
  },
  filters: {
  },
  computed: {
  }
}

</script>
<style lang="less" scoped>
.ContainerView {
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

  .tags span.label {
    padding: 0 9px;
    font-size: 14px;
  }
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

.PageContent {
  position: relative;
  flex-grow: 1;
}

.infoWrapper {
  display: block;
  position: absolute;
  z-index: 1000;
  top: 0;
  bottom: 0;
  left: 60%;
  right: 0;
  background-color: rgba(102, 102, 102, 0.37);
  overflow: hidden;
  -webkit-box-shadow: -3px 0px 6px 0px rgba(128, 128, 128, 0.56);
  -moz-box-shadow: -3px 0px 6px 0px rgba(128, 128, 128, 0.56);
  box-shadow: -3px 0px 6px 0px rgba(128, 128, 128, 0.56);
  will-change: left;
}

.relativeWrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.contentWrapper {
  color: #1a1a1a;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.content {
  background: #fff;
  overflow: auto;
  width: 100%;
  height: 100%;
  position: relative;

  padding: 5px 15px;
  height: 100%;
  word-wrap: break-word;
}

.PageScroller {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-x: hidden;
  overflow-y: scroll;
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

.ListContainer {
  perspective: 500px;
  padding: 0px 30px 50px 30px;
  background-color: #fff;
  min-height: 100%;
}
</style>

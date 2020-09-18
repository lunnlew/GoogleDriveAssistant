<template>
  <div class="ContainerView">
    <div class="pageHeader">
      <div class="pageHeaderLeft">
        <Button type="primary" @click="showcreateServiceAccounts">新建账号</Button>
      </div>
      <div class="pageHeaderRight"></div>
    </div>
    <div class="PageContent">
      <div class="PageScroller">
        <div class="ListContainer">
          <Table stripe :columns="columns" :data="accountsList">
            <template
              slot-scope="{ row }"
              slot="create_time"
            >{{ row.create_time | fmtDate('yyyy-MM-dd hh:mm') }}</template>
            <template slot-scope="{ row }" slot="enable">{{ row.enable | fmtState }}</template>
            <template
              slot-scope="{ row }"
              slot="task_status"
            >{{ row.dealed_items}} / {{ row.total_items}}</template>

            <template slot-scope="{ row }" slot="actions">
              <Button type="primary" @click="deleteItem(row)">删除</Button>
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
      <Modal v-model="createServiceAccountsModel">
        <p slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle"></Icon>
          <span>新建账号</span>
        </p>
        <div style="text-align:center">
          <div style="padding-bottom: 10px">
            <Input enter-button placeholder="项目名称" v-model="projectName" />
            <Input enter-button placeholder="账号数量" v-model="accountsNum" />
            <Alert
              :type="submitCreateServiceAccountsResult==200?'success':'error'"
              v-if="submitCreateServiceAccountsResult"
            >创建{{submitCreateServiceAccountsResult==200?'成功':'失败'}}</Alert>
          </div>
        </div>
        <div slot="footer">
          <Button type="primary" size="large" long @click="submitCreateServiceAccounts">提交</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>
<script>
import { listServiceAccounts, createServiceAccounts, deleteServiceAccount } from '@/api/source'
export default {
  name: 'accountsListView',
  components: {},
  props: [],
  data: () => {
    return {
      createServiceAccountsModel: false,
      showExtraInfo: false,
      showExtraData: {},
      currentPage: 1,
      pageSize: 10,
      submitCreateServiceAccountsResult: false,
      total: 0,
      accountsList: [],
      projectName: 'quickstart',
      accountsNum: 10,
      columns: [{
        title: '账号ID',
        key: 'uniqueId'
      }, {
        title: '账号名',
        key: 'name'
      }, {
        title: 'email',
        key: 'email'
      }, {
        title: '项目Id',
        key: 'projectId'
      }, {
        title: '状态',
        key: 'enable',
        slot: 'enable'
      }, {
        title: '创建时间',
        slot: 'create_time',
        key: 'create_time'
      }, {
        title: '操作',
        slot: 'actions'
      }]
    }
  },
  created () {
    this.loadData()
  },
  filters: {
    fmtState (enable) {
      return enable ? '有效' : '禁用'
    }
  },
  methods: {
    async loadData () {
      let res = await listServiceAccounts({
        page: this.currentPage,
        size: this.pageSize
      })
      if (res && res.code == 200) {
        this.accountsList = res.data.list
        this.total = res.data.total
      }
    },
    changePage (page) {
      this.currentPage = page
    },
    changeSizePage (size) {
      this.pageSize = size
    },
    showcreateServiceAccounts () {
      this.projectName = 'quickstart'
      this.accountsNum = 10
      this.createServiceAccountsModel = true
      this.submitCreateServiceAccountsResult = false
    },
    async submitCreateServiceAccounts () {
      if (!this.projectName || !this.accountsNum) {
        return
      }
      let res = await createServiceAccounts({
        projectName: this.projectName,
        accountsNum: this.accountsNum
      })
      this.submitCreateServiceAccountsResult = res || res.code
      if (res && res.code == 200) {
        this.createServiceAccountsModel = false
        this.loadData()
      }
      this.submitCreateServiceAccountsResult = false
    },
    async deleteItem (row) {
      let res = await deleteServiceAccount({
        email: row.email,
        projectId: row.projectId
      })
      if (res.code == 200) {
        this.loadData()
      } else {

      }
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
  computed: {}
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

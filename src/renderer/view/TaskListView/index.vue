<template>
  <div class="ContainerView">
    <div class="pageHeader">
      <div class="pageHeaderLeft">
        <Button type="primary" @click="showNewTask">新建任务</Button>
      </div>
      <div class="pageHeaderRight"></div>
    </div>
    <div class="PageContent">
      <div class="PageScroller">
        <div class="ListContainer">
          <Table stripe :columns="columns" :data="taskList">
            <template
              slot-scope="{ row }"
              slot="create_time"
            >{{ row.create_time | fmtDate('yyyy-MM-dd hh:mm') }}</template>
            <template slot-scope="{ row }" slot="task_id">{{ row.task_id}}</template>
            <template slot-scope="{ row }" slot="dealed_items">
              {{ row|buildProgress(taskStatus[row.task_id], 'dealed_items')}} / {{ row|buildProgress(taskStatus[row.task_id], 'total_items')}}
              <br />
              {{taskStatus[row.task_id]|buildInfo}}
            </template>
            <template slot-scope="{ row }" slot="actions">
              <Button
                type="primary"
                :loading="taskLoading[row.task_id]"
                @click="startTaskItem(row)"
                v-if="!row.is_complete"
              >{{taskLoading[row.task_id]?'进行中':'启动'}}</Button>
              <Button type="error" @click="deleteItem(row)">删除</Button>
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
      <Modal v-model="newTaskModel">
        <p slot="header" style="color:#f60;text-align:center">
          <Icon type="ios-information-circle"></Icon>
          <span>新建任务</span>
        </p>
        <div style="text-align:center">
          <div style="padding-bottom: 10px">
            <Input enter-button placeholder="需要抓取的链接" v-model="shareLink" />
            <Alert :type="alertType" v-if="showAlert">{{alertInfo}}</Alert>
          </div>
        </div>
        <div slot="footer">
          <Button type="primary" size="large" long @click="submitStartTask">提交</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>
<script>
import { fetchTaskList, newTask, startTask, deleteTask } from '@/api/source'
export default {
  name: 'TaskListView',
  components: {},
  props: [],
  data: () => {
    return {
      newTaskModel: false,
      showExtraInfo: false,
      showExtraData: {},
      currentPage: 1,
      pageSize: 10,
      total: 0,
      taskList: [],
      shareLink: '',
      alertType: 'success',
      alertInfo: '',
      showAlert: false,
      columns: [{
        title: '任务ID',
        key: 'task_id',
        slot: 'task_id'
      }, {
        title: '任务进度(已完成/总数)',
        slot: 'dealed_items',
        key: 'dealed_items'
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
  methods: {
    async loadData () {
      let res = await fetchTaskList({
        page: this.currentPage,
        size: this.pageSize
      })
      if (res && res.code == 200) {
        this.taskList = res.data.list
        this.total = res.data.total
      }
    },
    changePage (page) {
      this.currentPage = page
    },
    changeSizePage (size) {
      this.pageSize = size
    },
    showNewTask () {
      this.newTaskModel = true
      this.shareLink = ''
    },
    async submitStartTask () {
      if (!this.shareLink || this.shareLink == '') {
        return
      }
      let res = await newTask({
        link: this.shareLink
      })
      if (res && res.code == 200) {
        this.showAlert = false
        this.newTaskModel = false
        this.loadData()
        startTask({
          task_id: res.data.task_id
        })
        this.$store.dispatch('updateTaskLoading', {
          'task_id': res.data.task_id,
          'loading': true
        })
      } else {
        this.showAlert = true
        this.alertType = 'error'
        this.alertInfo = res.message
      }
    },
    startTaskItem (row) {
      this.$store.dispatch('updateTaskLoading', {
        'task_id': row.task_id,
        'loading': true
      })
      startTask({
        task_id: row.task_id
      })
    },
    async deleteItem (row) {
      let res = await deleteTask({
        task_id: row.task_id
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
  filters: {
    buildProgress (row, taskStatus, field) {
      if (taskStatus && field in taskStatus && taskStatus[field]) {
        if (field === 'dealed_items') {
          return row[field] + taskStatus[field]
        } else {
          return taskStatus[field]
        }
      } else {
        return row[field]
      }
    },
    buildInfo (record) {
      if (record) {
        if ('errors' in record) {
          return `[${record.errors[0].message}]`
        }
      }
      return ''
    }
  },
  computed: {
    taskLoading () {
      return this.$store.state.TaskListView.taskLoading
    },
    taskStatus () {
      return this.$store.state.TaskListView.taskStatus
    }
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

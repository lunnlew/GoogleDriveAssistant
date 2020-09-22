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
              {{ row|buildProgress(taskStatus[row.task_id])}}
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
        <div>
          <div style="padding-bottom: 10px">
            <Form :model="formItem" :label-width="80">
              <FormItem label="链接">
                <Input v-model="formItem.link" placeholder="需要抓取的链接" />
              </FormItem>
              <FormItem label="存盘">
                <Select v-model="formItem.drive_id">
                  <Option value="root">MyDrive (个人盘)</Option>
                  <Option
                    v-for="drive in driveList"
                    :key="drive.drive_id"
                    :value="drive.drive_id"
                  >{{drive.drive_name}} (共享盘,ID:{{drive.drive_id}})</Option>
                </Select>
              </FormItem>
            </Form>
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
import { fetchTaskList, newTask, startTask, deleteTask, fetchDriveList } from '@/api/source'
export default {
  name: 'TaskListView',
  components: {},
  props: [],
  data: () => {
    return {
      formItem: {
        link: '',
        drive_id: 'root'
      },
      newTaskModel: false,
      showExtraInfo: false,
      driveList: [],
      showExtraData: {},
      currentPage: 1,
      pageSize: 10,
      total: 0,
      taskList: [],
      alertType: 'success',
      alertInfo: '',
      showAlert: false,
      columns: [{
        title: '任务ID',
        key: 'task_id',
        slot: 'task_id'
      }, {
        title: '来源磁盘',
        key: 'folder_id'
      }, {
        title: '目标磁盘',
        key: 'drive_id'
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
    async showNewTask () {
      this.newTaskModel = true
      let res = await fetchDriveList({
        page: this.currentPage,
        size: this.pageSize
      })
      if (res && res.code == 200) {
        this.driveList = res.data.list
      }
    },
    async submitStartTask () {
      let res = await newTask(this.formItem)
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
    buildProgress (row, taskStatus) {
      var buildSize = (size) => {
        if (null == size || size == '') {
          return "0 Bytes";
        }
        var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
        var index = 0;
        var srcsize = parseFloat(size);
        index = Math.floor(Math.log(srcsize) / Math.log(1024));
        var size = srcsize / Math.pow(1024, index);
        size = size.toFixed(2);//保留的小数位数
        return size + unitArr[index];
      }
      let dealed_items = 0
      let dealed_size = 0
      let total_items = 0
      let total_size = 0
      if (taskStatus && 'type' in taskStatus) {
        if (type === 'complete') {
          dealed_items = total_items = row['total_items']
          dealed_size = total_size = row['total_size']
        }
      } else {
        dealed_items = taskStatus && taskStatus['dealed_items'] ? row['dealed_items'] + taskStatus['dealed_items'] : row['dealed_items']
        dealed_size = taskStatus && taskStatus['dealed_size'] ? row['dealed_size'] + taskStatus['dealed_size'] : row['dealed_size']
        total_items = taskStatus && taskStatus['total_items'] ? row['total_items'] + taskStatus['total_items'] : row['total_items']
        total_size = taskStatus && taskStatus['total_size'] ? row['total_size'] + taskStatus['total_size'] : row['total_size']
      }
      return `(文件:${dealed_items || 0}/${total_items || 0}, 大小:${buildSize(dealed_size || 0)}/${buildSize(total_size || 0)})`
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

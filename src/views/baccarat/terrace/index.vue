<template>
  <div class="ma-content-block lg:flex justify-between p-4">
    <!-- CRUD 组件 -->
    <ma-crud :options="options" :columns="columns" ref="crudRef">
    </ma-crud>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import baccaratTerrace from '@/api/baccarat/baccaratTerrace'
import { Message } from '@arco-design/web-vue'
import tool from '@/utils/tool'
import * as common from '@/utils/common'

const crudRef = ref()




const options = reactive({
  id: 'baccarat_terrace',
  rowSelection: {
    showCheckedAll: true
  },
  pk: 'id',
  operationColumn: true,
  operationColumnWidth: 160,
  formOption: {
    viewType: 'drawer',
    width: 600
  },
  api: baccaratTerrace.getList,
  add: {
    show: true,
    api: baccaratTerrace.save,
    auth: ['baccarat:terrace:save']
  },
  edit: {
    show: true,
    api: baccaratTerrace.update,
    auth: ['baccarat:terrace:update']
  },
  delete: {
    show: true,
    api: baccaratTerrace.deletes,
    auth: ['baccarat:terrace:delete']
  },
  import: {
    show: true,
    url: 'baccarat/terrace/import',
    templateUrl: 'baccarat/terrace/downloadTemplate',
    auth: ['baccarat:terrace:import']
  },
  export: {
    show: true,
    url: 'baccarat/terrace/export',
    auth: ['baccarat:terrace:export']
  }
})

const columns = reactive([
  {
    title: "主键",
    dataIndex: "id",
    formType: "input",
    addDisplay: false,
    editDisplay: false,
    hide: true,
    commonRules: {
      required: true,
      message: "请输入主键"
    }
  },
  {
    title: "标识",
    dataIndex: "code",
    formType: "input",
    search: true,
    commonRules: {
      required: true,
      message: "请输入标识"
    }
  },
  {
    title: "标题",
    dataIndex: "title",
    formType: "input",
    search: true,
    commonRules: {
      required: true,
      message: "请输入标题"
    }
  },
  {
    title: "创建时间",
    dataIndex: "created_at",
    formType: "date",
    addDisplay: false,
    editDisplay: false,
    hide: true,
    showTime: true
  },
  {
    title: "更新时间",
    dataIndex: "updated_at",
    formType: "date",
    addDisplay: false,
    editDisplay: false,
    hide: true,
    showTime: true
  },
  {
    title: "删除时间",
    dataIndex: "deleted_at",
    formType: "date",
    addDisplay: false,
    editDisplay: false,
    hide: true,
    showTime: true
  },
  {
    title: "备注",
    dataIndex: "remark",
    formType: "input",
    addDisplay: false,
    editDisplay: false,
    hide: true
  }
])
</script>
<script> export default { name: 'baccarat:terrace' } </script>
<template>
  <div class="ma-content-block lg:flex justify-between p-4">
    <!-- CRUD 组件 -->
    <ma-crud :options="options" :columns="columns" ref="crudRef">
    </ma-crud>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import baccaratRule from '@/api/baccarat/baccaratRule'
import { Message } from '@arco-design/web-vue'
import tool from '@/utils/tool'
import * as common from '@/utils/common'

const crudRef = ref()




const options = reactive({
  id: 'baccarat_rule',
  rowSelection: {
    showCheckedAll: true
  },
  pk: 'id',
  operationColumn: true,
  operationColumnWidth: 160,
  formOption: {
    viewType: 'modal',
    width: 600
  },
  api: baccaratRule.getList,
  add: {
    show: true,
    api: baccaratRule.save,
    auth: ['baccarat:rule:save']
  },
  edit: {
    show: true,
    api: baccaratRule.update,
    auth: ['baccarat:rule:update']
  },
  delete: {
    show: true,
    api: baccaratRule.deletes,
    auth: ['baccarat:rule:delete']
  },
  import: {
    show: true,
    url: 'baccarat/rule/import',
    templateUrl: 'baccarat/rule/downloadTemplate',
    auth: ['baccarat:rule:import']
  },
  export: {
    show: true,
    url: 'baccarat/rule/export',
    auth: ['baccarat:rule:export']
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
    title: "名称",
    dataIndex: "title",
    formType: "input",
    search: true,
    commonRules: {
      required: true,
      message: "请输入名称"
    }
  },
  {
    title: "规则",
    dataIndex: "rule",
    formType: "input",
    search: true,
    commonRules: {
      required: true,
      message: "请输入规则"
    }
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
<script> export default { name: 'baccarat:rule' } </script>
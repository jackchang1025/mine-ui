<template>
  <div class="ma-content-block lg:flex justify-between p-4">
    <!-- CRUD 组件 -->
    <ma-crud :options="options" :columns="columns" ref="crudRef">

      <!-- 状态列 -->
      <template #status="{ record }">
        <a-switch
            :checked-value="1"
            unchecked-value="2"
            @change="changeStatus($event, record)"
            :default-checked="record.status == 1"
        />
      </template>

    </ma-crud>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import baccaratSimulatedBettingRule from '@/api/baccarat/baccaratSimulatedBettingRule'
import { Message } from '@arco-design/web-vue'
import tool from '@/utils/tool'
import * as common from '@/utils/common'
import role from "@/api/system/role.js";

const crudRef = ref()

const changeStatus = async (status, record) => {
  if (record.code === 'superAdmin') {
    Message.info('超级管理员角色不能禁用')
    return
  }
  const response = await role.changeStatus({ id: record.id, status })
  if (response.success) {
    Message.success(response.message)
  }
}

const switchStatus = (statusValue, id, statusName) => {
  baccaratSimulatedBettingRule.changeStatus({ id, statusName, statusValue }).then( res => {
    res.success && Message.success(res.message)
  }).catch( e => { console.log(e) } )
}


const options = reactive({
  id: 'baccarat_simulated_betting_rule',
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
  api: baccaratSimulatedBettingRule.getList,
  add: {
    show: true,
    api: baccaratSimulatedBettingRule.save,
    auth: ['baccarat:simulatedBettingRule:save']
  },
  edit: {
    show: true,
    api: baccaratSimulatedBettingRule.update,
    auth: ['baccarat:simulatedBettingRule:update']
  },
  delete: {
    show: true,
    api: baccaratSimulatedBettingRule.deletes,
    auth: ['baccarat:simulatedBettingRule:delete']
  },
  import: {
    show: true,
    url: 'baccarat/simulatedBettingRule/import',
    templateUrl: 'baccarat/simulatedBettingRule/downloadTemplate',
    auth: ['baccarat:simulatedBettingRule:import']
  },
  export: {
    show: true,
    url: 'baccarat/simulatedBettingRule/export',
    auth: ['baccarat:simulatedBettingRule:export']
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
    title: "投注值",
    dataIndex: "betting_value",
    formType: "input",
    search: true,
    commonRules: {
      required: true,
      message: "请输入投注值"
    }
  },
  {
    title: '状态', dataIndex: 'status', width: 100, search: true, formType: 'radio',
    dict: { name: 'data_status', props: { label: 'title', value: 'key' } },
    addDefaultValue: '1', labelWidth: '86px'
  },
  {
    title: "排序",
    dataIndex: "sort",
    formType: "input",
    search: true,
    sortable: {
      sortDirections: [
        "ascend",
        "descend"
      ],
      sorter: true
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
<script> export default { name: 'baccarat:simulatedBettingRule' } </script>
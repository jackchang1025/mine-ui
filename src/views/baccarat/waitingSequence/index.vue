<template>

  <a-layout style="height: 400px;">
    <a-layout-header>Header</a-layout-header>
    <a-layout-content>

      <div class="ma-content-block lg:flex justify-between p-4">
        <!-- CRUD 组件 -->
        <ma-crud :options="options" :columns="columns" ref="crudRef" @selection-change="handleSelectionChange">

          <template #operationBeforeExtend="{ record }">
            <a-button @click="columnsOnClick(record)">创建图表</a-button>
          </template>

        </ma-crud>

        <ma-form-modal
            ref="formModalRef"
            :column="formColumn"
            :submit="handleFormSubmit"
            :default_visible="false"
        >
          <template #body>
            请填写以下信息：
          </template>
        </ma-form-modal>

      </div>

    </a-layout-content>

    <a-layout-content>

      <div style="height: 100%;width: 100%">

        <ma-chart-waiting-sequence-pie :sequence="sequence" v-if="sequence.length" :autoresize="true" :width="'100%'" :height="'100px'"/>

        <ma-chart-waiting-strategy :betLogList="betLogList" v-if="betLogList" :autoresize="true" :width="'100%'" :height="'25000px'" />

      </div>

    </a-layout-content>

    <a-layout-footer>

    </a-layout-footer>
  </a-layout>

</template>
<script setup>
import { ref, reactive } from 'vue'
import baccaratWaitingSequence from '@/api/baccarat/baccaratWaitingSequence'
import { Message } from '@arco-design/web-vue'
import tool from '@/utils/tool'
import * as common from '@/utils/common'
import MaFormModal from "@/components/ma-form-modal/index.vue"

// form 组件的 ref
const formModalRef = ref();
// 表单数据
const form = ref({})
const clickRowValue = ref({})

const selectionRowValue = ref([]);

// 组件的字段设置
const formColumn  = reactive([
  {
    title: '总金额',
    dataIndex: 'betTotalAmount',
    formType: 'input',  // 默认为 input 组件
  },
  {
    title: '默认金额',
    dataIndex: 'betDefaultAmount',
    formType: 'input',  // 使用单选框组件
  }
])

const crudRef = ref()
const betLogList = ref({});
const sequence = ref('');


const handleSelectionChange = (selection) => {

  selectionRowValue.value = selection;
  console.log('当前选中的行:', selection);
  // 在这里可以执行其他操作,如批量删除等
};

const columnsOnClick = (record) => {

  console.log('自定义操作列事件:', record,record.id);

  clickRowValue.value = record;

  //打开表单弹窗
  formModalRef.value.open({
    // 可以根据需要预填表单数据
    betTotalAmount: 1000,
    betDefaultAmount: 100,
  });
};

/**
 * 表单提交
 * @param formData
 */
const handleFormSubmit = async (formData) => {
  console.log('当前选择的行数据:', selectionRowValue.value)
  console.log('表单数据:', formData)

  try {

    betLogList.value = {};
    sequence.value = '';
    baccaratWaitingSequence.chart(clickRowValue.value.id,{
      betTotalAmount: formData.betTotalAmount,
      betDefaultAmount: formData.betDefaultAmount,
    }).then(response =>{

      console.log(response)

      betLogList.value = response.data.betLogList;
      sequence.value = response.data.sequence;

      Message.success('操作成功')
      formModalRef.value.close()

    })


  } catch (error) {
    console.error(error)
    Message.error('操作失败')
    formModalRef.value.close()
  }
}

const numberOperation = (newValue, id, numberName) => {
  baccaratWaitingSequence.numberOperation({ id, numberName, numberValue: newValue }).then( res => {
    res.success && Message.success(res.message)
  }).catch( e => { console.log(e) } )
}

const switchStatus = (statusValue, id, statusName) => {
  baccaratWaitingSequence.changeStatus({ id, statusName, statusValue }).then( res => {
    res.success && Message.success(res.message)
  }).catch( e => { console.log(e) } )
}


const options = reactive({
  id: 'baccarat_waiting_sequence',
  rowSelection: {
    showCheckedAll: true
  },
  pk: 'id',
  operationColumn: true,
  isDbClickEdit:false,
  operationColumnWidth: 160,
  formOption: {
    viewType: 'modal',
    width: 600
  },
  api: baccaratWaitingSequence.getList,
  recycleApi: baccaratWaitingSequence.getRecycleList,
  add: {
    show: true,
    api: baccaratWaitingSequence.save,
    auth: ['baccarat:waitingSequence:save']
  },
  edit: {
    show: true,
    api: baccaratWaitingSequence.update,
    auth: ['baccarat:waitingSequence:update']
  },
  delete: {
    show: true,
    api: baccaratWaitingSequence.deletes,
    auth: ['baccarat:waitingSequence:delete'],
    realApi: baccaratWaitingSequence.realDeletes,
    realAuth: ['baccarat:waitingSequence:realDeletes']
  },
  recovery: {
    show: true,
    api: baccaratWaitingSequence.recoverys,
    auth: ['baccarat:waitingSequence:recovery']
  },
  import: {
    show: true,
    url: 'baccarat/waitingSequence/import',
    templateUrl: 'baccarat/waitingSequence/downloadTemplate',
    auth: ['baccarat:waitingSequence:import']
  },
  export: {
    show: true,
    url: 'baccarat/waitingSequence/export',
    auth: ['baccarat:waitingSequence:export']
  }
})

const columns = reactive([
  {
    title: "主键",
    dataIndex: "id",
    formType: "input",
    addDisplay: false,
    editDisplay: false,
    commonRules: {
      required: true,
      message: "请输入主键"
    }
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
    title: "序列",
    dataIndex: "sequence",
    formType: "textarea",
    search: true,
    commonRules: {
      required: true,
      message: "请输入序列"
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
<script> export default { name: 'baccarat:waitingSequence' } </script>
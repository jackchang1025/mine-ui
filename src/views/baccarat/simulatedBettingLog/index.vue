<template>

  <a-layout style="height: 100%;">
    <a-layout-header>

    </a-layout-header>

    <a-layout>
      <a-layout-sider style="width: 15%;">

        <a-space direction="vertical" :size="16" style="display: block;">

          <a-select
              @change="bettingHandleSelect"
              v-model="bettingHandleSelectValue"
              :style="{width:'150'}"
              placeholder="Please select ..."
              allow-clear
          >
            <a-option v-for="(item, index) in bettingHandleSelectList" :key="index" :value="item.id" :label="item.title" />
          </a-select>

<!--          表单-->
          <a-row class="grid-demo">
            <a-col :span="24">
              <ma-form v-model="form" :columns="columnsOptions" ref="crudForm" @submit="handleFormSubmit"/>
            </a-col>
          </a-row>
        </a-space>

      </a-layout-sider>
      <a-layout-sider style="width: 15%;">

        <div >

          <a-space direction="vertical" fill>
            <a-date-picker
                style="width: 220px; margin: 0 24px 24px 0;"
                @change="dateOnChange"
            />

            <a-tree
                :data="baccaratTerraceDate"
                block-node
                :virtualListProps="{ height: 700,}"
                @select="switchTerraceDeck"
            />
          </a-space>

        </div>

      </a-layout-sider>
      <a-layout-content>
        <div class="ma-content-block lg:flex justify-between p-4">

          <!-- CRUD 组件 -->
          <ma-crud :options="options" :columns="columns" ref="crudRef">
          </ma-crud>
        </div>

      </a-layout-content>
    </a-layout>

    <a-layout-footer>

      <div style="height: 200px">
        <ma-scatter v-if="baccaratTerraceDeckData" :baccaratTerraceDeck="baccaratTerraceDeckData"></ma-scatter>
      </div>

      <div style="margin-top:50px;height: 400px;">
        <a-textarea placeholder="Please enter something" v-model="baccaratBettingSequence" allow-clear/>
      </div>

      <div style="height: 100%;width: 100%">

        <ma-chart-waiting-sequence-pie :sequence="sequence" v-if="sequence.length" :autoresize="true" :width="'100%'" :height="'100px'"/>

        <ma-chart-waiting-strategy :betLogList="betLogList" v-if="betLogList" :autoresize="true" :width="'100%'" :height="'2500px'" />

      </div>
    </a-layout-footer>
  </a-layout>


</template>
<script setup>
import {ref, reactive, onMounted, computed, watch} from 'vue'
import baccaratBettingLog from '@/api/baccarat/simulatedBettingLog.js'
import baccaratTerrace from '@/api/baccarat/baccaratTerrace.js'
import baccaratTerraceDeck from '@/api/baccarat/baccaratTerraceDeck.js'
import baccaratBettingRuleLog from '@/api/baccarat/baccaratBettingRuleLog.js'
import baccaratSimulatedBetting from '@/api/baccarat/baccaratSimulatedBetting.js'
import CalculateCoordinates from "@/utils/CalculateCoordinates"
import { Message } from '@arco-design/web-vue'
import tool from '@/utils/tool'
import * as common from '@/utils/common'
import MaTreeSlider from '@cps/ma-treeSlider/index.vue'
import commonApi from "@/api/common.js";
import MaFormModal from "@cps/ma-form-modal/index.vue";


const crudRef = ref()
const baccaratTerraceDate = ref([]);//牌靴列表
const terraceDeckDefaultKey = ref([])
const bettingHandleSelectList = ref([])//投注单列表
const bettingHandleSelectValue = ref(null)//当前选择的投注单号
const terrace_deck_created_at = ref(null)//当前选择的时间
const baccaratTerraceDeckSelectValue = ref({})

const betLogList = ref({});//投注记录charts
const sequence = ref('');//牌靴序列

// form 组件的 ref
const crudForm = ref()
// 表单数据
const form = ref({ betTotalAmount: 2000, betDefaultAmount: 20 })
// 组件的字段设置
const columnsOptions = reactive([
  {
    title: '总金额',
    dataIndex: 'betTotalAmount',
    formType: 'input',  // 默认为 input 组件
    rules:[{required:true,message:'name is required'},{type:'number'}],
  },
  {
    title: '默认金额',
    dataIndex: 'betDefaultAmount',
    formType: 'input',  // 使用单选框组件
    rules:[{required:true,message:'name is required'},{type:'number', min:20,message:'age is min than 20'}],
  }
])


/**
 * 牌靴数据
 */
const baccaratTerraceDeckData = ref(null)

const baccaratBettingSequence = ref(null)

const handleFormSubmit = async (formData,done) =>{
// 显示表单提交中状态
  done(true)

  console.log("form",form.value)

  await getBetLogListChart();

  // 关闭表单提交中状态
  done(false)
  Message.success('操作成功')

}

/**
 * 获取投注记录charts
 * @returns {Promise<void>}
 */
const getBetLogListChart = async ()=>{

  console.log("getBetLogListChart")

  if (bettingHandleSelectValue.value === null){
    Message.error({
      content: '投注单不能为空',
    })
    return
  }

  if (terrace_deck_created_at.value === null){
     Message.error({
      content: '时间不能为空',
    })
    return
  }
  if (form.value.betTotalAmount <= form.value.betDefaultAmount){
    Message.error({
      content: '投注总金额不能小于默认金额',
    })
    return ;
  }

  if (form.value.betDefaultAmount < 20){
    Message.error({
      content: '默认金额不能小于 20 ',
    })
    return ;
  }

  const response = await baccaratBettingLog.chart({
    betting_id: bettingHandleSelectValue.value,
    date:terrace_deck_created_at.value,
    betTotalAmount: form.value.betTotalAmount,
    betDefaultAmount: form.value.betDefaultAmount,
  })

  console.log("getBetLogListChart response",response)

  if (response.data?.betLogList){

    betLogList.value = response.data.betLogList;
  }

  if (response.data?.sequence.length){

    sequence.value = response.data.sequence;
  }

  baccaratBettingSequence.value = response.data?.sequence
}

/**
 * 投注规则选择
 * @param value
 */
const bettingHandleSelect = (value)=>{

  getListWithTerraceDeck({terrace_deck_created_at:terrace_deck_created_at.value,betting_id:bettingHandleSelectValue.value})
}

/**
 * 投注规则列表
 */
const baccaratSimulatedBettingList = ()=>{
  baccaratSimulatedBetting.getList().then(response =>{
    for (const item in response?.data?.items) {bettingHandleSelectList.value.push(response.data.items[item])}
  });
}

/**
 * 时间选中
 * @param value
 * @param date
 * @param dateString
 */
const dateOnChange = (value,date, dateString)=> {

  terrace_deck_created_at.value = value
  //设置牌靴的时间

  getListWithTerraceDeck({terrace_deck_created_at:value,betting_id:bettingHandleSelectValue.value})

  //获取图表数据
  getBetLogListChart();
}

//监听 terrace_deck_created_at 和 bettingHandleSelectValue 改变时，重新获取牌靴列表
// watch(
//     () => terrace_deck_created_at.value,
//     () => {
//
//
//
//
//
//       console.log(' watch terrace_deck_created_at.value', terrace_deck_created_at.value)
//     },
//     { immediate: true, deep: true }
// )

// watch(
//     () => bettingHandleSelectValue.value,
//     () => {
//
//       //获取图表数据
//       getBetLogListChart();
//
//       console.log(' watch bettingHandleSelectValue.value', bettingHandleSelectValue.value)
//     },
//     { immediate: true, deep: true }
// )

/**
 * 牌靴切换
 * @param id
 * @param data
 */
const switchTerraceDeck = (id,data) => {

  console.log("switchTerraceDeck:",id,data);

  if (data.node.parent_id === 0 ){

    return;
  }

  baccaratTerraceDeckSelectValue.value = data.node;

  getBaccaratTerraceDeckListWithBettingLog(id);

  // data.node?.baccarat_lottery_log?.filter(item => item.transformationResult).map(item => lottery_sequence.value += item.transformationResult )

  const terrace_deck_id = id[0] === 0 ? undefined : id[0];
  const betting_id = bettingHandleSelectValue.value;

  crudRef.value.requestParams = { terrace_deck_id: terrace_deck_id, betting_id:betting_id}
  crudRef.value.requestData()
  terraceDeckDefaultKey.value = id
}

/**
 * 获取牌靴的开奖记录和投注记录
 * @param id
 */
const getBaccaratTerraceDeckListWithBettingLog = (id)=>{

  baccaratTerraceDeckData.value = null;
  baccaratTerraceDeck.show(id).then(response =>{
    baccaratTerraceDeckData.value = response.data
    console.log('getBaccaratTerraceDeckListWithBettingLog',response.data)
  })
}


/**
 * 牌靴列表
 * @param params
 */
const getListWithTerraceDeck = (params = {})=>{

  baccaratTerraceDate.value = [];

  baccaratTerrace.getListWithTerraceDeck(params).then(res => {
    console.log("getListWithTerraceDeck:",res.data);

    for (const item in res.data) {baccaratTerraceDate.value.push(res.data[item])}
  })
  // commonApi.getDict('dashboard').then(res => homePageList.value = res.data )
}


onMounted(() => {

  baccaratSimulatedBettingList();

  terrace_deck_created_at.value = tool.dateFormat(new Date(), 'yyyy-MM-dd', '-')

  getListWithTerraceDeck({terrace_deck_created_at: terrace_deck_created_at.value});
})


const switchStatus = (statusValue, id, statusName) => {
  baccaratBettingLog.changeStatus({ id, statusName, statusValue }).then( res => {
    res.success && Message.success(res.message)
  }).catch( e => { console.log(e) } )
}


const options = reactive({
  id: 'baccarat_betting_log',
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
  api: baccaratBettingLog.getList,
  add: {
    show: true,
    api: baccaratBettingLog.save,
    auth: ['baccarat:bettingLog:save']
  },
  edit: {
    show: true,
    api: baccaratBettingLog.update,
    auth: ['baccarat:bettingLog:update']
  },
  delete: {
    show: true,
    api: baccaratBettingLog.deletes,
    auth: ['baccarat:bettingLog:delete']
  },
  import: {
    show: true,
    url: 'baccarat/bettingLog/import',
    templateUrl: 'baccarat/bettingLog/downloadTemplate',
    auth: ['baccarat:bettingLog:import']
  },
  export: {
    show: true,
    url: 'baccarat/bettingLog/export',
    auth: ['baccarat:bettingLog:export']
  },
  resetSearch:function (searchData){

    if (crudRef.value.requestParams?.terrace_deck_id){
      crudRef.value.requestParams.terrace_deck_id = undefined;
    }

  }
})

const columns = reactive([
  {
    title: "主键",
    dataIndex: "id",
    formType: "input",
    addDisplay: false,
    editDisplay: false,
    hide: false,
    commonRules: {
      required: true,
      message: "请输入主键"
    }
  },
  {
    title: "投注id",
    dataIndex: "betting_id",
    formType: "input",
    addDisplay: false,
    editDisplay: false,
    hide: false,
    multiple: false,
    dict: {
      name: "api_data_type",
      props: {
        label: "title",
        value: "key"
      },
      translation: true
    }
  },
  {
    title: "期号",
    dataIndex: "issue",
    formType: "input",
    addDisplay: false,
    editDisplay: false,
    hide: false
  },
  {
    title: "投注值",
    dataIndex: "betting_value",
    formType: "input",
    search: true
  },
  {
    title: "投注结果",
    dataIndex: "betting_result",
    formType: "input",
    search: true
  },
  {
    title: "状态 (1正常 2停用)",
    dataIndex: "status",
    formType: "switch",
    search: true
  },
  {
    title: "备注",
    dataIndex: "remark",
    formType: "input",
    addDisplay: false,
    editDisplay: false,
    hide: true
  },
  {
    title: "创建时间",
    dataIndex: "created_at",
    formType: "range",
    addDisplay: false,
    editDisplay: false,
    hide: false,
    showTime: true,
    search: true,

  },
  {
    title: "更新时间",
    dataIndex: "updated_at",
    formType: "date",
    addDisplay: false,
    editDisplay: false,
    hide: true,
    showTime: true,
    search: true
  },
  {
    title: "牌靴id",
    dataIndex: "terrace_deck_id",
    formType: "cascader",
    addDisplay: false,
    editDisplay: false,
    hide: false,
    commonRules: {
      required: true,
      message: "请输入牌靴id"
    }
  }
])
</script>
<script> export default { name: 'baccarat:bettingLog' } </script>
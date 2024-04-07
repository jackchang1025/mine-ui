<template>

  <a-layout style="height: 100%;">
    <a-layout-header>



    </a-layout-header>

    <a-layout>
      <a-layout-sider style="width: 15%;">

        <a-select
            @change="bettingHandleSelect"
            v-model="bettingHandleSelectValue"
            :style="{width:'150'}"
            placeholder="Please select ..."
            allow-clear
        >
          <a-option v-for="(item, index) in bettingHandleSelectList" :key="index" :value="item.id" :label="item.title" />
        </a-select>

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



          <!--<div class="lg:w-2/12 w-full h-full p-2 shadow">-->
          <!--  <ma-tree-slider-->
          <!--      :data="baccaratBettingRuleLogDate"-->
          <!--      searchPlaceholder="投注规则"-->
          <!--      v-model="bettingRuleLogDefaultKey"-->
          <!--      @click="switchBettingRuleLog"-->
          <!--  />-->
          <!--</div>-->


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

      <div style="margin:50px;height: 400px;">
        <a-textarea placeholder="Please enter something" v-model="baccaratBettingSequence" allow-clear/>
      </div>
    </a-layout-footer>
  </a-layout>


</template>
<script setup>
import { ref, reactive,onMounted,computed} from 'vue'
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


const crudRef = ref()
const baccaratTerraceDate = ref([]);
const terraceDeckDefaultKey = ref([])
const bettingHandleSelectList = ref([])
const bettingHandleSelectValue = ref(null)
const terrace_deck_created_at = ref('')
const baccaratTerraceDeckSelectValue = ref({})

/**
 * 牌靴数据
 */
const baccaratTerraceDeckData = ref(null)

const baccaratBettingSequence = computed(() => {

  if (baccaratTerraceDate.value?.length) {
    return baccaratTerraceDate.value
        .filter(item => item?.children?.length)
        .flatMap(item => item.children.map(child => child.baccaratBettingSequence))
        .join('');
  }

  return '';

});

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
}

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
    console.log(response.data)
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
    hide: true,
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
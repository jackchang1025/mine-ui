<template>
  <div class="ma-content-block lg:flex justify-between p-4">
    <!-- CRUD 组件 -->
    <ma-crud :options="options" :columns="columns" ref="crudRef">

      <!-- 自定义字段名为 lottery_sequence 的插槽 -->
      <template #search-lottery_sequence="{ searchForm, component }">
        <!-- 显示一个输入框组件，并绑定输入框的v-model -->

<!--        <a-select v-model="searchForm[component.dataIndex]" placeholder="lottery_sequence" allow-clear>-->
<!--          <a-option v-for="rule in baccaratRuleList" :key="rule.id" :value="rule.rule" >{{ rule.title }}</a-option>-->
<!--        </a-select>-->

      </template>


      <!-- 自定义字段名为 title 的插槽 -->
      <!--<template #terrace_id="{ record }">-->
      <!--  &lt;!&ndash; 对标题加上 tag &ndash;&gt;-->
      <!--  <a-tag color="blue">{{ record.terrace_id }}</a-tag>-->
      <!--</template>-->

<!--      <template #lottery_sequence="{ record }">-->
<!--        &lt;!&ndash; 对标题加上 tag &ndash;&gt;-->
<!--          <div class="ma-content-block lg:flex justify-between p-4" style="width: 100%; height: 300px;">-->
<!--&lt;!&ndash;            <ma-scatter :baccaratTerraceDeck="record" :width="'100%'" ></ma-scatter>&ndash;&gt;-->
<!--          </div>-->
<!--      </template>-->


      <!--<template #expandRow="record">-->
      <!--  <div>record:{{record}}</div>-->
      <!--  <div v-for="data in tableData">-->
      <!--    <div>{{data.id}}</div>-->
      <!--    <div class="ma-content-block lg:flex justify-between p-4" style="width: 100%; height: 200px;">-->
      <!--      <ma-scatter :data="data.transformationResult"></ma-scatter>-->
      <!--    </div>-->
      <!--  </div>-->
      <!--</template>-->
    </ma-crud>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import baccaratTerraceDeck from '@/api/baccarat/baccaratTerraceDeck'
import baccaratRule from '@/api/baccarat/baccaratRule'

import { Message } from '@arco-design/web-vue'
import tool from '@/utils/tool'
import * as common from '@/utils/common'

const crudRef = ref()

const options = reactive({
  id: 'baccarat_terrace_deck',
  rowSelection: {
    showCheckedAll: true
  },
  pk: 'id',
  operationColumn: true,
  operationColumnWidth: 160,
  stripe:false,
  formOption: {
    viewType: 'modal',
    width: 600
  },
  api: baccaratTerraceDeck.getList,
  add: {
    show: true,
    api: baccaratTerraceDeck.save,
    auth: ['baccarat:terraceDeck:save']
  },
  edit: {
    show: true,
    api: baccaratTerraceDeck.update,
    auth: ['baccarat:terraceDeck:update']
  },
  delete: {
    show: true,
    api: baccaratTerraceDeck.deletes,
    auth: ['baccarat:terraceDeck:delete']
  },
  import: {
    show: true,
    url: 'baccarat/terraceDeck/import',
    templateUrl: 'baccarat/terraceDeck/downloadTemplate',
    auth: ['baccarat:terraceDeck:import']
  },
  export: {
    show: true,
    url: 'baccarat/terraceDeck/export',
    auth: ['baccarat:terraceDeck:export']
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
    title: "台",
    dataIndex: "terrace_id",
    formType: "input",
    search: true,
    commonRules: {
      required: true,
      message: "请输入台"
    },

  },
  {
    title: "牌靴编号",
    dataIndex: "deck_number",
    formType: "input",
    hide: true,
    search: true
  },
  {
    title: "开奖序列",
    dataIndex: "lottery_sequence",
    formType: "card",
    search: true,
    width: 800,

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
    width:200
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
    title: "备注",
    dataIndex: "remark",
    formType: "textarea",
    addDisplay: false,
    editDisplay: false,
    hide: true
  }
])
const baccaratRuleList = ref([]);

// baccaratRule.list().then(res => {
//   console.log(res.data)
//
//   baccaratRuleList.value = res?.data;
// })


</script>
<script> export default { name: 'baccarat:terraceDeck' } </script>
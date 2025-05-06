<template>
  <div class="ma-content-block lg:flex justify-between p-4">
    <!-- CRUD 组件 -->
    <ma-crud :options="options" :columns="columns" ref="crudRef" @row-click="handleRowClick">
      <!-- 状态列 -->
      <template #status="{ record }">
        <a-switch
          :checked-value="1"
          unchecked-value="2"
          @change="changeStatus($event, record)"
          :default-checked="record.status === 1"
        />
      </template>
    </ma-crud>

    <!-- 策略金额变化图表弹窗 -->
    <a-modal
      v-model:visible="chartVisible"
      :title="`策略金额变化 - ${currentTitle}`"
      :width="1200"
      @cancel="handleChartClose"
      @open="handleChartOpen"
      :mask-closable="false"
    >
      <div class="chart-container">
        <!-- 添加导航按钮 -->
        <div class="chart-toolbar">
          <a-space>
            <a-button 
              type="text" 
              size="small" 
              :disabled="!hasPrevious"
              @click="loadPrevious"
            >
              <template #icon><icon-left /></template>
              上一个
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              :disabled="!hasNext"
              @click="loadNext"
            >
              下一个
              <template #icon><icon-right /></template>
            </a-button>
            <a-divider type="vertical" />
            <a-button size="small" @click="toggleDataView">
              <template #icon><icon-code /></template>
              数据视图
            </a-button>
            <a-button size="small" @click="saveAsImage">
              <template #icon><icon-download /></template>
              保存图片
            </a-button>
            <a-button size="small" @click="resetZoom">
              <template #icon><icon-refresh /></template>
              重置缩放
            </a-button>
            <a-button type="primary" size="small" @click="showRegenerateForm">
              <template #icon><icon-sync /></template>
              重新生成
            </a-button>
          </a-space>
        </div>

        <!-- 策略统计信息 -->
        <div class="chart-summary">
          <a-descriptions :column="3" size="small" bordered>
            <a-descriptions-item v-for="(stats, strategy) in strategyStats" :key="strategy" :label="strategy">
              <div>初始金额: {{ stats.initialAmount.toFixed(2) }}</div>
              <div>默认投注: {{ stats.defaultBet.toFixed(2) }}</div>
              <div>余额: {{ stats.balance.toFixed(2) }}</div>
              <div>投注: {{ stats.bet.toFixed(2) }}</div>
              <div>盈亏: <span :class="stats.profit >= 0 ? 'profit' : 'loss'">{{ stats.profit.toFixed(2) }}</span></div>
              <div>最大连赢: <span class="profit">{{ stats.maxWinStreak }}</span></div>
              <div>最大连输: <span class="loss">{{ stats.maxLoseStreak }}</span></div>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 分策略图表展示 -->
        <div v-for="(strategy, index) in strategies" :key="strategy.name" class="strategy-chart">
          <h3 class="strategy-title">{{ strategy.name }}</h3>
          <ma-charts 
            :ref="el => setChartRef(el, index)"
            :option="chartOptions[index]"
            :loading="chartLoading"
            height="300px"
            @mounted="() => handleChartMounted(index)"
          />
        </div>
      </div>
    </a-modal>

    <!-- 重新生成表单弹窗 -->
    <a-modal
      v-model:visible="regenerateVisible"
      title="重新生成策略统计"
      @ok="handleRegenerate"
      @cancel="handleRegenerateClose"
    >
      <a-form :model="regenerateForm" layout="vertical">
        <a-form-item label="初始金额" required>
          <a-input-number
            v-model="regenerateForm.initialAmount"
            :min="1"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="默认投注金额" required>
          <a-input-number
            v-model="regenerateForm.defaultBet"
            :min="1"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import baccaratSimulatedBetting from '@/api/baccarat/baccaratSimulatedBetting'
import { Message } from '@arco-design/web-vue'
import tool from '@/utils/tool'
import { IconCode, IconDownload, IconRefresh, IconSync, IconLeft, IconRight } from '@arco-design/web-vue/es/icon'

const crudRef = ref()
const chartVisible = ref(false)
const chartLoading = ref(false)
const chartRefs = ref([])
const currentTitle = ref('')

// 重新生成表单相关
const regenerateVisible = ref(false)
const currentBettingId = ref(null)
const regenerateForm = reactive({
  initialAmount: 0,
  defaultBet: 0
})

// 当前数据列表
const dataList = ref([])
// 当前选中项的索引
const currentIndex = ref(-1)

// 计算是否有上一个/下一个
const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < dataList.value.length - 1)

// 加载数据列表
const loadDataList = async () => {
  try {
    const res = await baccaratSimulatedBetting.getList({
      pageSize: 9999, // 加载所有数据
      status: 1 // 只加载启用的投注单
    })
    if (res.success) {
      dataList.value = res.data.items.sort((a, b) => b.id - a.id) // 按 ID 倒序排列，最新的在前面
    }
  } catch (e) {
    console.error(e)
  }
}

// 加载上一个
const loadPrevious = async () => {
  if (!hasPrevious.value) return
  currentIndex.value--
  const row = dataList.value[currentIndex.value]
  currentTitle.value = row.title
  currentBettingId.value = row.id
  await loadChartData(row.id, row.initial_amount, row.default_bet)
}

// 加载下一个
const loadNext = async () => {
  if (!hasNext.value) return
  currentIndex.value++
  const row = dataList.value[currentIndex.value]
  currentTitle.value = row.title
  currentBettingId.value = row.id
  await loadChartData(row.id, row.initial_amount, row.default_bet)
}

// 显示重新生成表单
const showRegenerateForm = () => {
  if (!currentBettingId.value) {
    Message.warning('请先选择投注单')
    return
  }
  
  // 使用当前投注单的初始金额和默认投注金额作为默认值
  regenerateForm.initialAmount = strategyStats.value['平注策略'].initialAmount
  regenerateForm.defaultBet = strategyStats.value['平注策略'].defaultBet
  regenerateVisible.value = true
}

// 处理重新生成
const handleRegenerate = async () => {
  if (!currentBettingId.value) return
  
  try {
    // 直接使用 loadChartData 加载重新生成的数据
    await loadChartData(
      currentBettingId.value, 
      regenerateForm.initialAmount, 
      regenerateForm.defaultBet,
      true // 标记数据来源为重新生成
    )
    
    Message.success('重新生成成功')
    regenerateVisible.value = false
  } catch (e) {
    Message.error('重新生成失败')
    console.error(e)
  }
}

// 处理重新生成表单关闭
const handleRegenerateClose = () => {
  regenerateVisible.value = false
  regenerateForm.initialAmount = 0
  regenerateForm.defaultBet = 0
}

// 抽取加载图表数据的逻辑
const loadChartData = async (id, initialAmount, defaultBet, fromRegenerate = false) => {
  chartLoading.value = true
  try {
    // 如果不是来自重新生成的请求，则使用普通的获取策略日志接口
    const res = !fromRegenerate 
      ? await baccaratSimulatedBetting.getStrategyLogs(id)
      : await baccaratSimulatedBetting.regenerateStats({
          id,
          initialAmount,
          defaultBet
        })
    
    const data = res.data
    
    strategies.forEach((strategy, index) => {
      if (data[strategy.key]) {
        // 更新图表选项
        chartOptions.value[index] = {
          ...getChartOption(strategy),
          xAxis: {
            ...getChartOption(strategy).xAxis,
            data: data.issues
          },
          series: [
            {
              ...getChartOption(strategy).series[0],
              data: data[strategy.key].balances
            },
            {
              ...getChartOption(strategy).series[1],
              data: data[strategy.key].betAmounts
            }
          ]
        }
        
        const lastBalance = data[strategy.key].balances[data[strategy.key].balances.length - 1] || 0
        const totalBet = data[strategy.key].betAmounts.reduce((sum, bet) => sum + bet, 0)
        
        strategyStats.value[strategy.name] = {
          initialAmount,
          defaultBet,
          balance: lastBalance,
          bet: totalBet,
          profit: lastBalance - initialAmount,
          maxWinStreak: data[strategy.key].maxWinStreak,
          maxLoseStreak: data[strategy.key].maxLoseStreak
        }
      }
    })
  } catch (e) {
    Message.error('加载策略数据失败')
    console.error(e)
  } finally {
    chartLoading.value = false
  }
}

// 1. 先定义图表配置函数
const getChartOption = (strategy) => {
  return {
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        magicType: {
          type: ['line', 'bar']
        },
        restore: {},
        saveAsImage: {}
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params) {
        let result = `<div style="font-weight:bold">第 ${params[0].axisValue} 期</div>`
        result += '<div style="margin-top:5px">'
        
        const balance = params.find(p => p.seriesName.includes('余额'))?.value || 0
        const bet = params.find(p => p.seriesName.includes('投注额'))?.value || 0
        const profit = balance - strategyStats.value[strategy.name].initialAmount
        
        result += `<div>余额: ${balance.toFixed(2)}</div>`
        result += `<div>投注: ${bet.toFixed(2)}</div>`
        result += `<div>盈亏: <span style="color:${profit >= 0 ? '#52c41a' : '#ff4d4f'}">${profit.toFixed(2)}</span></div>`
        
        return result
      }
    },
    legend: {
      data: [`${strategy.name}-余额`, `${strategy.name}-投注额`]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100
      }
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLabel: {
        interval: 'auto',
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '金额',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: `${strategy.name}-余额`,
        type: 'line',
        data: [],
        itemStyle: { color: strategy.color },
        emphasis: { focus: 'series' },
        areaStyle: {
          opacity: 0.1
        }
      },
      {
        name: `${strategy.name}-投注额`,
        type: 'line',
        data: [],
        itemStyle: { color: strategy.betColor },
        emphasis: {
          focus: 'series'
        }
      }
    ]
  }
}

// 2. 然后定义策略数组
const strategies = [
  { key: 'flatNote', name: '平注策略', color: '#52c41a', betColor: '#95de64' },
  { key: 'layered', name: '分层策略', color: '#1890ff', betColor: '#69c0ff' },
  { key: 'martingale', name: '倍投策略', color: '#ff4d4f', betColor: '#ff7875' },
  { key: 'fixedRatio', name: '固定比例策略', color: '#722ed1', betColor: '#9254de' },
  { key: '1-3-2-6', name: '1-3-2-6策略', color: '#faad14', betColor: '#ffd666' }
]

// 3. 最后初始化图表选项
const chartOptions = ref(strategies.map(strategy => getChartOption(strategy)))

const strategyStats = ref({
  '平注策略': { 
    initialAmount: 0, 
    defaultBet: 0, 
    balance: 0, 
    bet: 0, 
    profit: 0,
    maxWinStreak: 0,
    maxLoseStreak: 0
  },
  '分层策略': { 
    initialAmount: 0, 
    defaultBet: 0, 
    balance: 0, 
    bet: 0, 
    profit: 0,
    maxWinStreak: 0,
    maxLoseStreak: 0
  },
  '倍投策略': { 
    initialAmount: 0, 
    defaultBet: 0, 
    balance: 0, 
    bet: 0, 
    profit: 0,
    maxWinStreak: 0,
    maxLoseStreak: 0
  },
  '固定比例策略': { 
    initialAmount: 0, 
    defaultBet: 0, 
    balance: 0, 
    bet: 0, 
    profit: 0,
    maxWinStreak: 0,
    maxLoseStreak: 0
  },
  '1-3-2-6策略': { 
    initialAmount: 0, 
    defaultBet: 0, 
    balance: 0, 
    bet: 0, 
    profit: 0,
    maxWinStreak: 0,
    maxLoseStreak: 0
  }
})

// 设置图表引用
const setChartRef = (el, index) => {
  if (el) {
    chartRefs.value[index] = el
  }
}

// 处理图表挂载
const handleChartMounted = (index) => {
  if (chartRefs.value[index]) {
    chartRefs.value[index].resize()
  }
}

// 处理模态框打开
const handleChartOpen = () => {
  setTimeout(() => {
    chartRefs.value.forEach(chart => {
      if (chart) {
        chart.resize()
      }
    })
  }, 100)
}

// 修改点击行显示图表
const handleRowClick = async (row) => {
  // 重置之前的数据
  regenerateForm.initialAmount = 0
  regenerateForm.defaultBet = 0
  currentBettingId.value = null
  
  // 设置新数据
  chartVisible.value = true
  currentTitle.value = row.title
  currentBettingId.value = row.id
  
  // 找到当前行在数据列表中的索引
  currentIndex.value = dataList.value.findIndex(item => item.id === row.id)
  
  await loadChartData(row.id, row.initial_amount, row.default_bet)
}

// 关闭图表时重置状态
const handleChartClose = () => {
  chartVisible.value = false
  currentBettingId.value = null
  currentTitle.value = ''
  currentIndex.value = -1
  regenerateForm.initialAmount = 0
  regenerateForm.defaultBet = 0
  
  // 清空图表数据
  strategies.forEach((strategy, index) => {
    chartOptions.value[index] = getChartOption(strategy)
  })
}

// 状态切换
const changeStatus = async (status, record) => {
  const response = await baccaratSimulatedBetting.changeStatus({ 
    id: record.id, 
    statusValue: status,
    statusName: 'status'
  })
  if (response.success) {
    Message.success(response.message)
  }
}

// CRUD配置
const options = reactive({
  id: 'baccarat_simulated_betting',
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
  api: baccaratSimulatedBetting.getList,
  add: {
    show: true,
    api: baccaratSimulatedBetting.save,
    auth: ['baccarat:simulatedBetting:save']
  },
  edit: {
    show: true,
    api: baccaratSimulatedBetting.update,
    auth: ['baccarat:simulatedBetting:update']
  },
  delete: {
    show: true,
    api: baccaratSimulatedBetting.deletes,
    auth: ['baccarat:simulatedBetting:delete']
  },
  import: {
    show: true,
    url: 'baccarat/simulatedBetting/import',
    templateUrl: 'baccarat/simulatedBetting/downloadTemplate',
    auth: ['baccarat:simulatedBetting:import']
  },
  export: {
    show: true,
    url: 'baccarat/simulatedBetting/export',
    auth: ['baccarat:simulatedBetting:export']
  }
})

// 列配置
const columns = reactive([
  {
    title: "主键",
    dataIndex: "id",
    formType: "input",
    addDisplay: false,
    editDisplay: false,
    hide: true
  },
  {
    title: "名称",
    dataIndex: "title",
    formType: "input",
    search: true
  },
  {
    title: "初始金额",
    dataIndex: "initial_amount",
    formType: "inputNumber",
    search: true,
    commonRules: [
      { required: true, message: "请输入初始金额" }
    ]
  },
  {
    title: "默认投注金额",
    dataIndex: "default_bet",
    formType: "inputNumber",
    commonRules: [
      { required: true, message: "请输入默认投注金额" }
    ]
  },
  {
    title: "止盈金额",
    dataIndex: "stop_win",
    formType: "inputNumber"
  },
  {
    title: "止损金额", 
    dataIndex: "stop_loss",
    formType: "inputNumber"
  },
  {
    title: "策略类型",
    dataIndex: "strategy_types",
    formType: "select",
    multiple: true,
    dict: {
      data: [
        { label: '平注策略', value: 'FlatNote' },
        { label: '分层策略', value: 'Layered' },
        { label: '倍投策略', value: 'Martingale' },
        { label: '固定比例策略', value: 'FixedRatio' },
        { label: '1-3-2-6策略', value: 'OneThreeTwoSixStrategy' }
      ]
    },
    commonRules: [
      { required: true, message: "请选择策略类型" }
    ]
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    formType: 'radio',
    dict: { name: 'data_status', props: { label: 'title', value: 'key' } },
    addDefaultValue: '1'
  },
  {
    title: "备注",
    dataIndex: "remark",
    formType: "textarea"
  }
])

// 图表工具方法
const toggleDataView = () => {
  chartRefs.value.forEach(chart => {
    const echarts = chart?.getChart()
    echarts?.setOption({
      toolbox: {
        feature: {
          dataView: { show: true, readOnly: false }
        }
      }
    })
  })
}

const saveAsImage = () => {
  // 使用第一个图表保存
  const echarts = chartRefs.value[0]?.getChart()
  if (echarts) {
    const url = echarts.getDataURL()
    const a = document.createElement('a')
    a.download = '策略金额变化图.png'
    a.href = url
    a.click()
  }
}

const resetZoom = () => {
  chartRefs.value.forEach(chart => {
    const echarts = chart?.getChart()
    echarts?.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100
    })
  })
}

// 添加键盘事件处理
const handleKeyDown = (e) => {
  if (!chartVisible.value) return
  
  if (e.key === 'ArrowLeft' && hasPrevious.value) {
    loadPrevious()
  } else if (e.key === 'ArrowRight' && hasNext.value) {
    loadNext()
  }
}

// 在组件挂载时加载数据列表
onMounted(async () => {
  await loadDataList()
  window.addEventListener('keydown', handleKeyDown)
})

// 在组件卸载时移除键盘事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.chart-container {
  padding: 20px;
}

.strategy-chart {
  margin-bottom: 30px;
}

.strategy-title {
  margin: 20px 0 10px;
  font-size: 16px;
  font-weight: bold;
}

.profit {
  color: #52c41a;
}

.loss {
  color: #ff4d4f;
}

.chart-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

:deep(.arco-modal-content) {
  padding: 0;
}
</style>
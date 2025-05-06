<template>
  <div class="baccarat-history">
    <div class="content-section">
      <!-- 左侧树形导航 -->
      <div class="tree-section">
        <div class="tree-container">
          <a-tree
            :data="treeData"
            :loadMore="loadMore"
            @select="handleSelect"
            :default-expanded-keys="defaultExpandedKeys"
          >
            <template #title="nodeData">
              <span>
                <!-- 房间节点 -->
                <template v-if="nodeData.type === 'room'">
                  {{ nodeData.title }}
                </template>
                <!-- 日期节点 -->
                <template v-else-if="nodeData.type === 'date'">
                  {{ nodeData.title }}
                </template>
                <!-- 牌靴节点 -->
                <template v-else-if="nodeData.type === 'deck'">
                  牌靴号: {{ nodeData.deck_number }}
                </template>
              </span>
            </template>
          </a-tree>
        </div>
      </div>

      <!-- 右侧开奖记录展示 -->
      <div class="result-section">
        <a-spin :loading="loading">
          <template v-if="selectedDeck">
            <a-card :title="`牌靴号: ${selectedDeck.deck_number}`">
              <!-- 修改图表容器的样式 -->
              <div ref="chartRef" class="chart-container"></div>
              
              <!-- 统计信息 -->
              <div class="statistics">
                <div class="stats-item">
                  <span>庄: {{selectedDeck.banker_count}}</span>
                  <span>闲: {{selectedDeck.player_count}}</span>
                  <span>和: {{selectedDeck.tie_count}}</span>
                </div>
                <div class="stats-item">
                  <span>庄率: {{(selectedDeck.banker_count / selectedDeck.total * 100).toFixed(2)}}%</span>
                  <span>闲率: {{(selectedDeck.player_count / selectedDeck.total * 100).toFixed(2)}}%</span>
                  <span>和率: {{(selectedDeck.tie_count / selectedDeck.total * 100).toFixed(2)}}%</span>
                </div>
                
                <!-- 总体投注统计 -->
                <div class="stats-item betting-stats">
                  <span>总投注: {{selectedDeck.statistics.total_bets}}</span>
                  <span>投注序列: {{selectedDeck.statistics.betting_string}}</span>
                  <span>胜: {{selectedDeck.statistics.total_wins}}</span>
                  <span>负: {{selectedDeck.statistics.total_losses}}</span>
                  <span>和: {{selectedDeck.statistics.total_ties}}</span>
                  <span>总胜率: {{selectedDeck.statistics.total_win_rate}}%</span>
                </div>
                
                <!-- 可信度分类统计 -->
                <div class="credibility-stats" 
                     v-if="selectedDeck?.statistics?.credibility_stats && 
                           Object.keys(selectedDeck.statistics.credibility_stats).length > 0">
                  <div class="stats-header">可信度分类统计：</div>
                  <template v-for="(stats, level) in selectedDeck.statistics.credibility_stats" 
                                :key="level">
                    <div class="stats-item credibility-item"
                         v-if="stats.total > 0">
                      <span class="credibility-level">{{level}}:</span>
                      <span>投注: {{stats.total}}</span>
                      <span class="win-count">胜: {{stats.wins}}</span>
                      <span class="lose-count">负: {{stats.losses}}</span>
                      <span class="tie-count">和: {{stats.ties}}</span>
                      <span class="win-rate">胜率: {{stats.win_rate}}%</span>
                    </div>
                  </template>
                </div>
              </div>
            </a-card>
          </template>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import baccaratTerrace from '@/api/baccarat/baccaratTerrace'
import { Message } from '@arco-design/web-vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

const loading = ref(false)
const treeData = ref([])
const selectedDeck = ref(null)
const gridData = ref([])
const defaultExpandedKeys = ref([])
const chartRef = ref(null)
let chart = null

// 组件级别的配置
const GRID_SIZE = 50  // 网格大小
const CHART_MIN_HEIGHT = 400  // 最小高度

// 初始化加载房间列表
const initTreeData = async () => {
  try {
    const res = await baccaratTerrace.getList()
    treeData.value = res.data.items.map(room => ({
      key: `room-${room.id}`,
      title: room.title,
      type: 'room',
      id: room.id,
      isLeaf: false,
      children: []
    }))
  } catch(e) {
    Message.error('获取房间列表失败')
  }
}

// 异步加载子节点
const loadMore = async (nodeData) => {
  if (!nodeData || !nodeData.type) {
    console.warn('Invalid node data:', nodeData)
    return []
  }
  
  // 如果已经有子节点数据，直接返回
  if (nodeData.children && nodeData.children.length > 0) {
    return nodeData.children
  }
  
  try {
    loading.value = true
    let children = []
    
    if (nodeData.type === 'room') {
      children = await loadDates(nodeData)
    } else if (nodeData.type === 'date') {
      children = await loadDecks(nodeData)
    }
    
    // 更新节点的 children
    nodeData.children = children
    return children
  } catch (e) {
    Message.error('加载数据失败')
    return []
  } finally {
    loading.value = false
  }
}

// 加载日期列表
const loadDates = async (node) => {
  try {
    const params = {
      terrace_id: node.id
    }
    const res = await baccaratTerrace.getDeckDates(params)
    const dates = res.data.map(date => ({
      key: `date-${node.id}-${date}`,
      title: date,
      type: 'date',
      terrace_id: node.id,
      date: date,
      isLeaf: false,
      children: []
    }))
    
    // 更新节点的 children
    node.children = dates
    return dates
  } catch(e) {
    Message.error('获取日期列表失败')
    return []
  }
}

// 加载牌靴列表
const loadDecks = async (node) => {
  try {
    const params = {
      terrace_id: node.terrace_id,
      date: node.date
    }
    const res = await baccaratTerrace.getDeckList(params)
    const decks = res.data.map(deck => ({
      key: `deck-${deck.id}`,
      title: `牌靴号: ${deck.deck_number}`,
      type: 'deck',
      isLeaf: true,
      ...deck
    }))
    
    // 更新节点的 children
    node.children = decks
    return decks
  } catch(e) {
    Message.error('获取牌靴列表失败')
    return []
  }
}

// 格式化数据为echarts格式
const formatChartData = (logs) => {
  if (!logs || !logs.length) return { banker: [], player: [], tie: [], betting: [] }
  
  const data = {
    banker: [],
    player: [],
    tie: [],
    betting: []
  }
  
  logs.forEach(log => {
    const point = [log.x, log.y]
    
    if (log.transformationResult === 'B') {
      data.banker.push(point)
    } else if (log.transformationResult === 'P') {
      data.player.push(point)
    } else if (log.transformationResult === 'T') {
      data.tie.push(point)
    }
    
    // 如果有投注记录，添加投注标记
    if (log.baccarat_simulated_betting_log?.length > 0) {
      const betting = log.baccarat_simulated_betting_log[0]
      data.betting.push({
        coord: point,
        value: betting.betting_value,
        result: betting.betting_result,
        symbolSize: GRID_SIZE * 0.4,  // 使用常量
        itemStyle: {
          color: betting.betting_result === 'win' ? '#52c41a' : '#ff4d4f'
        }
      })
    }
  })
  
  return data
}

// 初始化或更新图表
const initOrUpdateChart = async () => {
  await nextTick()
  
  if (!chartRef.value) return
  
  // 计算最大 x 坐标
  const maxX = selectedDeck.value?.baccarat_lottery_log?.reduce((max, log) => 
    Math.max(max, log.x), 0) || 30
    
  // 使用常量计算容器尺寸
  const containerWidth = (maxX + 2) * GRID_SIZE
  const containerHeight = 8 * GRID_SIZE
  
  chartRef.value.style.width = `${containerWidth}px`
  chartRef.value.style.height = `${containerHeight}px`
  
  if (!chart) {
    chart = echarts.init(chartRef.value)
    
    const option = {
      grid: {
        left: GRID_SIZE/2,
        right: GRID_SIZE/2,
        top: GRID_SIZE/2,
        bottom: GRID_SIZE/2,
        show: true,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f0'
      },
      xAxis: {
        type: 'value',
        min: 1,
        max: maxX + 1,
        interval: 1,
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0',
            width: 1,
            type: 'solid'
          }
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        position: 'top'  // 将x轴移到顶部
      },
      yAxis: {
        type: 'value',
        min: 1,
        max: 6,
        interval: 1,
        inverse: false,
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0',
            width: 1,
            type: 'solid'
          }
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
      },
      series: [
        {
          name: '庄',
          type: 'scatter',
          symbolSize: GRID_SIZE * 0.8,
          symbol: 'circle',
          itemStyle: {
            color: '#ff4d4f',
            borderColor: '#fff',
            borderWidth: 2
          },
          data: []
        },
        {
          name: '闲',
          type: 'scatter',
          symbolSize: GRID_SIZE * 0.8,
          symbol: 'circle',
          itemStyle: {
            color: '#1890ff',
            borderColor: '#fff',
            borderWidth: 2
          },
          data: []
        },
        {
          name: '和',
          type: 'scatter',
          symbolSize: GRID_SIZE * 0.4,
          symbol: 'circle',
          itemStyle: {
            color: '#52c41a',
            borderColor: '#fff',
            borderWidth: 2
          },
          data: []
        },
        {
          name: '投注',
          type: 'scatter',
          symbolSize: GRID_SIZE * 0.4,
          symbol: 'diamond',  // 使用菱形标记
          label: {
            show: true,
            position: 'top',
            formatter: (params) => params.data.value,
            color: '#000',
            fontSize: 12
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff'
          },
          data: []
        }
      ]
    }
    
    chart.setOption(option)
  }
  
  // 更新数据和坐标轴范围
  if (selectedDeck.value?.baccarat_lottery_log) {
    const data = formatChartData(selectedDeck.value.baccarat_lottery_log)
    chart.setOption({
      xAxis: {
        max: maxX + 1
      },
      series: [
        { data: data.banker },
        { data: data.player },
        { data: data.tie },
        { data: data.betting }
      ]
    })
    
    // 重新调整图表大小
    chart.resize({
      width: containerWidth,
      height: containerHeight
    })
  }
}

// 监听选中的牌靴变化
watch(() => selectedDeck.value, async (newVal) => {
  if (newVal) {
    await initOrUpdateChart()
  }
}, { deep: true })

// 处理节点选择
const handleSelect = (selectedKeys, event) => {
  const nodeData = event?.node
  if (nodeData?.type === 'deck') {
    const calculatedStats = calculateStats(nodeData.baccarat_lottery_log || [])
    selectedDeck.value = {
      ...nodeData,
      ...calculatedStats
    }
  }
}

// 计算统计数据
const calculateStats = (logs) => {
  // 创建基础统计对象
  const createStatsObject = () => ({
    win: 0,
    lose: 0,
    tie: 0,
    total: 0
  })
  
  // 确保返回完整的数据结构
  const stats = {
    banker_count: 0,
    player_count: 0,
    tie_count: 0,
    total: logs?.length || 0,
    betting_stats: createStatsObject(),
    credibility_stats: {
      HIGH: createStatsObject(),
      MEDIUM: createStatsObject(),
      LOW: createStatsObject()
    },
    betting_log: ''
  }
  
  if (!logs) return stats
  
  logs.forEach(log => {
    if(log.transformationResult === 'B') stats.banker_count++
    if(log.transformationResult === 'P') stats.player_count++
    if(log.transformationResult === 'T') stats.tie_count++
    
    // 统计投注结果
    if(log.betting_log) {
      stats.betting_stats.total++
      
      // 更新总体统计
      if(log.betting_log.betting_result === '1') {
        stats.betting_stats.win++
      } else if(log.betting_log.betting_result === '0') {
        stats.betting_stats.lose++
      } else if(log.betting_log.betting_result === '2') {
        stats.betting_stats.tie++
      }

      // 只有在有可信度时才进行分类统计
      const credibility = log.betting_log.credibility
      if (credibility && stats.credibility_stats[credibility.toUpperCase()]) {
        const level = credibility.toUpperCase()
        stats.credibility_stats[level].total++
        
        if(log.betting_log.betting_result === '1') {
          stats.credibility_stats[level].win++
        } else if(log.betting_log.betting_result === '0') {
          stats.credibility_stats[level].lose++
        } else if(log.betting_log.betting_result === '2') {
          stats.credibility_stats[level].tie++
        }
      }

      if(log.betting_log.betting_result) {
        stats.betting_log += log.betting_log.betting_result
      }
    }
  })
  
  // 移除没有数据的可信度级别
  Object.keys(stats.credibility_stats).forEach(level => {
    if (stats.credibility_stats[level].total === 0) {
      delete stats.credibility_stats[level]
    }
  })
  
  return stats
}

// 计算胜率的辅助函数
const calculateWinRate = (stats) => {
  if (!stats || typeof stats !== 'object') return '0.00'
  
  const win = stats.win || 0
  const total = stats.total || 0
  const tie = stats.tie || 0
  
  const effectiveTotal = total - tie
  return effectiveTotal > 0 ? ((win / effectiveTotal) * 100).toFixed(2) : '0.00'
}

onMounted(() => {
  initTreeData()
})
</script>

<style scoped>
.baccarat-history {
  padding: 20px;
  height: 100%;  /* 使用全部可用高度 */
}

.content-section {
  display: flex;
  gap: 20px;
  height: calc(100vh - 120px);  /* 减去页面padding和其他边距 */
}

.tree-section {
  width: 300px;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;  /* 为滚动条预留空间 */
}

/* 美化树状图滚动条 */
.tree-container::-webkit-scrollbar {
  width: 8px;
}

.tree-container::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.tree-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.tree-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.result-section {
  flex: 1;
  overflow-y: auto;  /* 添加垂直滚动 */
  overflow-x: auto;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  height: 100%;  /* 使用全部可用高度 */
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(30, 40px);
  grid-template-rows: repeat(6, 40px);
  gap: 1px;
  background-color: #f0f0f0;
  padding: 1px;
}

.result-cell {
  background-color: white;
  position: relative;
}

.result-item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.result-banker {
  background-color: #ff4d4f;
}

.result-player {
  background-color: #1890ff;
}

.result-tie {
  background-color: #52c41a;
}

.statistics {
  margin-top: 20px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.stats-item {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.tie-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #52c41a;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  margin: 0 auto;
  border: 1px solid #f0f0f0;
  background: #fff;
  min-height: v-bind(CHART_MIN_HEIGHT + 'px');  /* 使用常量 */
}

/* 优化滚动条样式 */
.result-section::-webkit-scrollbar {
  height: 8px;
}

.result-section::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.result-section::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.result-section::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.betting-stats {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #f0f0f0;
}

.betting-stats span {
  color: #666;
}

.betting-stats span:nth-child(2) {
  color: #52c41a;
}

.betting-stats span:nth-child(3) {
  color: #ff4d4f;
}

.credibility-stats {
  margin-top: 10px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
}

.credibility-item {
  padding: 8px;
  border-bottom: 1px dashed #f0f0f0;
}

.credibility-item:last-child {
  border-bottom: none;
}

.credibility-level {
  font-weight: bold;
  min-width: 80px;
}

.win-count {
  color: #52c41a;
}

.lose-count {
  color: #ff4d4f;
}

.tie-count {
  color: #1890ff;
}

.win-rate {
  font-weight: bold;
  color: #52c41a;
}

.stats-header {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}
</style>
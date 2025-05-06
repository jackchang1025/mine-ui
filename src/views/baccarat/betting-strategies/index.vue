<template>
  <div class="strategy-container">
    <a-card title="投注策略对比" :loading="loading">
      <ma-charts 
        :option="chartOption" 
        height="600px"
      />
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const chartOption = reactive({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['平注策略', '分层策略', '倍投策略']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []
  },
  yAxis: {
    type: 'value',
    name: '余额'
  },
  series: [
    {
      name: '平注策略',
      type: 'line',
      data: [],
      itemStyle: { color: '#52c41a' }
    },
    {
      name: '分层策略',
      type: 'line',
      data: [],
      itemStyle: { color: '#1890ff' }
    },
    {
      name: '倍投策略',
      type: 'line',
      data: [],
      itemStyle: { color: '#ff4d4f' }
    }
  ]
})

const loadData = async () => {
  try {
    loading.value = true
    const res = await fetchStrategyData() // 需要实现这个API
    
    // 更新图表数据
    chartOption.xAxis.data = res.data.rounds
    chartOption.series[0].data = res.data.flatNote
    chartOption.series[1].data = res.data.layered
    chartOption.series[2].data = res.data.martingale
    
  } catch (e) {
    Message.error('加载数据失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.strategy-container {
  padding: 20px;
}
</style> 
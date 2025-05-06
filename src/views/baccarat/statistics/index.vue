<template>
  <div class="statistics-container">
    <a-row :gutter="16">
      <!-- 总体统计卡片 -->
      <a-col :span="24">
        <a-card title="总体统计" :loading="loading">
          <a-row :gutter="16">
            <a-col :span="12">
              <ma-charts 
                :option="pieOption" 
                :loading="loading"
                height="400px"
              />
            </a-col>
            <a-col :span="12">
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="label">总投注次数:</span>
                  <span class="value">{{ overallStats.summary?.total_bets || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">总胜利次数:</span>
                  <span class="value win">{{ overallStats.summary?.total_wins || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">总失败次数:</span>
                  <span class="value lose">{{ overallStats.summary?.total_losses || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">总和局次数:</span>
                  <span class="value tie">{{ overallStats.summary?.total_ties || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">平均胜率:</span>
                  <span class="value win">{{ overallStats.summary?.avg_win_rate || 0 }}%</span>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      
      <!-- 可信度统计卡片 -->
      <a-col :span="24" style="margin-top: 16px;">
        <a-card title="可信度统计" :loading="loading">
          <ma-charts 
            :option="credibilityOption" 
            :loading="loading"
            height="400px"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import baccaratStatistics from '@/api/baccarat/baccaratStatistics'


const loading = ref(false)
const overallStats = ref({})
const credibilityStats = ref({})

// 饼图配置
const pieOption = reactive({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 10,
    top: 'center',
    textStyle: {
      color: '#333'
    }
  },
  color: ['#52c41a', '#ff4d4f', '#1890ff'],
  series: [
    {
      name: '投注结果',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}: {c} ({d}%)'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: true
      },
      data: []
    }
  ]
})

// 可信度图表配置
const credibilityOption = reactive({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['总投注', '胜', '负', '和', '胜率'],
    top: 10
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: [
    {
      type: 'value',
      name: '次数',
      position: 'left'
    },
    {
      type: 'value',
      name: '胜率',
      position: 'right',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        formatter: '{value}%'
      }
    }
  ],
  series: []
})

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    
    // 加载总体统计
    const overallRes = await baccaratStatistics.getOverallStats()
    overallStats.value = overallRes.data
    
    // 更新饼图数据
    pieOption.series[0].data = [
      { 
        name: '胜', 
        value: overallStats.value.summary.total_wins,
        itemStyle: { color: '#52c41a' }
      },
      { 
        name: '负', 
        value: overallStats.value.summary.total_losses,
        itemStyle: { color: '#ff4d4f' }
      },
      { 
        name: '和', 
        value: overallStats.value.summary.total_ties,
        itemStyle: { color: '#1890ff' }
      }
    ]
    
    // 加载可信度统计
    const credibilityRes = await baccaratStatistics.getCredibilityStats()
    credibilityStats.value = credibilityRes.data
    
    // 更新可信度图表
    if (credibilityStats.value.chartData) {
      credibilityOption.xAxis.data = credibilityStats.value.chartData.xAxis
      credibilityOption.series = [
        {
          name: '总投注',
          type: 'bar',
          barWidth: 10,
          data: credibilityStats.value.chartData.series[0].data
        },
        {
          name: '胜',
          type: 'bar',
          barWidth: 10,
          itemStyle: { color: '#52c41a' },
          data: credibilityStats.value.chartData.series[1].data
        },
        {
          name: '负',
          type: 'bar',
          barWidth: 10,
          itemStyle: { color: '#ff4d4f' },
          data: credibilityStats.value.chartData.series[2].data
        },
        {
          name: '和',
          type: 'bar',
          barWidth: 10,
          itemStyle: { color: '#1890ff' },
          data: credibilityStats.value.chartData.series[3].data
        },
        {
          name: '胜率',
          type: 'line',
          yAxisIndex: 1,
          symbolSize: 8,
          lineStyle: {
            width: 2,
            type: 'solid'
          },
          itemStyle: { color: '#ffd700' },
          data: credibilityStats.value.chartData.series[4].data
        }
      ]
    }
    
  } catch (e) {
    Message.error('加载统计数据失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 初始加载
loadData()
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.summary-stats {
  padding: 20px;
}

.stat-item {
  margin-bottom: 16px;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.stat-item .label {
  color: #666;
  margin-right: 8px;
  min-width: 100px;
}

.stat-item .value {
  font-weight: bold;
  font-size: 20px;
}

.stat-item .win {
  color: #52c41a;
}

.stat-item .lose {
  color: #ff4d4f;
}

.stat-item .tie {
  color: #1890ff;
}
</style> 
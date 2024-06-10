
<template>

  <ma-chart :options="chartOptions" :autoresize="autoresize" :width="width" :height="height"/>

</template>

<script setup >
import { ref, computed, watch } from 'vue'

const props = defineProps({
  betLogList: {
    type: Object,
    required: true
  },
  autoresize: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
})

const chartOptions = ref({})

const  createChartOptions = () => {

  chartOptions.value.legend = {}
  chartOptions.value.grid = []
  chartOptions.value.xAxis = []
  chartOptions.value.yAxis = []
  chartOptions.value.dataset = []
  chartOptions.value.series = []

  chartOptions.value.toolbox = {
    left: 'center',
    feature: {
      dataZoom: {}
    }
  }

  chartOptions.value.tooltip = {
    trigger: 'item',
    formatter: function (params) {
      const strategyName = params.seriesName
      const betAmount = params.data?.bet_amount
      const totalAmount = params.data?.total_amount
      const issue = params.data?.issue
      const betting_result = params.data?.betting_result
      const created_at = params.data?.created_at

      return `
strategyName: ${strategyName}<br/>
bettingResult: ${betting_result}<br/>
betAmount: ${betAmount}<br/>
totalAmount: ${totalAmount}<br/>
issue: ${issue}<br/>
created_at: ${created_at}<br/>
`
    }
  }

  let index = 0

  const symbolSize = 2.5
  const gridHeight = 250
  const gridGap = 100

  for (const strategyName in props.betLogList) {
    const gridIndex = index
    const xAxisIndex = index
    const yAxisIndex = index

    chartOptions.value.grid.push({
      left: '10%',
      right: '10%',
      top: index * (gridHeight + gridGap) + 60,
      height: gridHeight
    })

    chartOptions.value.dataset.push({
      source: props.betLogList[strategyName]
    })


    if (index === 0){

      let continuousWinCount = 0
      let continuousLoseCount = 0

      props.betLogList[strategyName].forEach((item, index) => {
        if (item.betting_result === '1') {
          continuousWinCount++
          continuousLoseCount = 0
        } else {
          continuousLoseCount++
          continuousWinCount = 0
        }

      })

      chartOptions.value.xAxis.push({
        type: 'category',
        gridIndex: gridIndex,
        name: strategyName,
        nameLocation: 'middle',
        boundaryGap: true,
        data: props.betLogList[strategyName].map(item => item.issue), // 使用issue作为x轴的类目数据
        axisTick: {
          show: true,
          alignWithLabel: true,
          interval: 0
        }
      })

      chartOptions.value.yAxis.push({
        type: 'value',
        gridIndex: gridIndex,
        name: 'Continuous Count',
        scale: true
      })


      chartOptions.value.series.push({
        name: 'Continuous Win',
        type: 'bar',
        stack: 'continuous',
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        data: props.betLogList[strategyName].map(item => item.betting_result === '1' ? continuousWinCount : '-'),
        itemStyle: {
          color: '#00da3c'
        }
      })

      chartOptions.value.series.push({
        name: 'Continuous Lose',
        type: 'bar',
        stack: 'continuous',
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        data: props.betLogList[strategyName].map(item => item.betting_result === '0' ? continuousLoseCount : '-'),
        itemStyle: {
          color: '#ec0000'
        }
      })

    }else {

      chartOptions.value.xAxis.push({
        type: 'category',
        gridIndex: gridIndex,
        name: strategyName,
        nameLocation: 'middle',
        boundaryGap: true,
        axisTick: {
          show: true,
          alignWithLabel: true,
          interval: 0
        }
      })

      chartOptions.value.yAxis.push({
        type: 'value',
        gridIndex: gridIndex,
        name: '金额',
        axisLabel: {
          formatter: '{value} 元'
        },
        scale: true
      })

      chartOptions.value.series.push({
        name: `${strategyName} bet_amount`,
        type: 'line',
        symbolSize: symbolSize,
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        datasetIndex: index,
        encode: {
          x: 'issue',
          y: 'bet_amount',
          tooltip: ['issue', 'sequence', 'bet_amount', 'total_amount']
        },
        itemStyle: {
          color: '#c75562'
        }
      })

      chartOptions.value.series.push({
        name: `${strategyName} total_amount`,
        type: 'bar',
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        datasetIndex: index,
        encode: {
          x: 'issue',
          y: 'total_amount',
          tooltip: ['issue', 'sequence', 'bet_amount', 'total_amount']
        }
      })

    }

    chartOptions.value.dataZoom = [
      {
        type: 'inside',
        xAxisIndex: chartOptions.value.xAxis.map((_, index) => index),
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        xAxisIndex: chartOptions.value.xAxis.map((_, index) => index),
        start: 0,
        end: 100
      }
    ]

    index++
  }
}

watch(
    () => props.betLogList,
    () => {

      createChartOptions()

      console.log('ma-charts-waiting-strategy/index.vue watch props.betLogList', props.betLogList)
    },
    { immediate: true, deep: true }
)

</script>

<style scoped lang="less"></style>
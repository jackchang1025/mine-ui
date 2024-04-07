
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
      const sequence = params.data?.sequence

      return `
strategyName: ${strategyName}<br/>
sequence: ${sequence}<br/>
betAmount: ${betAmount}<br/>
totalAmount: ${totalAmount}<br/>
issue: ${issue}`
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

    chartOptions.value.xAxis.push({
      type: 'category',
      gridIndex: gridIndex,
      name: '期号',
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

    chartOptions.value.dataset.push({
      source: props.betLogList[strategyName]
    })

    chartOptions.value.series.push({
      name: `${strategyName} Sequence`,
      type: 'line',
      symbolSize: symbolSize,
      xAxisIndex: xAxisIndex,
      yAxisIndex: yAxisIndex,
      encode: {
        x: 'issue',
        y: 'sequence',
        tooltip: ['issue', 'sequence', 'bet_amount', 'total_amount']
      },
      itemStyle: {
        color: 'green'
      },
      markLine: {
        data: [
          {
            name: '连续输赢分界线',
            yAxis: 0.5
          }
        ]
      }
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

      console.log('chartOptions', chartOptions.value)
    },
    { immediate: true, deep: true }
)

</script>

<style scoped lang="less"></style>
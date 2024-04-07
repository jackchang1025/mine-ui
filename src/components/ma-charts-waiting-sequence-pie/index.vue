
<template>

  <ma-chart :options="chartOptionsPie" :autoresize="autoresize" :width="width" :height="height"/>
</template>

<script setup >
import {ref, computed, watch} from 'vue'

const props = defineProps({
  sequence: {
    type: String,
    required: true,
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

const chartOptionsPie = ref({})

const createChartOptionsPie = () => {

  // 计算 sequence 的总数
  const totalCount = props.sequence.length

  // 计算 1 的数量
  const count1 = props.sequence.split('').filter(char => char === '1').length

  // 计算 0 的数量
  const count0 = totalCount - count1

  chartOptionsPie.value = {
    title: {
      text: 'win of lose',
      subtext: 'Fake Data',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: count1, name: 'win' },
          { value: count0, name: 'lose' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

watch(
    () => props.sequence,
    () => {
      createChartOptionsPie()
    },
    { immediate: true, deep: true }
)

</script>

<style scoped lang="less"></style>
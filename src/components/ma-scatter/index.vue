<template>
  <v-charts
      v-if="renderChart"
      :option="chartData"
      :autoresize="autoresize"
      :style="{ width, height }"
  />
</template>

<script setup>
import {nextTick, ref, watch, computed, reactive,watchEffect} from 'vue';
import VCharts from 'vue-echarts';
import CalculateCoordinates from "@/utils/CalculateCoordinates"
import * as echarts from 'echarts';


const props = defineProps({
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
  baccaratTerraceDeck: {
    type: Object,
    default: {
      baccarat_lottery_log:[]
    }
  }
});

const baccaratLotteryLogList = ref([]);

baccaratLotteryLogList.value = props.baccaratTerraceDeck.baccarat_lottery_log;

const chartData = computed(() => ({

  title: {
    text: '统计信息',
    left: 'center',
    bottom: 0,
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal',
    },
    subtext: `总共: ${baccaratLotteryLogList.value?.length}, 闲 ${props.baccaratTerraceDeck?.playerCount ?? 0}: , 庄: ${props.baccaratTerraceDeck?.bankerCount ?? 0}, 和: ${props.baccaratTerraceDeck?.tieCount ?? 0}`,
    subtextStyle: {
      fontSize: 12,
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      // params 包含了当前数据点的信息
      // 返回自定义的提示框内容
      return `X: ${params.value.x}<br/>
Y: ${params.value.y}<br/>
id: ${params.value.id}<br/>
issue: ${params.value.issue}<br/>
terrace_deck_id: ${params.value.terrace_deck_id}<br/>
transformationResult: ${params.value.transformationResult}<br/>
Result: ${params.value.result}`;
    },
  },
  // dataZoom: [
  //   {
  //     type: 'slider', // 使用滑动条类型的 dataZoom
  //     start: 0, // 数据窗口的起始百分比，表示数据窗口包含数据集起始的0%
  //     end: 100 // 数据窗口的结束百分比，表示数据窗口包含数据集起始的10%
  //   }
  // ],
  grid: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',   // grid 组件的宽度
  },
  xAxis: {
    type: 'category',
    show: true,
    name: `庄： 闲： 和：`,
  },
  yAxis: {
    type: 'category',
    show: true,
    inverse: true,
  },
  dataset: {
    // dimensions: ['x', 'y', 'result'],
    // 提供一份数据。
    source: baccaratLotteryLogList.value
  },
  series: [
    {
      type: 'scatter',
      symbolSize: 25,
      encode: {
        x: 'x', // 将数据的 x 属性映射到 x 轴
        y: 'y', // 将数据的 y 属性映射到 y 轴
        tooltip: ['id','issue','terrace_deck_id','transformationResult','x', 'y', 'result',''] // 将所有属性用于tooltip的显示
      },
      itemStyle: {
        color: (params) => {
          const value = params.value.transformationResult;
          if (value === 'P') {
            return '#294D99';
          } else if (value === 'B') {
            return '#B9001B';
          }
        },
      },
      label: {
        show: true,
        formatter: function (params) {
          // 返回自定义的提示框内容

          let string = ``;
          if (params.value?.baccarat_simulated_betting_log?.length) {

            console.log("投：",params.value?.baccarat_simulated_betting_log)
            string += `投 `;
          }

          if (params.value?.transformationResult === 'T') {

            string += ` 和`;
          }
          return string;
        }
      }
    },
  ],
}));

const renderChart = ref(false);

watch(
    () => props.baccaratTerraceDeck,
    (newData) => {
      // 更新图表数据源
      baccaratLotteryLogList.value = newData.baccarat_lottery_log;

      console.log("watch baccaratTerraceDeck:",baccaratLotteryLogList.value)

      // 强制重新挂载图表组件
      renderChart.value = false;
      nextTick(() => {
        renderChart.value = true;
      });
    }
);

nextTick(() => {

  if (baccaratLotteryLogList.value?.length){
    renderChart.value = true;
  }

});
</script>

<style scoped lang="less"></style>
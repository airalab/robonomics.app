<template>
  <chart :options="chartOptions" ref="chart" />
</template>

<script>
import { Chart } from "highcharts-vue";
import { getCurrentInstance, onMounted, watch } from "vue";

export default {
  components: { Chart },
  props: ["log"],
  setup(props) {
    const getSeries = (data) => {
      const seriesRaw = {};
      for (const row of data) {
        for (const item of row.data) {
          if (seriesRaw[item.name]) {
            seriesRaw[item.name].data.push([
              row.moment,
              parseFloat(item.value)
            ]);
          } else {
            seriesRaw[item.name] = {
              name: item.name,
              data: [[row.moment, parseFloat(item.value)]]
            };
          }
        }
      }
      return Object.values(seriesRaw);
    };
    const series = getSeries(props.log);

    let chart;
    onMounted(() => {
      chart = getCurrentInstance().refs.chart.chart;
    });

    watch(props.log, (value) => {
      if (!chart) {
        return;
      }
      const series = getSeries(value);
      if (series.length > 0) {
        series.forEach((newdata) => {
          const id = chart.series.findIndex((m) => m.name === newdata.name);
          if (id >= 0) {
            chart.series[id].setData(newdata.data, false);
          } else {
            chart.addSeries(newdata);
          }
        });
        chart.redraw();
      }
    });

    return {
      chartOptions: {
        lang: {
          locale: "en"
        },
        title: {
          text: ""
        },
        time: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        xAxis: {
          title: false,
          type: "datetime",
          labels: {
            overflow: "justify",
            format: "{value: %H:%M }"
          }
        },
        yAxis: {
          title: false
        },
        tooltip: {
          valueDecimals: 2
        },
        series: series
      }
    };
  }
};
</script>

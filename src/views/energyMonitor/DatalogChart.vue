<template>
  <chart :options="chartOptions" ref="chart" />
</template>

<script>
import { Chart } from "highcharts-vue";
import { getCurrentInstance, onMounted, watch } from "vue";
import measurements from "./measurements";

export default {
  components: { Chart },
  props: ["log"],
  setup(props) {
    const getSeries = (data) => {
      const seriesRaw = {};
      for (const row of data) {
        for (const item of row.data) {
          if (seriesRaw[item.fullKey]) {
            seriesRaw[item.fullKey].data.push([
              row.moment,
              parseFloat(item.value)
            ]);
          } else {
            let name = item.fullKey;
            if (
              measurements[item.fullKey] &&
              measurements[item.fullKey].label
            ) {
              name = measurements[item.fullKey].label;
            }
            seriesRaw[item.fullKey] = {
              name: name,
              data: [[row.moment, parseFloat(item.value)]],
              tooltip: {
                valueSuffix: ` ${measurements[item.fullKey].unit ?? ""}`
              }
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
        chart: {
          spacing: [50, 20, 20, 20]
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

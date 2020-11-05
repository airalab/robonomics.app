<template>
  <div class="small">
    <highcharts :options="options" ref="chart"></highcharts>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: ["log"],
  data() {
    return {
      datacollection: null,
      options: {
        title: false,
        chart: {
          type: "spline",
          height: 300,
        },
        xAxis: {
          type: "datetime",
          labels: {
            formatter: function () {
              return moment(this.value, "X").format("HH:mm");
            },
          },
          title: false,
        },
        yAxis: {
          min: 0,
          title: false,
        },
        tooltip: {
          shared: true,
          crosshairs: true,
          formatter: function () {
            let data = "";
            this.points.forEach((d) => {
              data += "<b>" + d.series.name + "</b> = " + d.y + "<br />";
            });
            return (
              "<span>" +
              moment(this.x, "X").format("DD.MM.YYYY HH:mm:ss") +
              "</span><br />" +
              data
            );
          },
        },
        series: [],
      },
    };
  },
  mounted() {
    this.fillData();
  },
  watch: {
    log: function () {
      this.fillData();
    },
  },
  methods: {
    fillData() {
      const series = [
        {
          name: "PM10",
          color: "#e8b738",
          lineWidth: 1,
          data: [],
          options: {
            name: "pm10",
          },
        },
        {
          name: "PM2.5",
          color: "#89b268",
          lineWidth: 1,
          data: [],
          options: {
            name: "pm25",
          },
        },
      ];
      for (const i in series) {
        series[i].data = this.log.map((item) => {
          return [Number(item.timestamp), item.data[series[i].options.name]];
        });
      }
      this.options.series = series;
    },
    addPoint(index, point) {
      this.$refs.chart.chart.series[index].addPoint(point, true, false);
    },
  },
};
</script>

<style>
.small {
  max-width: 400px;
  margin: 0 auto;
}
</style>

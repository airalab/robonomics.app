<template>
  <div id="map"></div>
</template>

<script>
import leaflet from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import generate, { getColor, getColorRGB } from "../utils/color";
import "leaflet-arrowheads";

delete leaflet.Icon.Default.prototype._getIconUrl;
leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

const scale = generate(
  ["#00796b", "#00796b", "#f9a825", "#e65100", "#dd2c00", "#dd2c00", "#8c0084"],
  [0, 25, 50, 75, 100, 500]
);

let map;
let markers;
let paths = {};

export default {
  props: ["zoom", "lat", "lng"],
  mounted() {
    map = leaflet.map("map").setView([this.lat, this.lng], this.zoom);
    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a rel="nofollow" href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      })
      .addTo(map);

    map.zoomControl.setPosition("bottomright");

    map.on("zoomend", (e) => {
      const pos = e.target.getCenter();
      this.$router.replace({
        name: "sensors-map",
        params: {
          provider: this.$route.params.provider || "ipfs",
          type: this.$route.params.type || "pm10",
          zoom: e.target.getZoom(),
          lat: pos.lat.toFixed(4),
          lng: pos.lng.toFixed(4)
        }
      });
    });
    map.on("moveend", (e) => {
      const pos = e.target.getCenter();
      this.$router
        .replace({
          name: "sensors-map",
          params: {
            provider: this.$route.params.provider || "ipfs",
            type: this.$route.params.type || "pm10",
            zoom: e.target.getZoom(),
            lat: pos.lat.toFixed(4),
            lng: pos.lng.toFixed(4)
          }
        })
        .catch(() => {});
    });

    const iconCreateFunction = function (cluster) {
      const markers = cluster.getAllChildMarkers();
      const childCount = cluster.getChildCount();
      let sum = 0;
      markers.forEach((marker) => {
        sum += marker.options.data.value;
      });
      if (childCount > 0) {
        sum = sum / childCount;
      }
      const color = getColorRGB(scale, sum);
      const isDark = scale(sum).luminance() < 0.4;

      return new leaflet.DivIcon({
        html:
          "<div style='font-weight: bold;color:" +
          (isDark ? "white" : "black") +
          ";background-color: rgba(" +
          color +
          ", 0.7);border-color: rgba(" +
          color +
          ", 0.5);border-width: 3px;border-style: solid;border-radius: 18px;'><span>" +
          childCount +
          "</span></div>",
        className: "marker-cluster",
        iconSize: new leaflet.Point(40, 40)
      });
    };

    markers = new leaflet.MarkerClusterGroup({
      showCoverageOnHover: false,
      // zoomToBoundsOnClick: false,
      maxClusterRadius: 120,
      iconCreateFunction: iconCreateFunction
    });

    map.addLayer(markers);
  },
  methods: {
    findMarker(sensor_id, markers) {
      return new Promise((resolve) => {
        markers.eachLayer((m) => {
          if (m.options.data.sensor_id === sensor_id) {
            resolve(m);
          }
        });
        resolve(false);
      });
    },
    async addPoint(point) {
      if (point.model === 1) {
        return this.addPointPing(point);
      } else if (point.model === 2) {
        return this.addPointStatic(point);
      } else if (point.model === 3) {
        return this.addPointPath(point);
      }
      return false;
    },
    async addPointPing(point) {
      const coord = point.geo.split(",");
      const color = "#56ce78";
      leaflet
        .circleMarker(new leaflet.LatLng(coord[0], coord[1]), {
          radius: 7,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.7,
          data: point
        })
        .on("click", (e) => {
          this.$emit("clickMarker", e.target.options.data);
        })
        .addTo(map);
    },
    async addPointStatic(point) {
      const coord = point.geo.split(",");
      const color = getColor(scale, point.value);

      const m = await this.findMarker(point.sensor_id, markers);
      if (m) {
        m.setStyle({
          fillColor: color,
          color: color
        });
      } else {
        const marker = leaflet
          .circleMarker(new leaflet.LatLng(coord[0], coord[1]), {
            radius: 15,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.7,
            data: point
          })
          .on("click", (e) => {
            this.$emit("clickMarker", e.target.options.data);
          });
        markers.addLayer(marker);
      }
    },
    async addPointPath(point) {
      const coord = point.geo.split(",");
      const color = getColor(scale, point.value);
      if (Object.prototype.hasOwnProperty.call(paths, point.sensor_id)) {
        if (paths[point.sensor_id].getLatLngs().length === 1) {
          paths[point.sensor_id]
            .arrowheads({
              yawn: 40,
              fill: true,
              frequency: "endonly"
            })
            .setStyle({
              color: color
            })
            .addLatLng(coord);
        } else {
          paths[point.sensor_id]
            .setStyle({
              color: color
            })
            .addLatLng(coord);
        }
      } else {
        const polyline = leaflet
          .polyline([coord], {
            color: color,
            // dashArray: "10",
            weight: 5,
            opacity: 0.7,
            data: point
          })
          .on("click", (e) => {
            this.$emit("clickMarker", e.target.options.data);
          })
          .addTo(map);
        paths[point.sensor_id] = polyline;
      }
    }
  }
};
</script>

<style scoped lang="scss">
#map {
  width: 100%;
  height: calc(100vh - 85px);
}
</style>

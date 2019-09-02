<template>
  <fragment>
    <h1>{{ $t('services.title') }}</h1>
    <section class="flex-grid">
      <div
        v-for="(service, index) in services"
        :key="index"
        class="section-light item"
        :class="{disabled: service.disabled}"
      >
        <a class="item-avatar" :href="service.link" target="_blank">
          <span class="item-avatar--image" :style="`background-image: url('${service.img}')`"></span>
        </a>
        <div class="item-content">
          <h2>
            <a :href="service.link" target="_blank">{{service[$i18n.locale].name}}</a>
          </h2>
          <div class="t-hyphen">{{service[$i18n.locale].desc}}</div>
          <div class="item-bottom">
            <div class="item-bottom--line">
              <span>Provider:</span>
              <span class="item-bottom--info">{{service.by.label}}</span>
            </div>
            <div v-if="service.token && service.token.name" class="item-bottom--line">
              <span>Payment token:</span>
              <span class="item-bottom--info">{{service.token.name}}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </fragment>
</template>

<script>
import { Token } from "robonomics-js";
import Web3Check from "vue-web3-check";

export default {
  data() {
    return {
      services: [
        {
          en: {
            name: "Gaka-chu",
            desc:
              "Buy the robot's idea on a canvas with copyright digital mark stored in the public blockchain."
          },
          ru: {
            name: "Гака-чу",
            desc:
              "Купите мысль робота на холсте с цифровой меткой права в публичном блокчейне."
          },
          link: "#",
          img: "assets/i/services/gaka-chu.png",
          by: {
            link: "#",
            label: "Airalab"
          },
          token: null,
          disabled: true
        },
        {
          en: {
            name: "Smart building offsetting",
            desc:
              "Carbon footprint clearance for smart buildings based on geolocation and energy consumption information."
          },
          ru: {
            name: "Погашение углеродного следа для умного здания",
            desc:
              "Сервис погашения углеродного следа умных зданий на основе информации о геолокации и потреблении электроэнергии."
          },
          link: "https://new.dapp.ipci.io/#/offsetting",
          img: "assets/i/services/smart-buildings.png",
          by: {
            link: "#",
            label: "DAO IPCI IoT connection"
          },
          token: "0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7",
          disabled: false
        },
        {
          en: {
            name: "Environmental assets tokenization",
            desc:
              "Emission of carbon units and green certificates based on data from renewable energy sources."
          },
          ru: {
            name: "Токенизация экологических активов",
            desc:
              "Сервис эмиссии углеродных единиц и зеленых сертификатов на основе данных от возобновляемого источника электроэнергии."
          },
          link: "https://new.dapp.ipci.io/#/tokenization",
          img: "assets/i/services/smart-assets.png",
          by: {
            link: "#",
            label: "DAO IPCI IoT connection"
          },
          token: "0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7",
          disabled: false
        },
        {
          en: {
            name: "Drone passport registration",
            desc:
              "Global drone registration service in the Ethereum Blockchain."
          },
          ru: {
            name: "Регистрация паспорта дрона",
            desc: "Сервис глобальной регистрации дронов в Ethereum Blockchain."
          },
          link: "https://drone-employee.com/#/registration",
          img: "assets/i/services/drone-passport.png",
          by: {
            link: "#",
            label: "Distributed sky"
          },
          token: "0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7",
          disabled: false
        },
        {
          en: {
            name: "Drone flight report",
            desc: "Drone flight public reporting service."
          },
          ru: {
            name: "Отчёт о полётах дронов",
            desc: "Сервис публичных отчетов о выполненных полетах дронов."
          },
          link: "https://drone-employee.com/#/flight",
          img: "assets/i/services/drone-route.png",
          by: {
            link: "#",
            label: "Distributed sky"
          },
          token: "0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7",
          disabled: false
        }
      ]
    };
  },
  mounted() {
    this.loadTokens();
  },
  methods: {
    loadTokens() {
      if (Web3Check.store.state.networkId === 1) {
        this.services.forEach(async (service, i) => {
          if (service.token) {
            const token = new Token(
              this.$robonomics.web3,
              this.services[i].token
            );
            const name = await token.call.name();
            const symbol = await token.call.symbol();
            this.services[i].token = {
              address: this.services[i].token,
              name: `${name} (${symbol})`
            };
          }
        });
      }
    }
  }
};
</script>

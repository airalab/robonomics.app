<template>
  <Page>
    <h1>{{ $t("services.title") }}</h1>
    <section class="flex-grid">
      <RCard
        v-for="(service, index) in services"
        :key="index"
        class="item"
        :class="{ disabled: service.disabled }"
      >
        <RImgHover v-if="service.target" :src="service.img" :href="service.link" />
        <RImgHover v-else :src="service.img" :to="service.link" />
        <div class="item-content">
          <h2>
            <a
              v-if="service.target"
              :href="service.link"
              target="_blank"
            >{{ service[$i18n.locale].name }}</a>
            <router-link v-else :to="service.link">{{ service[$i18n.locale].name }}</router-link>
          </h2>
          <div class="t-hyphen">{{ service[$i18n.locale].desc }}</div>
          <div class="item-bottom">
            <div class="item-bottom--line">
              <span>Provider:</span>
              <span class="item-bottom--info">{{ service.by.label }}</span>
            </div>
            <div v-if="service.token && service.token.name" class="item-bottom--line">
              <span>Payment token:</span>
              <span class="item-bottom--info">{{ service.token.name }}</span>
            </div>
          </div>
        </div>
      </RCard>
    </section>
  </Page>
</template>

<script>
import { mapState } from "vuex";
import { Token } from "robonomics-js";
import Page from "../components/Page";
import sensorsNetwork from "../services/sensors-network/meta";
import config from "~config";

export default {
  components: { Page },
  data() {
    return {
      services: [
        sensorsNetwork,
        {
          en: {
            name: "Public blockchain stamp",
            desc: "Global registration service in the Ethereum Blockchain."
          },
          ru: {
            name: "Публичный блокчейн-штамп",
            desc: "Сервис глобальной регистрации в Ethereum Blockchain."
          },
          link: { name: "blockchain-stamp" },
          target: false,
          img: "assets/i/services/digital-passport.png",
          by: {
            link: "#",
            label: "Airalab"
          },
          token: config.chain.get().TOKEN.dai
            ? config.chain.get().TOKEN.dai.address
            : false,
          disabled: false
        },
        {
          en: {
            name: "Fuji weather",
            desc: "Get Weather on Fuji Mountain."
          },
          ru: {
            name: "Fuji погода",
            desc: "Получить погоду на горе Фудзи."
          },
          link: {
            name: "sensor",
            params: {
              lighthouse: "airalab",
              model: "QmbQT8cj9TJKfYVaidfShnrEX1g14yTC9bdG1XbcRX73wY",
              agent: "0x4D8a26e1f055c0b28D71cf1deA05f0f595a6975d"
            }
          },
          target: false,
          img: "assets/i/services/fuji_mountain_DAPP.png",
          by: {
            link: "#",
            label: "Airalab"
          },
          token: null,
          disabled: false
        },
        {
          en: {
            name: "The Playground",
            desc: "Playground at home Sportivnaya 33"
          },
          ru: {
            name: "Детская площадка",
            desc: "Детская площадка дома Спортивная 33."
          },
          link: {
            name: "sensor",
            params: {
              lighthouse: "airalab",
              model: "Qmczm9hw8SjGmtx55t6MJPQTtXQDuS9grqaTb18Sv8b6pm",
              agent: "0xFfd95814A77884AfF78B7e6eAFCEbB81c3C2D765"
            }
          },
          target: false,
          img: "assets/i/services/Robonomics_DVOR.jpg",
          by: {
            link: "#",
            label: "Airalab"
          },
          token: null,
          disabled: false
        },
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
          target: true,
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
          target: true,
          img: "assets/i/services/smart-buildings.png",
          by: {
            link: "#",
            label: "DAO IPCI IoT connection"
          },
          token: config.chain.get().TOKEN.dai
            ? config.chain.get().TOKEN.dai.address
            : false,
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
          link: "https://new.dapp.ipci.io/#/issuing",
          target: true,
          img: "assets/i/services/smart-assets.png",
          by: {
            link: "#",
            label: "DAO IPCI IoT connection"
          },
          token: config.chain.get().TOKEN.dai
            ? config.chain.get().TOKEN.dai.address
            : false,
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
          target: true,
          img: "assets/i/services/drone-passport.png",
          by: {
            link: "#",
            label: "Distributed sky"
          },
          token: config.chain.get().TOKEN.dai
            ? config.chain.get().TOKEN.dai.address
            : false,
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
          target: true,
          img: "assets/i/services/drone-route.png",
          by: {
            link: "#",
            label: "Distributed sky"
          },
          token: config.chain.get().TOKEN.dai
            ? config.chain.get().TOKEN.dai.address
            : false,
          disabled: false
        }
      ]
    };
  },
  computed: {
    ...mapState("chain", ["networkId"])
  },
  created() {
    document.title = `${this.$t("services.title")} – Robonomics Network dApp`;
    this.loadTokens();
  },
  methods: {
    loadTokens() {
      if (this.networkId === 1) {
        this.services.forEach(async (service, i) => {
          if (service.token) {
            const token = new Token(
              this.$robonomics.web3,
              this.services[i].token
            );
            const name = await token.methods.name().call();
            const symbol = await token.methods.symbol().call();
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

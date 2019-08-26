<template>
  <fragment>
    <h1>Сервисы для роботов</h1>
    <section class="flex-grid">
      <div
        v-for="(service, index) in services"
        :key="index"
        class="section-light item"
        :class="{disabled: service.disabled}"
      >
        <a class="item-img" :href="service.link" target="_blank">
          <img class="i-block" alt :src="service.img" />
        </a>
        <div class="item-content">
          <h2>
            <a :href="service.link" target="_blank">{{service.name}}</a>
          </h2>
          <div class="t-hyphen">{{service.desc}}</div>
          <div class="item-bottom">
            By
            <a :href="service.by.link" target="_blank">{{service.by.label}}</a>
            <a
              class="js-tooltip icon-round-sm m-l-15"
              href="#"
              data-tooltip="Здесь инфо о том, что это провайдер. Общая для всех сервисов, наверное"
            >i</a>
          </div>
        </div>
      </div>
    </section>
  </fragment>
</template>

<script>
export default {
  data() {
    return {
      services: [
        {
          name: "Gaka-chu",
          link: "#",
          img: "assets/i/services/gaka-chu.png",
          desc:
            "Купите мысль робота на холсте с цифровой меткой права в публичном блокчейне.",
          by: {
            link: "#",
            label: "Airalab"
          },
          disabled: true
        },
        {
          name: "Smart building offsetting",
          link: "#",
          img: "assets/i/services/smart-buildings.png",
          desc:
            "Сервис погашения углеродного следа умных зданий на основе информации о геолокации и потреблении электроэнергии.",
          by: {
            link: "#",
            label: "DAO IPCI IoT connection"
          },
          disabled: true
        },
        {
          name: "Environmental assets tokenization",
          link: "https://new.dapp.ipci.io/#/tokenization",
          img: "assets/i/services/smart-assets.png",
          desc:
            "Сервис эмиссии углеродных единиц и зеленых сертификатов на основе данных от возобновляемого источника электроэнергии.",
          by: {
            link: "#",
            label: "DAO IPCI IoT connection"
          },
          disabled: false
        },
        {
          name: "Drone passport registration",
          link: "https://drone-employee.com/#/registration",
          img: "assets/i/services/drone-passport.png",
          desc: "Сервис глобальной регистрации дронов в Ethereum Blockchain.",
          by: {
            link: "#",
            label: "Distributed sky"
          },
          disabled: false
        },
        {
          name: "Drone flight report",
          link: "#",
          img: "assets/i/services/drone-route.png",
          desc: "Сервис публичных отчетов о выполненных полетах дронов.",
          by: {
            link: "#",
            label: "Distributed sky"
          },
          disabled: true
        }
      ]
    };
  }
};
</script>

<template>
    <footer>
        <div class="footer-section">
            <nav>
                <ul v-for="item in navigation" :key="item.title" :data-label="item.title">
                    <li v-for="link in item.links" :key="link.title">
                        <a :href="link.link" target="_blank">{{link.title}}</a>
                    </li>
                </ul>
            </nav>
            <robo-text size="small" weight="bold" align="center">
                <robo-grid id="footer-label" type="flex" gap="x05" valign="center">
                    <span>Secured by</span>
                    <img width="100" alt="Polkadot" src="/images/polkadot-new-dot-logo-horizontal.svg" />
                </robo-grid>
            </robo-text>
        </div>
        <robo-text v-if="repoversion" size="small" weight="bold" align="center" class="footer-section">
            Latest release:
            <a :href="repoversion.html_url" target="_blank">{{ repoversion.tag_name }} {{ repoversion.name }}</a>
        </robo-text>
    </footer>
</template>

<script setup>

import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
const store = useStore();

const network = computed(() => {
    return store.state.robonomicsUIvue?.polkadot?.connection?.network || "polkadot";
});

const navigation = [
{
    title: "Services",
    links: [
    {
        title: "Sensors map",
        link: "https://sensors.social",
    }
    ]
},

{
    title: "Tokenomics",
    links: [
    {
        title: "About XRT",
        link: "https://robonomics.network/xrt/",
    },
    {
        title: "Uniswap",
        link: "https://app.uniswap.org/#/swap?inputCurrency=0x7de91b204c1c737bcee6f000aaa6569cf7061cb7&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    },
    {
        title: "Basilisk",
        link: "https://app.basilisk.cloud/pools-and-farms",
    }
    ]
},

{
    title: "Tools",
    links: [
    {
        title: "Substrate Portal",
        link: "https://polkadot.js.org/apps/?rpc=wss%3A%2F%2F" + network.value + ".rpc.robonomics.network%2F#/explorer",
    },
    {
        title: "Subscan",
        link: "https://robonomics.subscan.io/",
    },
    {
        title: "Polkassembly",
        link: "https://robonomics.polkassembly.io/",
    }
    ]
},

{
    title: "Help",
    links: [
    {
        title: "GitHub",
        link: "https://github.com/airalab/robonomics.app",
    },
    {
        title: "Wiki",
        link: "https://wiki.robonomics.network/",
    },
    {
        title: "Academy",
        link: "https://robonomics.academy/",
    },
    {
        title: "Contacts",
        link: "https://robonomics.network/contact/",
    },
    {
        title: "Issues",
        link: "https://github.com/airalab/robonomics.app/issues",
    },
    ]
}
];

const repoversion = ref(null);

onMounted(async () => {
    try {
      const response = await fetch('https://api.github.com/repos/airalab/robonomics.app/releases/latest');
      const data = await response.json();
      repoversion.value = data;
    } catch (error) {
      repoversion.value = 'Ошибка загрузки';
      console.error('Ошибка получения версии:', error);
    }
});

</script>

<style scoped>
    .footer-section {
        border-top: 1px dotted var(--robo-color-text);
        padding-top: var(--robo-layout-padding);
        margin-top: var(--robo-layout-padding);
    }
    
    footer {
        margin-top: calc(var(--robo-space) * 5);
        padding: var(--robo-layout-padding);
    }

    footer nav {
        display: flex;
        gap: calc(var(--robo-layout-padding) * 2);
        justify-content: center;
    }

    footer nav ul:before {
        content: attr(data-label);
        display: block;
        font-weight: bold;
        margin-bottom: var(--robo-space);
    }

    @media screen and (width < 700px) {
        footer nav {
            font-size: 80%;
            gap: var(--robo-layout-padding);
        }
    }

    @media screen and (width < 500px) {
        footer nav {
            flex-direction: column;
        }
    }

    #footer-label {
        display: inline-flex;
        width: fit-content;
        padding-top: var(--robo-space);
        padding-bottom: var(--robo-space);
    }
</style>
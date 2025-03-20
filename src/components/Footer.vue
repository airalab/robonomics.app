<template>
    <footer>
      <nav>
        <ul v-for="item in navigation" :key="item.title" :data-label="item.title">
            <li v-for="link in item.links" :key="link.title">
                <a :href="link.link" target="_blank">{{link.title}}</a>
            </li>
        </ul>
      </nav>
    </footer>
</template>

<script setup>

const navigation = [
{
    title: "Services",
    links: [
    {
        title: "Sensors map",
        link: "https://sensors.robonomics.network",
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
        link: "https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama.rpc.robonomics.network%2F#/explorer",
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
    ]
}
];
</script>

<style scoped>
    footer {
        border-top: 1px dotted var(--robo-color-text);
        padding: var(--robo-layout-padding);
        margin-top: calc(var(--robo-space) * 5);
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
</style>
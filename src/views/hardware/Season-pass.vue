<template>
  <robo-layout-section>

    <robo-card allowExpand class="seasonpass">
        <robo-text title="3" offset="x0">Your season pass 2024-2025</robo-text>
        <div class="seasonpass-content">
            <div class="seasonpass-content-inside">
                <div class="seasonpass-msg" v-if="status !== 'START'">
                    <template v-if="status === 'NO_ETH_EXTENSION'">Connect or install Ethereum extension in your browser</template>
                    <template v-if="status === 'WRONG_ETH_NETWORK'">Please, switch to {{chains[workingchain].name}}</template>
                    <template v-if="status === 'NO_WALLET_PERMISSION'">Please, check permissions in the connected extension</template>
                    <template v-if="status === 'NO_ETH_ACCOUNT'">No Ethereum account found: check your extension</template>
                    <template v-if="status === 'NFT_NOT_FOUND' || status === 'TOKENS_NOT_FOUND'">No Season Pass NFT accosiated with this account</template>
                </div>
                <robo-loader v-if="status === 'NFT_STARTED_GETTING'" size="3" />

                <div class="tokens" :class="'tokens-show-' + curentslide" v-if="status === 'TOKENS_FOUND' && tokens">
                    <div class="token" v-for="token in tokens" :key="token.tokenId">
                        <img :src="`https://ipfs.io/ipfs/${token?.image}`" />
                        <robo-text lines="dotted" size="small">
                            <robo-grid type="flex" offset="x0" gap="x025" galign="start" valign="center">
                                {{token?.name}}
                            </robo-grid>
                            <robo-grid type="flex" offset="x0" gap="x025" galign="start" valign="center">
                                {{token?.tokenId}}
                            </robo-grid>
                            <robo-grid type="flex" offset="x0" gap="x025" galign="start" valign="center">
                                {{token?.status}}
                            </robo-grid>
                            <robo-grid type="flex" offset="x0" gap="x025" galign="start" valign="center">
                                <template v-if="token.activated">Activated</template>
                                <template v-else>Not activated</template>
                            </robo-grid>
                        </robo-text>
                        <robo-section offset="x1">
                            <robo-button v-if="token.tokenId && !token.activated" @click.prevent="activateToken(token.tokenId)" size="small">Activate</robo-button>
                        </robo-section>
                    </div>
                </div>
                <div class="tokens-switch" :class="'tokens-switch-showed-' + curentslide" v-if="status === 'TOKENS_FOUND'">
                    <robo-button v-for="(token, i) in tokens" :key="token.tokenId" clean @click.prevent="setslide(i + 1)">{{i + 1}}</robo-button>
                </div>
            </div>
            <div class="seasonpass-monkey" aria-hidden="true" v-if="status !== 'TOKENS_FOUND'">
                <img src="images/season-pass-24-25-monkey.webp" aria-hidden="true"/>
            </div>
        </div>
    </robo-card>

    <!-- <details>
        <summary>tech</summary>
        <div v-for="token in tokens" :key="token.tokenId">
            <img :src="`https://ipfs.io/ipfs/${token.image}`" style="width: 200px" />
            <p>{{token.name}}</p>
            <p>activated: {{token.activated}}, {{token.tokenId}}</p>
            <p>status: {{token?.status}}</p>
            <robo-button v-if="token.tokenId && !token.activated" @click.prevent="activateToken(token.tokenId)">Activate</robo-button>
        </div>

        {{account}}
        <hr/>
        {{provider?.info?.name}}
        <hr/>
        {{balance}}
        <hr/>
        {{status}}
    </details> -->

  </robo-layout-section>
</template>

<script setup>
import { reactive, computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
const store = useStore();

import nft_abi from "../../components/web3/abi/NFT.json";
import { ethers } from "ethers";
import { address } from "@/config";

import chains from "../../eth_chains";

/* + get providers */
import { createStore } from 'mipd';
const mipdstore = createStore();

const state = reactive({ 
    providers: mipdstore.getProviders()
});

mipdstore.subscribe(providers => {
    console.log('Providers updated:', providers);
    state.providers = providers;
});
/* - get providers */

const account = computed(() =>{
    return store.state.robonomicsUIvue.ethereum.activeAccount;
});

const provider = computed(() =>{
    return state.providers.find(i => i.info.rdns === store.state.robonomicsUIvue.ethereum.activeProviderRdns)
});

const isConnected = () => {
    if(provider?.value) {
        return provider.value?.provider?._state?.isConnected || provider.value?.provider?.isConnected
    } else {
        return false;
    }
}

const workingchain = 11155111;
const balance = ref(null);
const tokens = ref([]);
let signer;
let contract;
let providerethers = null;
const status = ref('START');
const curentslide = ref(1);

const setslide = (s) => {
    curentslide.value = s
}

const getEthersProviderObj = () => {
    try {
        providerethers = new ethers.BrowserProvider(provider.value.provider);
    } catch (error) { console.log(error); }
}

const getNFT = async (blockupdate = false) => {

    if(!blockupdate) {
        status.value = '';
        tokens.value = [];

        if(!provider.value || !isConnected()) {
            status.value = 'NO_ETH_EXTENSION';
            return;
        }
    }

    try {

        if(!blockupdate) {
            const perms = await provider.value.provider.request({method: 'wallet_getPermissions', params: [{ eth_accounts: {} }]});
            if(!perms || !perms.some(i => i.parentCapability === 'eth_accounts')) {
                status.value = 'NO_WALLET_PERMISSION';
                return;
            }

            const accounts = await provider.value.provider.request({method: 'eth_requestAccounts', params: [{ eth_accounts: {} }]});
            if(!accounts || accounts?.length < 1) {
                status.value = 'NO_ETH_ACCOUNT';
                return;
            }
            
            const chain = await provider.value.provider.request({method: 'eth_chainId', params: [{ eth_accounts: {} }]});
            if(parseInt(chain) !== workingchain) {
                status.value = 'WRONG_ETH_NETWORK';
                return;
            }

            status.value = 'NFT_STARTED_GETTING';

            getEthersProviderObj();
            signer = await providerethers.getSigner();
            contract = new ethers.Contract(address.nft, nft_abi, signer);
        }

        contract.balanceOf(signer.address)
            .then(async (r) => {
                if(blockupdate) {
                    if(balance.value === parseFloat(r)){
                        return;
                    }
                }
                balance.value = parseFloat(r);

                if(!balance.value || balance.value < 1) {
                    status.value = 'NFT_NOT_FOUND';
                } else {
                    await loadTokens();
                }

            })
            .catch((e) => {
                console.log(e);
            });
    } catch (error) {
        status.value = 'NFT_NOT_FOUND';
        console.log(error);
    }
}

const loadTokens = async () => {

    const ids = [];
    for (let index = 0; index < balance.value; index++) {
        try {
            const tokenId = await contract.tokenOfOwnerByIndex(
                signer.address,
                index
            );

            const uri = await contract.tokenURI(tokenId);
            const ipfsHash = uri.split("ipfs://").pop();
            const data = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
            const res = await data.json();

            ids.push({
                activated: await contract.activatedOf(tokenId),
                tokenId: tokenId.toString(),
                name: `${res.name} #${tokenId.toString()}`,
                image: res.image.split("ipfs://").pop(),
                status: 'INIT'
            });
        } catch (error) {
            console.log(error);
        }
    }

    tokens.value = ids;

    if(tokens.value?.length > 0) {
        status.value = 'TOKENS_FOUND';
    } else {
        status.value = 'TOKENS_NOT_FOUND';
    }
}

const activateToken = async (tokenId) => {
    let current = 0;

    if(tokens.value) {
        current = tokens.value.findIndex(i => i.tokenId === tokenId);
    }

    try {
        tokens.value[current].status = 'ACTIVATION_STARTED';

        const tx = await contract.connect(signer).activate(tokenId);
        console.log('tx', tx);
        await loadTokens(); // for updating status
        tokens.value[current].status = 'ACTIVATION_ENDED';
    } catch (error) {
        console.error(error);

        if(error.code === "ACTION_REJECTED") {
            tokens.value[current].status = 'ACTIVATION_REJECTED';
        } else {
            tokens.value[current].status = 'ACTIVATION_NOT_SUCCESSFULL';
        }
    }
}


watch([provider, account], async() => {
    balance.value = null;
    await getNFT();
});

onMounted( async () => {

    // const b = await providerethers.getBalance(account.value)
    // console.log('getBalance', ethers.formatEther(b))
    await getNFT();

    if(providerethers) {
        providerethers.on('block', async () => {
            await getNFT(true);
        });
    }
})

</script>

<style>
    .seasonpass .robo-card-content {
        display: grid;
        grid-template-rows: calc(var(--robo-space) * 4) auto;
        gap: calc(var(--robo-space) * 2);
        align-items: stretch;
    }
</style>

<style scoped>
    .seasonpass {
        position: relative;
        min-height: 600px;
    }

    .seasonpass:not(.expand) {
        max-width: 700px;
        margin: 0 auto;
    }

    .seasonpass-monkey {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        opacity: 0;
        visibility: hidden;
        animation: flick 2s linear 0.3s forwards;
        z-index: 0;
    }

    @keyframes flick {
        10% {
            opacity: 0;
            visibility: hidden;
        }
        20% {
            opacity: 1;
            visibility: visible;
        }
        30% {
            opacity: 0;
            visibility: hidden;
        }
        40% {
            opacity: 1;
            visibility: visible;
        }
        50% {
            opacity: 0;
            visibility: hidden;
        }
        60% {
            opacity: 1;
            visibility: visible;
        }
        100% {
            opacity: 1;
            visibility: visible;
        }
    }

    .seasonpass-monkey img {
        display: inline-block;
        max-height: 600px;
        opacity: 0.5;
    }

    @media (prefers-color-scheme: dark){
        .seasonpass-monkey img {
            opacity: 0.2;
        }
    }

    .seasonpass-msg {
        font-weight: bold;
        text-align: center;
        max-width: 500px;
    }

    .seasonpass-content {
        justify-self: center;
        align-content: center;
        min-height: calc(600px - calc(var(--robo-space) * 4));
    }

    .seasonpass-content-inside {
        position: relative;
        z-index: 1;
    }

    .tokens .token {
        display: none;
    }

    .tokens-show-1 .token:nth-child(1),
    .tokens-show-2 .token:nth-child(2),
    .tokens-show-3 .token:nth-child(3),
    .tokens-show-4 .token:nth-child(4),
    .tokens-show-5 .token:nth-child(5),
    .tokens-show-6 .token:nth-child(6) {
        display: block;
    }

    .tokens-switch-showed-1 .robo-button:nth-child(1),
    .tokens-switch-showed-2 .robo-button:nth-child(2),
    .tokens-switch-showed-3 .robo-button:nth-child(3),
    .tokens-switch-showed-4 .robo-button:nth-child(4),
    .tokens-switch-showed-5 .robo-button:nth-child(5),
    .tokens-switch-showed-6 .robo-button:nth-child(6) {
        opacity: 0.5;
    }

    .token img {
        display: block;
        max-width: 80%;
        margin: var(--robo-space) auto;
    }

    .tokens-switch {
        margin-top: calc(var(--robo-space) * 2);
    }
</style>

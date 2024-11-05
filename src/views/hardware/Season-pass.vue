<template>
  <robo-layout-section>
    <robo-text title="1">Season pass</robo-text>

    {{account}}
    <hr/>
    {{provider?.info?.name}}
    <hr/>
    {{balance}}
    <hr/>
    {{tokens}}

  </robo-layout-section>
</template>

<script setup>
import { reactive, computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
const store = useStore();

import nft_abi from "../../components/web3/abi/NFT.json";
import { ethers } from "ethers";
import { address } from "@/config";

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

/* + Get NFT */
const balance = ref(null);
const tokens = ref([]);
let signer;
let contract;
let providerethers = new ethers.BrowserProvider(provider.value.provider);

const getNFT = async (blockupdate = false) => {

    if(!blockupdate) { 
        tokens.value = [];
    }

    if(provider.value){
        providerethers = new ethers.BrowserProvider(provider.value.provider);
        signer = await providerethers.getSigner();
        contract = new ethers.Contract(address.nft, nft_abi, signer);

        contract.balanceOf(signer.address)
            .then(async (r) => {
                if(blockupdate) {
                    if(balance.value === parseFloat(r)){
                        return;
                    }
                }
                balance.value = parseFloat(r);
                await loadTokens();
            })
            .catch((e) => { console.log(e) })
    }
}

const loadTokens = async () => {

    if (!balance.value) {
        return;
    }

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
                image: res.image.split("ipfs://").pop()
            });
        } catch (error) { console.log(error); }
    }

    tokens.value = ids;
}
/* - Get NFT */

watch([provider, account], async() => {
    await getNFT();
});

onMounted( async () => {

    // const b = await providerethers.getBalance(account.value)
    // console.log('getBalance', ethers.formatEther(b))
    await getNFT();

    providerethers.on('block', async () => {
        await getNFT(true);
    });
})

</script>

const chains = {
  1: {
    ROBONOMICS: {
      ens: "",
      ensSuffix: "eth",
      lighthouse: null // 'chainm.lighthouse.5.robonomics.eth'
    },
    TOKEN: {
      air: {
        address: "0xA2f4FCb0FDe2dD59f7a1873e121bc5623e3164Eb",
        decimals: 0,
        label: "AIRA"
      },
      airkyc: {
        address: "0x2a3A07d241eda9d573A6b666E9Fc359666cf7b39",
        decimals: 0,
        label: "AIRA ID"
      },
      xrt: {
        address: "0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7",
        decimals: 9,
        label: "XRT"
      },
      dai: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        decimals: 18,
        label: "DAI"
      }
    },
    DEFAULT_LIGHTHOUSE: "airalab"
  },
  4451: {
    ROBONOMICS: {
      ens: "0xaC4Ac4801b50b74aa3222B5Ba282FF54407B3941",
      ensSuffix: "sid",
      lighthouse: null // 'airalab.lighthouse.5.robonomics.sid'
    },
    TOKEN: {
      xrt: {
        address: "0x966EbbFD7ECbCF44b1e05341976e0652CFA01360",
        decimals: 9,
        label: "XRT"
      },
      dai: {
        address: "0x966EbbFD7ECbCF44b1e05341976e0652CFA01360",
        decimals: 9,
        label: "XRT"
      }
    },
    DEFAULT_LIGHTHOUSE: "airalab"
  }
};

let currentChain;
function set(id) {
  currentChain = id;
}
function get() {
  if (currentChain) {
    return chains[currentChain];
  }
  throw new Error("Chain not selected");
}
function getListId() {
  return Object.keys(chains);
}
export default {
  set,
  get,
  getListId
};

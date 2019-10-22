const chains = {
  1: {
    STATISTICS_API: 'https://devjs-01.corp.aira.life:3004',
    TOKEN: {
      air: {
        address: '0xA2f4FCb0FDe2dD59f7a1873e121bc5623e3164Eb',
        decimals: 0,
        label: 'AIRA'
      },
      airkyc: {
        address: '0x2a3A07d241eda9d573A6b666E9Fc359666cf7b39',
        decimals: 0,
        label: 'AIRA ID'
      },
      xrt: {
        address: '0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7',
        decimals: 9,
        label: 'XRT'
      }
    },
    ROBONOMICS: {
      ens: '',
      ensSuffix: 'eth'
    }
  },
  4451: {
    STATISTICS_API: 'https://devjs-01.corp.aira.life:3007',
    TOKEN: {
      xrt: {
        address: '0x966EbbFD7ECbCF44b1e05341976e0652CFA01360',
        decimals: 9,
        label: 'XRT'
      }
    },
    ROBONOMICS: {
      ens: '0xaC4Ac4801b50b74aa3222B5Ba282FF54407B3941',
      ensSuffix: 'sid'
    }
  },
  4: {
    STATISTICS_API: 'https://devjs-01.corp.aira.life:3007',
    TOKEN: {
      xrt: {
        address: '0x8a978C2eD9313091eE88E4c29527A4fA0EcEbDbe',
        decimals: 9,
        label: 'XRT'
      }
    },
    ROBONOMICS: {
      ens: '0x9D70a7ecf0834ca14969f676e54834F12eaE5E10',
      ensSuffix: 'eth'
    }
  }
};

export default networkId => {
  return chains[networkId];
};

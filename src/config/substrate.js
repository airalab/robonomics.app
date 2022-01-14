export default {
  robonomics: {
    name: "robonomics",
    endpoint: "wss://kusama.rpc.robonomics.network/",
    api: {
      types: {
        Record: "Vec<u8>",
        RingBufferIndex: { start: "Compact<u64>", end: "Compact<u64>" },
        RingBufferItem: "(Compact<Moment>,Record)",
        // Parameter: "bool",
        LaunchParameter: "bool",
        // UnlockChunk: {
        //   value: "Compact<Balance>",
        //   moment: "Compact<Moment>"
        // },
        StakerLedger: {
          stash: "AccountId",
          total: "Compact<Balance>",
          active: "Compact<Balance>",
          unlocking: "Vec<UnlockChunk<Balance, BlockNumber>>",
          claimed_rewards: "BlockNumber"
        }
        // Subscription: {
        //   _enum: {
        //     Lifetime: {
        //       tps: "Compact<u32>"
        //     },
        //     Daily: {
        //       days: "Compact<u32>"
        //     }
        //   }
        // },
        // SubscriptionLedger: {
        //   free_weight: "Compact<Weight>",
        //   issue_time: "Compact<Moment>",
        //   last_update: "Compact<Moment>",
        //   kind: "Subscription"
        // },
        // AuctionLedger: {
        //   winner: "Option<AccountId>",
        //   best_price: "Compact<Balance>",
        //   kind: "Subscription"
        // }
      }
    }
  },
  ipci: {
    name: "ipci",
    endpoint: "wss://ipci.rpc.robonomics.network",
    api: {
      types: {
        EverUSDBalance: "u64",
        BondPeriod: "u64",
        Record: "Vec<u8>",
        RingBufferIndex: { start: "Compact<u64>", end: "Compact<u64>" },
        RingBufferItem: "(Compact<Moment>,Record)",
        Parameter: "bool",
        LaunchParameter: "bool"
      }
    }
  }
};

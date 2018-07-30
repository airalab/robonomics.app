import Robonomics from 'robonomics-js';
import Provider from './provider';

let robonomics = null;
const getRobonomics = () => {
  if (robonomics === null) {
    const socket = io('https://wss.pool.aira.life');
    robonomics = new Robonomics({
      web3,
      provider: new Provider(socket),
    });
  }
  return robonomics;
};

export default getRobonomics;

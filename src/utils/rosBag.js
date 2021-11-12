import { open } from "rosbag";
import Bag, { Time, messages } from "rosbag-write";
import axios from "axios";
import { tools } from "./ipfs";
import config from "../config";

export default function rosBag(data, cb, options = {}) {
  return open(data).then((bag) => {
    return bag.readMessages(options, (result) => {
      cb(result);
    });
  });
}

export async function getRosbag(data) {
  const bag = new Bag();
  await messages.init();
  const Message = await messages.getMessage("std_msgs/String");
  const time = Time.fromSecs(1.1);
  Object.keys(data).forEach((topic) => {
    if (typeof data[topic] === "number" || typeof data[topic] === "string") {
      bag.write("/" + topic, new Message({ data: data[topic] }), time);
      time.nsec += 100000000;
    } else {
      data[topic].forEach((item) => {
        bag.write("/" + topic, new Message({ data: item }), time);
        time.nsec += 100000000;
      });
    }
  });
  bag.close();
  return bag.file.getBuffer();
}

export async function genRosbagIpfs(data) {
  const bag = await getRosbag(data);
  const hash = (await tools.add(bag)).toString();
  await axios.get(`${config.IPFS_GATEWAY}${hash}`);
  return hash;
}

export async function readRosbagIpfs(hash, cb, topics = {}) {
  const r = await tools.cat(hash);
  return rosBag(new Blob([r]), cb, topics);
}

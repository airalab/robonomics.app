import { open } from 'rosbag'

export default (data, cb, options = {}) => {
  return open(data)
    .then((bag) => {
      return bag.readMessages(options, (result) => {
        cb(result)
      })
    })
}

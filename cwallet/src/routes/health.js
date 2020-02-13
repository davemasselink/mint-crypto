import path from 'path'
import * as fs from 'fs'
import * as os from 'os'

const buildInfo = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', '/appBuildInfo.json'))
)

const serverIps = (() => {
  const ifaces = Object.values(os.networkInterfaces()) // array of arrays of interfaces
  const reducer = (ips, iface) =>
    iface.family === 'IPv4' && iface.internal === false ? `${ips}${iface.address}; ` : ips
  return ifaces.reduce((ips, iface) => ips + iface.reduce(reducer, ''), '')
})()

export const full = (req, res) => res.status(200).send('Health Check Ok')
export const version = (req, res) =>
  res.status(200).send(`
<pre>
  Current Time: ${new Date()}
  Environment: ${process.env.APP_ENV}
  Node Env: ${process.env.NODE_ENV}
  Server IP Addresses: ${serverIps}
  Build Number: ${buildInfo.number}
  Timestamp: ${buildInfo.timestamp}
  Git Branch: ${buildInfo.gitBranch}
  Git Commit: ${buildInfo.gitCommit}
  Docker Tag: ${buildInfo.dockerTag}
</pre>
`)

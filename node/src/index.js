const WebSocket = require('ws')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const dataSource = require('./data.json') // 用户好友列表
const app = express()
app.use(cors({ credentials: true, origin: true }))
app.use(bodyParser.json())

const SERVER_PORT = {} // 用户对应 ws 实例
let SERVER_SHOT = [] // 开启的 ws 快照
const TEMPORARY = {} // 临时消息存储

/* 防止同一端口多用 */
const getPort = () => {
  const port = 8000 + Math.floor((Math.random() * 100 - 1))
  return SERVER_SHOT.find(val => val.port === port) ? getPort() : port
}

const updateShot = () => {
  SERVER_SHOT = Object.entries(SERVER_PORT).map(([userId, ws]) => ({userId, port: ws.port}))
  console.log('==> SERVER_SHOT', SERVER_SHOT)
}

app.get('/userList', function (req, res) {
  const {userId} = req.query
  console.log('==> userList', userId, dataSource[userId])
  res.send(dataSource[userId])
})

app.get('/port', function (req, res) {
  const {userId} = req.query
  let port
  if (!SERVER_PORT.hasOwnProperty(userId)) {
    port = getPort()
    const server = new WebSocket.Server({port})
    server.on('connection', function connection(ws) {
      ws.port = port
      SERVER_PORT[userId] = ws
      updateShot()
      /* 发送全部暂存消息 */
      const records = TEMPORARY[userId]
      if (records) {
        for (const item of records) {
          ws.send(JSON.stringify(item))
        }
        delete TEMPORARY[userId]
      }
      ws.on('close', function connection(ws) {
        console.log(`userId: ${userId} port: ${port} is closed`)
        delete SERVER_PORT[userId]
        updateShot()
      })
    })
  } else {
    port = SERVER_PORT[userId].port
  }
  res.send({port})
})

app.post('/send', function (req, res) {
  const {content, targetId, userId} = req.body
  const server = SERVER_PORT[targetId]
  console.log('==> TEMPORARY', TEMPORARY)
  if (!server) {
    const records = TEMPORARY[targetId] || []
    records.push(req.body)
    TEMPORARY[targetId] = records
    res.send({message: 'temporary'})
    return
  }
  server.send(JSON.stringify(req.body))
  res.send({message: 'success'})
})

app.listen(3000, () => console.log('==> server listen 3000'))

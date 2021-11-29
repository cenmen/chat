const WebSocket = require('ws')
const express = require('express')
const cors = require('cors')
const dataSource = require('./data.json')
const app = express()
app.use(cors({ credentials: true, origin: true }))

app.get('/userList', function (req, res) {
  const {userId} = req.query
  console.log('==> userList', userId, dataSource[userId])
  res.send(dataSource[userId])
})


const server = new WebSocket.Server({ port: 8080 })

server.on('open', function open() {
  console.log('connected')
})

server.on('close', function close() {
  console.log('disconnected')
})

server.on('connection', function connection(ws, request, client) {
  ws.on('message', function message(data, isBinary) {
    const {targetId, userId, content} = JSON.parse(data)
    if (!targetId && !content && userId) ws.userId = userId
    console.log(`Received message ${data} from user ${userId}`)
    server.clients.forEach(function each(client) {
      //  && client.userId === targetId
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary })
      }
    })
  })
})

app.listen(3000, () => console.log('==> server listen 3000'))

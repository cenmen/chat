/* 本地区分缓存 */
const STORAGE_KEY = `CHAT_${USER_ID}` 
let currentUserId = null, socket = null

async function initUserList() {
  const data = await request({
    url: `${BASE_URL}/userList`,
    data: {
      userId: USER_ID
    }
  })
  const html = data.map(item => `<div data-target-id=${item.id} class='user-item' onclick="onChangeTargetUser(event)">${item.name}</div>`).join('')
  document.querySelector('.sider').innerHTML = html
}

async function openWebSocket() {
  const data = await request({
    url: `${BASE_URL}/port`,
    data: {
      userId: USER_ID
    }
  })
  socket = new Socket({
    userId: USER_ID,
    location: `ws://localhost:${data.port}/ws`,
    onmessage: (e) => render(JSON.parse(e.data), false),
    onopen: (e) => console.log('==> onopen', e),
    onclose: (e) => console.log('==> onclose', e),
  })
}

function render(data, self, save = true) {
  const {content, targetId, userId, timestamp} = data
  const className = userId === USER_ID ? 'right-bubble' : 'left-bubble'
  const bubble = document.createElement('div')
  bubble.classList.add(className)
  bubble.innerText = `${content}\n${format(timestamp)}`
  document.querySelector('.history').appendChild(bubble)
  if (save) {
    /* 更新离线消息存储 */
    const room = self ? targetId : userId
    let history = localStorage.getItem(STORAGE_KEY) || '{}'
    history = JSON.parse(history)
    const value = (history[room] || [])
    value.push(data)
    history[room] = value
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  }
}

function submit() {
  const val = document.querySelector('.textarea').value
  const data = {
    content: val,
    targetId: currentUserId,
    userId: USER_ID,
    timestamp: Date.now()
  }
  render(data, true)
  request({
    method: 'POST',
    url: `${BASE_URL}/send`,
    data
  })
}

function onChangeTargetUser(e) {
  const targetId = e.target.dataset.targetId
  if (targetId === currentUserId) return
  currentUserId = targetId
  /* 取本地缓存渲染历史消息 */
  const history = (localStorage.getItem(STORAGE_KEY)) || '{}'
  const list = JSON.parse(history)[targetId]
  document.querySelector('.history').innerHTML = ''
  if (list) {
    list.forEach(item => render(item, false, false))
  }
}

function format(timestamp) {
  const add0 = m => m < 10 ? '0' + m : m 
  var time = new Date(timestamp)
  var y = time.getFullYear()
  var m = time.getMonth()+1
  var d = time.getDate()
  var h = time.getHours()
  var mm = time.getMinutes()
  var s = time.getSeconds()
  return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s)
}

window.onload = () => {
  initUserList()
  openWebSocket()
}
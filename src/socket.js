function Socket({location, onmessage: handleMessage, onopen: handleOpen, onclose: handleClose, userId}) {
  let socket
  if (!window.WebSocket) {
    window.WebSocket = window.MozWebSocket
  }
  if (window.WebSocket) {
    socket = new WebSocket(location)
    if (handleOpen) socket.onopen = (e) => handleOpen(e)
    if (handleMessage) socket.onmessage = (e) => handleMessage(e)
    if (handleClose) socket.onclose = (e) => handleClose(e)
  } else {
    console.warn("your browser is not support websocket!")
  }

  function send(message) {
    if (!window.WebSocket) {
      return
    }
    if (socket.readyState == WebSocket.OPEN) {
      socket.send(message)
    } else {
      console.warn("connetion is closed")
    }
  }

  function close(code, reason) {
    socket.close(code, reason)
  }

  return {
    send,
    close
  }
}
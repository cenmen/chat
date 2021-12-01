/* 不做特性检测与兼容 IE不可用 */
function request({url, data, method = 'GET', ...options}) {
  const params = {
    method,
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  }
  if (method === 'GET') {
    url = buildUrl(url, data)
  } else if (method === 'POST') {
    params.body = JSON.stringify(data)
  }
  return fetch(url, params).then(data => data.json())
}

function buildUrl(url, data) {
  if (!data || JSON.stringify(data) === '{}') return url
  url = url + '?'
  const params = Object.entries(data)
  params.forEach(([key, val], index) => {
    url = url + `${key}=${val}`
    if (index !== params.length - 1) url = url + '&'
  })
  return url
}
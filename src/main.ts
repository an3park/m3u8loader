import './main.scss'
import { download, playMedia, saveBlob } from './api'
import { parsem3u8 } from './playlistParser'

const progressDiv = document.querySelector<HTMLDivElement>('.progress')!

function savem3u8(uri: string) {
  const chunks: Uint8Array[] = []
  let mimeType = ''
  let duration = 0
  return download(uri)
    .on('meta', (_mimeType, _duration) => {
      mimeType = _mimeType
      duration = _duration
      console.log(_mimeType, _duration)
    })
    .on('chunk', (data, endDTS) => {
      const progress = (endDTS / duration) * 100
      progressDiv.style.width = progress + '%'
      chunks.push(data)
    })
    .on('done', () => {
      progressDiv.style.width = '0'
      saveBlob(chunks, uri.replace(/[^\w\.]/gi, '') + '.mp4', mimeType)
    })
}

const getbtn = document.querySelector<HTMLButtonElement>('.getsource')!
const playbtn = document.querySelector<HTMLButtonElement>('.playmedia')!
const parsebtn = document.querySelector<HTMLButtonElement>('.parseplaylist')!
const inputURI = document.querySelector<HTMLDivElement>('.inputm3u8')!
const videotag = document.querySelector<HTMLMediaElement>('video')!

const searchparam = new URLSearchParams(location.search).get('q')

inputURI.innerText = searchparam || '/index.m3u8'

getbtn.onclick = () => {
  savem3u8(inputURI.innerText)
}
playbtn.onclick = () => {
  playMedia(videotag, inputURI.innerText)
}
parsebtn.onclick = () => {
  fetch(inputURI.innerText)
    .then((r) => r.text())
    .then(parsem3u8)
    .then((playlistData) => {
      const res = JSON.stringify(
        playlistData,
        (key, value) => {
          if (key === 'uri' && typeof value === 'string') {
            const match = inputURI.innerText.match(/.*\//i)
            const v = !match || value.startsWith('http') ? value : match[0] + value
            return `<a href=${v}>${v}</a>`
          }
          return value
        },
        2
      )
      const pre = document.querySelector<HTMLPreElement>('pre.parse-result')!
      pre.innerHTML = res
      pre.querySelectorAll('a').forEach((a) => {
        a.onclick = (event) => {
          event.preventDefault()
          inputURI.innerText = a.href
        }
      })
    })
}

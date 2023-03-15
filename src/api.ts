import { mediaElementsStore, MediaEmitter } from './interceptor'
import { parsem3u8 } from './playlistParser'

import type HlsType from 'hls.js'

// Hls must be installed globaly
let hls: HlsType
const install = async () => {
  const hlslib = await fetch('/hls.min.js').then((r) => r.text())
  eval.call(window, hlslib)
  hls = new Hls()
  if (!Hls.isSupported()) {
    throw new Error('Hls not supported')
  }
}
install()

export function download(uri: string): MediaEmitter<HTMLMediaElement> {
  const mediaElement: HTMLMediaElement = document.createElement('video')

  mediaElement.muted = true
  const mediaEmitter = new MediaEmitter<HTMLMediaElement>(mediaElement)
  mediaElementsStore.add(mediaEmitter)
  hls.attachMedia(mediaElement)
  hls.on(Hls.Events.MEDIA_ATTACHED, function () {
    hls.loadSource(uri)
    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
      console.log('manifest loaded, found ' + data.levels.length + ' quality level')
    })
  })
  return mediaEmitter
}

export function playMedia(tag: HTMLMediaElement, uri: string) {
  hls.attachMedia(tag)
  hls.on(Hls.Events.MEDIA_ATTACHED, function () {
    hls.loadSource(uri)
    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
      console.log('manifest loaded, found ' + data.levels.length + ' quality level')
      tag.play()
    })
  })
}

export function saveBlob(chunks: Array<Uint8Array>, fileName: string, mime: string): void {
  const blob = new Blob(chunks, { type: mime })

  const objurl = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.download = fileName
  a.href = objurl
  a.click()

  URL.revokeObjectURL(objurl)
}

// mounting api to window
interface Im3u8api {
  parse: typeof parsem3u8
  download: typeof download
  play: typeof playMedia
}

interface Iapi {
  m3u8: Im3u8api
  saveBlob: typeof saveBlob
}

declare global {
  interface Window {
    api: Iapi
  }
}

function mountApiToWindow(): void {
  const m3u8 = {
    parse: parsem3u8,
    download,
    play: playMedia,
  }
  const api = {
    m3u8,
    saveBlob,
  }
  window.api = api
}
mountApiToWindow()

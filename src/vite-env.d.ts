/// <reference types="vite/client" />

import type hlsType from 'hls.js'

declare global {
  var Hls = hlsType
}

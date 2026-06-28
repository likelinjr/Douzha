import { ProxyAgent, setGlobalDispatcher } from 'undici'

let initialized = false
export function initProxy() {
  if (initialized) return
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  if (proxyUrl) {
    setGlobalDispatcher(new ProxyAgent(proxyUrl))
    initialized = true
  }
}

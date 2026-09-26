import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import type { IncomingMessage } from 'node:http'

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD') {
    return undefined
  }

  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/**
 * Dev proxy: /green-api-proxy/<path> → <X-Green-Api-Url>/<path>
 * Header X-Green-Api-Url carries the cabinet apiUrl host.
 */
function greenApiProxy(): Plugin {
  return {
    name: 'green-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/green-api-proxy')) {
          next()
          return
        }

        try {
          const apiUrl = req.headers['x-green-api-url']
          if (typeof apiUrl !== 'string' || !apiUrl) {
            res.statusCode = 400
            res.end('Missing X-Green-Api-Url header')
            return
          }

          const base = apiUrl.replace(/\/$/, '')
          const pathWithQuery = req.url.replace(/^\/green-api-proxy/, '') || '/'
          const targetUrl = `${base}${pathWithQuery}`
          const method = (req.method ?? 'GET').toUpperCase()
          const body = await readBody(req)

          const upstream = await fetch(targetUrl, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
          })

          res.statusCode = upstream.status
          const contentType = upstream.headers.get('content-type')
          if (contentType) {
            res.setHeader('Content-Type', contentType)
          }

          res.end(Buffer.from(await upstream.arrayBuffer()))
        } catch (error) {
          res.statusCode = 502
          res.end(error instanceof Error ? error.message : 'Proxy error')
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), greenApiProxy()],
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
})

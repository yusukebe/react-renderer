import type { Context, Env, MiddlewareHandler } from 'hono'
import React from 'react'
import { renderToString, renderToReadableStream } from 'react-dom/server'

export interface Props {}

declare module 'hono' {
  interface ContextRenderer {
    (children: React.ReactElement, props?: Props): Response | Promise<Response>
  }
}

type RendererOptions = {
  stream?: boolean | Record<string, string>
}

type BaseProps = {
  c: Context
  children: React.ReactElement
}

const RequestContext = React.createContext<Context | null>(null)

const createRenderer =
  (c: Context, component: React.FC<Props & BaseProps>, options?: RendererOptions) =>
  async (children: React.ReactElement, props?: Props) => {
    // @ts-ignore
    const node = component({ children, c, ...props })
    if (options?.stream) {
      const stream = await renderToReadableStream(React.createElement(RequestContext.Provider, { value: c }, node))
      return c.body(stream, {
        headers:
          options.stream === true
            ? {
                'Transfer-Encoding': 'chunked',
                'Content-Type': 'text/html; charset=UTF-8'
              }
            : options.stream
      })
    } else {
      const body = renderToString(React.createElement(RequestContext.Provider, { value: c }, node))
      return c.html(body)
    }
  }

export const reactRenderer = (component: React.FC<Props & BaseProps>, options?: RendererOptions): MiddlewareHandler =>
  function reactRenderer(c, next) {
    c.setRenderer(createRenderer(c, component, options))
    return next()
  }

export const useRequestContext = <E extends Env = any>(): Context<E> => {
  const c = React.useContext(RequestContext)
  if (!c) {
    throw new Error('RequestContext is not provided.')
  }
  return c
}

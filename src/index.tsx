import { Hono } from 'hono'
import { reactRenderer } from './react-renderer'
import { Suspense, use } from 'react'

declare module './react-renderer' {
  interface Props {
    title: string
  }
}

const app = new Hono()

app.get(
  '*',
  reactRenderer(
    ({ children, title }) => {
      return (
        <html>
          <head>
            <title>{title}</title>
          </head>
          {children}
        </html>
      )
    },
    {
      stream: true
    }
  )
)

const Component: React.FC = () => {
  use(new Promise((r) => setTimeout(r, 2000)))
  return <h1>Hello World!</h1>
}

app.get('/', (c) => {
  return c.render(
    <div>
      <Suspense fallback="loading...">
        <Component />
      </Suspense>
    </div>,
    {
      title: 'React Renderer'
    }
  )
})

export default app

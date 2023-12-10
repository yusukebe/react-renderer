import { Hono } from 'hono'
import { reactRenderer } from './react-renderer'
import { Suspense, use } from 'react'

const app = new Hono()

app.get(
  '*',
  reactRenderer(
    ({ children }) => {
      return (
        <html>
          <body>{children}</body>
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
    <Suspense fallback="loading...">
      <Component />
    </Suspense>
  )
})

export default app

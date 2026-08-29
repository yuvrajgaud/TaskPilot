import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'

export function NotFound() {
  return (
    <Panel className="px-6 py-16 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-2 text-2xl">This page isn't on the map</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm">
        The link may be out of date, or the page may have moved.
      </p>
      <Link to="/" className="mt-6 inline-block">
        <Button size="sm">Back to dashboard</Button>
      </Link>
    </Panel>
  )
}

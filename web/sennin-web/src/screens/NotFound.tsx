import { Shell } from '../app/Shell'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { useCopy } from '../copy/copy'
import { navigate } from '../lib/router'

export function NotFound() {
  const copy = useCopy().states.notFound
  return (
    <Shell title={copy.title}>
      <div className="px-4 md:px-0">
        <EmptyState
          icon="empty"
          title={copy.title}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                navigate('/')
              }}
            >
              {copy.action}
            </Button>
          }
        >
          {copy.body}
        </EmptyState>
      </div>
    </Shell>
  )
}

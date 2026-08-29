import { cn } from '../../lib/cn'

/** The one surface in the product. Everything sits on a Panel. */
export function Panel({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        'rounded-panel border border-rule bg-surface',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** Section heading with the monospace panel-legend eyebrow above it. */
export function PanelHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="text-lg">{title}</h2>
      </div>
      {action}
    </div>
  )
}

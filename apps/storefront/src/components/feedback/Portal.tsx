import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

// Renders straight into <body>, outside any ancestor that might carry a CSS
// transform (page-transition animations, hover-lift cards, etc). A `position:
// fixed` element only escapes to the real viewport when none of its ancestors
// have a transform/filter/perspective applied — otherwise the nearest such
// ancestor silently becomes its containing block instead. Modals/dialogs are
// exactly the elements that get bitten by this, so they always portal out.
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}

interface ActionButtonProps {
  onClick: () => void
  children: React.ReactNode
}

export function EditAction({ onClick, children }: ActionButtonProps) {
  return (
    <button className="admin-action admin-action--edit" onClick={onClick}>
      {children}
    </button>
  )
}

export function DeleteAction({ onClick, children }: ActionButtonProps) {
  return (
    <button className="admin-action admin-action--delete" onClick={onClick}>
      {children}
    </button>
  )
}

export function PrimaryButton({ onClick, children }: ActionButtonProps) {
  return (
    <button className="admin-btn admin-btn--primary" onClick={onClick}>
      {children}
    </button>
  )
}

export function CancelButton({ onClick, children }: ActionButtonProps) {
  return (
    <button className="admin-btn admin-btn--cancel" onClick={onClick}>
      {children}
    </button>
  )
}

export function AddButton({ onClick, children }: ActionButtonProps) {
  return (
    <button className="admin-btn admin-btn--add" onClick={onClick}>
      {children}
    </button>
  )
}

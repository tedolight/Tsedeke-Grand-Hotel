import Modal from './Modal'

/**
 * ConfirmDialog — wraps Modal for destructive action confirmation.
 * Props: open, onClose, onConfirm, title, message, confirmLabel, danger
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title      = 'Are you sure?',
  message    = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  danger     = true,
}) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="font-body text-[0.9rem] text-[#5a4f44] mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="font-body font-semibold text-[0.85rem] px-5 py-[0.65rem] rounded-[2px] border border-basalt/20 text-basalt hover:border-brass transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={`font-body font-semibold text-[0.85rem] px-5 py-[0.65rem] rounded-[2px] transition-all hover:-translate-y-[1px]
            ${danger
              ? 'bg-crimson text-bone-soft hover:bg-crimson-light'
              : 'bg-basalt text-bone-soft hover:bg-basalt/80'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

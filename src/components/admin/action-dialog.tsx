import { useEffect, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export type ExtraField = {
  key: string
  label: string
  placeholder?: string
  required?: boolean
}

export type ActionDialogConfig = {
  /** Dialog heading, e.g. "Suspend seller". */
  title: string
  /** Confirmation sentence — spec requires naming the record and any amount. */
  description: string
  confirmLabel: string
  /** Destructive styling + stronger copy for suspend/reject/cancel actions. */
  destructive?: boolean
  /** Preset reasons; admin can still add a note. Presence makes reason mandatory. */
  reasons?: string[]
  reasonLabel?: string
  /** Free-text note only, no preset list. */
  noteOnly?: boolean
  requireNote?: boolean
  extraFields?: ExtraField[]
  /** Message shown in the success toast. */
  successMessage?: string
}

/**
 * Every sensitive admin action funnels through this dialog so the audit trail
 * always has an actor, a target and a reason (spec §77–78).
 */
export function ActionDialog({
  config,
  open,
  onOpenChange,
  onConfirm,
}: {
  config: ActionDialogConfig | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (payload: { reason: string; note: string; fields: Record<string, string> }) => void
}) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('')
      setNote('')
      setFields({})
      setTouched(false)
      setSubmitting(false)
    }
  }, [open, config?.title])

  if (!config) return null

  const needsReason = Boolean(config.reasons?.length)
  const missingReason = needsReason && !reason
  const missingNote = Boolean(config.requireNote) && !note.trim()
  const missingField = (config.extraFields ?? []).some((f) => f.required && !fields[f.key]?.trim())
  const blocked = missingReason || missingNote || missingField

  async function confirm() {
    const cfg = config
    if (!cfg) return
    setTouched(true)
    if (blocked) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 700))
    setSubmitting(false)
    onOpenChange(false)
    onConfirm?.({ reason, note, fields })
    toast.success(cfg.successMessage ?? `${cfg.confirmLabel} — done`, {
      description: 'Recorded in the audit log.',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2.5">
            {config.destructive && <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />}
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {needsReason && (
            <div className="grid gap-[7px]">
              <Label htmlFor="action-reason">
                {config.reasonLabel ?? 'Reason'} <span className="text-destructive">*</span>
              </Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="action-reason" aria-invalid={touched && missingReason ? true : undefined}>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {config.reasons!.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched && missingReason && (
                <p className="text-[12px] font-medium text-destructive">A reason is required for this action.</p>
              )}
            </div>
          )}

          {(config.extraFields ?? []).map((field) => (
            <div key={field.key} className="grid gap-[7px]">
              <Label htmlFor={`field-${field.key}`}>
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id={`field-${field.key}`}
                placeholder={field.placeholder}
                value={fields[field.key] ?? ''}
                aria-invalid={touched && field.required && !fields[field.key]?.trim() ? true : undefined}
                onChange={(e) => setFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
              {touched && field.required && !fields[field.key]?.trim() && (
                <p className="text-[12px] font-medium text-destructive">{field.label} is required.</p>
              )}
            </div>
          ))}

          <div className="grid gap-[7px]">
            <Label htmlFor="action-note">
              {config.noteOnly ? 'Reason' : 'Internal note'} {config.requireNote && <span className="text-destructive">*</span>}
              {!config.requireNote && <span className="font-normal text-ink-400">(optional)</span>}
            </Label>
            <Textarea
              id="action-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                config.noteOnly
                  ? 'Explain the decision — this is stored with the record.'
                  : 'Context for the audit trail and support team.'
              }
              aria-invalid={touched && missingNote ? true : undefined}
            />
            {touched && missingNote && (
              <p className="text-[12px] font-medium text-destructive">A reason is required for this action.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant={config.destructive ? 'destructive' : 'default'}
            loading={submitting}
            loadingLabel="Working…"
            onClick={confirm}
          >
            {config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Small hook so screens can open the shared dialog with one call. */
export function useActionDialog() {
  const [config, setConfig] = useState<ActionDialogConfig | null>(null)
  const [open, setOpen] = useState(false)

  function ask(next: ActionDialogConfig) {
    setConfig(next)
    setOpen(true)
  }

  return { config, open, setOpen, ask }
}

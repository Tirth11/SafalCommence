import { useState } from 'react'
import { EyeOff, Link2, MessageSquare, Send } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TICKETS, type Ticket } from '@/data/admin'

const STATUSES = ['Open', 'In Progress', 'Waiting for Customer', 'Waiting for Seller', 'Resolved', 'Closed']
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

export function SupportPage() {
  const [selected, setSelected] = useState<Ticket | null>(TICKETS[0] ?? null)
  const [reply, setReply] = useState('')
  const [internalNote, setInternalNote] = useState('')

  const columns: Column<Ticket>[] = [
    {
      key: 'ticket',
      header: 'Ticket',
      sortBy: (t) => t.id,
      cell: (t) => (
        <button type="button" onClick={() => setSelected(t)} className="block max-w-[280px] text-left">
          <span className="block truncate font-semibold text-ink-900 hover:text-brand-700 dark:text-white">
            {t.subject}
          </span>
          <span className="block text-[11px] text-ink-500 tabular">{t.id}</span>
        </button>
      ),
    },
    {
      key: 'user',
      header: 'Raised by',
      sortBy: (t) => t.user,
      cell: (t) => (
        <span className="block">
          <span className="block text-ink-800 dark:text-ink-100">{t.user}</span>
          <span className="block text-[11px] text-ink-500">{t.userType}</span>
        </span>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      hideBelow: 'lg',
      cell: (t) =>
        t.order ? (
          <AdminLink to={`/admin/orders/${t.order}`} className="tabular text-brand-600 hover:underline dark:text-brand-300">
            {t.order}
          </AdminLink>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    { key: 'priority', header: 'Priority', sortBy: (t) => t.priority, cell: (t) => <StatusBadge status={t.priority} /> },
    { key: 'status', header: 'Status', sortBy: (t) => t.status, cell: (t) => <StatusBadge status={t.status} /> },
    { key: 'created', header: 'Created', hideBelow: 'md', sortBy: (t) => t.created, cell: (t) => <span className="whitespace-nowrap text-ink-500">{t.created}</span> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (t) => (
        <Button variant="outline" size="sm" className="h-8" onClick={() => setSelected(t)}>
          Open
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Support"
        description="Buyer and seller cases, with internal notes that never reach the customer."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Support', to: '/admin/support' }]}
      />

      <DataTable
        rows={TICKETS}
        columns={columns}
        searchKeys={(t) => `${t.id} ${t.subject} ${t.user} ${t.order ?? ''} ${t.description}`}
        searchPlaceholder="Search ticket, subject, user or order"
        filters={[
          { key: 'status', label: 'Status', options: STATUSES },
          { key: 'priority', label: 'Priority', options: PRIORITIES },
          { key: 'userType', label: 'User', options: ['Buyer', 'Seller'] },
        ]}
        exportName="Support tickets"
        empty={{ title: 'No tickets', body: 'There are no support cases in this view.' }}
      />

      {selected && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Panel
            title={selected.subject}
            description={`${selected.id} · ${selected.userType} · raised ${selected.created}`}
            actions={<StatusBadge status={selected.status} />}
          >
            <p className="text-[14px] leading-relaxed text-ink-700 dark:text-ink-200">{selected.description}</p>

            <div className="mt-6 grid gap-[7px] border-t pt-5">
              <Label htmlFor="reply">Reply to {selected.userType.toLowerCase()}</Label>
              <Textarea
                id="reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="This message is sent to the customer."
              />
              <div className="mt-1 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={!reply.trim()}
                  onClick={() => {
                    setReply('')
                    toast.success('Reply sent', { description: `${selected.id} · ${selected.user}` })
                  }}
                >
                  <Send className="size-4" />
                  Send reply
                </Button>
                <Button variant="outline" size="sm">
                  <Link2 className="size-4" />
                  Link order
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="size-4" />
                  Escalate
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-[7px] rounded-sm border border-gold-100 bg-gold-50 p-4 dark:border-gold-600/40 dark:bg-gold-600/10">
              <Label htmlFor="note" className="flex items-center gap-1.5 text-gold-600 dark:text-gold-400">
                <EyeOff className="size-3.5" />
                Internal note — not visible to buyer or seller
              </Label>
              <Textarea
                id="note"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Context for the team handling this case."
                className="bg-background"
              />
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!internalNote.trim()}
                  onClick={() => {
                    setInternalNote('')
                    toast.success('Internal note added')
                  }}
                >
                  Add note
                </Button>
              </div>
            </div>
          </Panel>

          <div className="grid content-start gap-4">
            <Panel title="Case handling">
              <div className="grid gap-4">
                <div className="grid gap-[7px]">
                  <Label htmlFor="ticket-status">Status</Label>
                  <Select defaultValue={selected.status}>
                    <SelectTrigger id="ticket-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-[7px]">
                  <Label htmlFor="ticket-priority">Priority</Label>
                  <Select defaultValue={selected.priority}>
                    <SelectTrigger id="ticket-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={() => toast.success('Ticket updated')}>
                  Save changes
                </Button>
              </div>
            </Panel>

            <Alert variant="info">
              <MessageSquare />
              <AlertDescription>
                Linking a ticket to an order or seller pulls that record into the case so the next agent has full context.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </>
  )
}

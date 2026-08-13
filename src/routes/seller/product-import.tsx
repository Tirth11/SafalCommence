import { useState } from 'react'
import { Check, Download, FileSpreadsheet, Sparkles, TriangleAlert, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EXCEL_COLUMNS, UPLOAD_RESULT, type UploadIssue } from '@/data/seller-assistant'
import { cn } from '@/lib/utils'

/* ==========================================================================
   Bulk product upload.

   Nothing is imported on upload. The file is checked first, the problems are
   named with their row numbers, and the seller decides what happens — which
   is the difference between a useful importer and 146 broken listings.
   ========================================================================== */

type Stage = 'upload' | 'checked' | 'imported'

export function SellerProductImportPage() {
  const [stage, setStage] = useState<Stage>('upload')
  const [fixed, setFixed] = useState<number[]>([])

  const warnings = UPLOAD_RESULT.issues.filter((i) => i.severity === 'warning')
  const errors = UPLOAD_RESULT.issues.filter((i) => i.severity === 'error')
  const remainingWarnings = warnings.filter((w) => !fixed.includes(w.row))
  const importable = UPLOAD_RESULT.ready + fixed.length

  return (
    <>
      <PageHeader
        title="Upload products in bulk"
        description="Add many products at once from a spreadsheet. We check the file before anything goes live."
        breadcrumb={[
          { label: 'Dashboard', to: '/seller' },
          { label: 'Products', to: '/seller/products' },
          { label: 'Bulk upload', to: '/seller/products/import' },
        ]}
      />

      {stage === 'upload' && (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Panel title="1. Start from our template" description="The columns must match, so start here rather than from your own sheet.">
            <Button onClick={() => toast.success('Template downloaded', { description: 'safalmarkethub-products.xlsx' })}>
              <Download className="size-4" />
              Download template
            </Button>

            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-400">Columns</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {EXCEL_COLUMNS.map((column) => (
                <li key={column} className="rounded-full border bg-muted/50 px-2.5 py-1 text-[11px] text-ink-600 dark:text-ink-300">
                  {column}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="2. Upload your file" description="Accepts .xlsx and .csv.">
            <button
              type="button"
              onClick={() => {
                setStage('checked')
                toast.success('File checked', { description: `${UPLOAD_RESULT.total} rows read` })
              }}
              className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/40"
            >
              <Upload className="size-7 text-ink-400" />
              <span className="text-[14px] font-semibold text-ink-900 dark:text-white">Drag your file here</span>
              <span className="text-[12px] text-ink-500">or browse · .xlsx, .csv</span>
            </button>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-500">
              Nothing is imported until you've seen what's in the file.
            </p>
          </Panel>
        </div>
      )}

      {stage === 'checked' && (
        <div className="grid gap-4">
          <Panel title="We checked your file" description={`${UPLOAD_RESULT.total} products found in safalmarkethub-products.xlsx`}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Tally label="Ready to import" value={importable} tone="teal" icon={Check} />
              <Tally label="Need attention" value={remainingWarnings.length} tone="gold" icon={TriangleAlert} />
              <Tally label="Have errors" value={errors.length} tone="red" icon={X} />
            </div>

            {remainingWarnings.length > 0 && (
              <Alert variant="info" className="mt-5">
                <Sparkles />
                <AlertTitle>
                  I found {remainingWarnings.length} row{remainingWarnings.length === 1 ? '' : 's'} I can suggest a fix for
                </AlertTitle>
                <AlertDescription>
                  Mostly categories that didn't match ours. Accept a suggestion and that row joins the import.
                  <span className="mt-3 flex">
                    <Button
                      size="sm"
                      onClick={() => {
                        setFixed(warnings.filter((w) => w.suggestion).map((w) => w.row))
                        toast.success('Suggestions applied', { description: `${warnings.filter((w) => w.suggestion).length} rows fixed` })
                      }}
                    >
                      Accept all suggestions
                    </Button>
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </Panel>

          <Panel title="Rows that need you" padded={false}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {UPLOAD_RESULT.issues.map((issue) => (
                  <IssueRow
                    key={issue.row}
                    issue={issue}
                    fixed={fixed.includes(issue.row)}
                    onFix={() => {
                      setFixed((f) => [...f, issue.row])
                      toast.success(`Row ${issue.row} fixed`, { description: issue.suggestion })
                    }}
                  />
                ))}
              </TableBody>
            </Table>
            <div className="flex flex-wrap gap-2 border-t bg-muted/40 px-5 py-3">
              <Button variant="outline" size="sm" onClick={() => toast.success('Error file downloaded')}>
                <Download className="size-4" />
                Download error rows
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStage('upload')}>
                Upload a corrected file
              </Button>
            </div>
          </Panel>

          <Panel title="Ready to import">
            <p className="text-[14px] text-ink-700 dark:text-ink-200">
              <strong className="text-ink-950 dark:text-white">{importable} products</strong> are valid.{' '}
              {remainingWarnings.length > 0 && `${remainingWarnings.length} still need your confirmation. `}
              {errors.length > 0 && `${errors.length} won't be imported until they're corrected.`}
            </p>
            <p className="mt-2 text-[12px] text-ink-500">
              Imported products arrive as drafts, so you can review them before submitting for approval.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setStage('imported')
                  toast.success(`${importable} products imported`, { description: 'Saved as drafts' })
                }}
              >
                Import {importable} products
              </Button>
              <Button variant="outline" onClick={() => setStage('upload')}>
                Start over
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {stage === 'imported' && (
        <Panel className="mx-auto max-w-[560px] text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100">
            <FileSpreadsheet className="size-6" />
          </span>
          <h2 className="mt-4 text-[20px]">{importable} products added 🎉</h2>
          <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">
            They're saved as drafts. Review them, then submit for marketplace approval when you're happy.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <AdminLink to="/seller/products">Review drafts</AdminLink>
            </Button>
            <Button variant="outline" onClick={() => setStage('upload')}>
              Upload another file
            </Button>
          </div>
        </Panel>
      )}
    </>
  )
}

function IssueRow({ issue, fixed, onFix }: { issue: UploadIssue; fixed: boolean; onFix: () => void }) {
  return (
    <TableRow className={cn(fixed && 'opacity-60')}>
      <TableCell className="tabular text-ink-500">{issue.row}</TableCell>
      <TableCell className="font-medium text-ink-900 dark:text-white">{issue.product}</TableCell>
      <TableCell>
        <span
          className={cn(
            'text-[12px]',
            issue.severity === 'error' ? 'text-red-600 dark:text-red-300' : 'text-gold-700 dark:text-gold-300'
          )}
        >
          {issue.issue}
        </span>
        {issue.suggestion && (
          <span className="mt-0.5 block text-[11px] text-ink-500">
            Suggested: <strong className="text-ink-800 dark:text-ink-100">{issue.suggestion}</strong>
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {fixed ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-teal-600 dark:text-teal-100">
            <Check className="size-3.5" />
            Fixed
          </span>
        ) : issue.suggestion ? (
          <Button size="sm" variant="outline" className="h-8" onClick={onFix}>
            Accept
          </Button>
        ) : (
          <span className="text-[12px] text-ink-400">Fix in file</span>
        )}
      </TableCell>
    </TableRow>
  )
}

function Tally({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string
  value: number
  tone: 'teal' | 'gold' | 'red'
  icon: typeof Check
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        { teal: 'bg-teal-50 dark:bg-teal-950/30', gold: 'bg-gold-50 dark:bg-gold-950/25', red: 'bg-red-50 dark:bg-red-950/25' }[tone]
      )}
    >
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1.5 text-[24px] font-bold leading-none tabular text-ink-950 dark:text-white">{value}</p>
    </div>
  )
}

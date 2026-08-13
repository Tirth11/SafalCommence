import { Camera, FileSpreadsheet, PenLine, Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { useSellerAssistant } from '@/components/seller/seller-assistant'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Four ways to add products, offered at the moment the seller asks for one.
 * A seller with 140 items in a spreadsheet and a seller adding their first
 * product need very different things from the same button.
 */
export function AddProductMenu() {
  const assistant = useSellerAssistant()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          Add Product
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel>How would you like to add products?</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <AdminLink to="/seller/products/new" className="flex items-start gap-2.5">
            <PenLine className="mt-0.5 size-4 shrink-0 text-ink-400" />
            <span>
              <span className="block text-[13px] font-medium">Add manually</span>
              <span className="block text-[11px] text-ink-500">The full form, one product.</span>
            </span>
          </AdminLink>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => assistant.open('Add a product')} className="flex items-start gap-2.5">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-300" />
          <span>
            <span className="block text-[13px] font-medium">Add with Safal Assistant</span>
            <span className="block text-[11px] text-ink-500">Describe it and review the draft.</span>
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => toast.info('Add from images', { description: 'Upload photos and we suggest a category.' })}
          className="flex items-start gap-2.5"
        >
          <Camera className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <span>
            <span className="block text-[13px] font-medium">Add from images</span>
            <span className="block text-[11px] text-ink-500">We suggest the category, you confirm.</span>
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <AdminLink to="/seller/products/import" className="flex items-start gap-2.5">
            <FileSpreadsheet className="mt-0.5 size-4 shrink-0 text-ink-400" />
            <span>
              <span className="block text-[13px] font-medium">Upload Excel</span>
              <span className="block text-[11px] text-ink-500">Many products at once, checked first.</span>
            </span>
          </AdminLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

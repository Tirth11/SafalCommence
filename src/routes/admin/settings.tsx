import { useState } from 'react'
import { toast } from 'sonner'

import { PageHeader, Panel } from '@/components/admin/primitives'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldAlert } from 'lucide-react'

type ToggleDef = { key: string; label: string; body: string; on: boolean }

const SELLER_TOGGLES: ToggleDef[] = [
  { key: 'kyc', label: 'KYC required before activation', body: 'Sellers cannot go live until documents are verified.', on: true },
  { key: 'approval', label: 'Manual seller approval required', body: 'An admin must approve every seller application.', on: true },
  { key: 'productApproval', label: 'Product approval required', body: 'New listings enter moderation before going live.', on: true },
]

const MARKETPLACE_TOGGLES: ToggleDef[] = [
  { key: 'marketplace', label: 'Marketplace enabled', body: 'Turning this off takes the storefront offline.', on: true },
  { key: 'registration', label: 'Seller registration enabled', body: 'Allow new businesses to apply.', on: true },
  { key: 'guest', label: 'Guest checkout enabled', body: 'Buyers can order without creating an account.', on: false },
]

export function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries([...SELLER_TOGGLES, ...MARKETPLACE_TOGGLES].map((t) => [t.key, t.on]))
  )

  return (
    <>
      <PageHeader
        title="Platform settings"
        description="Global configuration for SafalMarketHub. Changes apply marketplace-wide and are written to the audit log."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Settings', to: '/admin/settings' }]}
        actions={
          <Button size="sm" onClick={() => toast.success('Settings saved')}>
            Save changes
          </Button>
        }
      />

      <Alert variant="warning" className="mb-4">
        <ShieldAlert />
        <AlertDescription>
          Platform settings are restricted to Super Admin. Operations Admins see this screen in read-only mode.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general">
        <TabsList className="mb-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seller">Seller</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Panel title="General">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextSetting id="platform-name" label="Platform name" value="SafalMarketHub" />
              <TextSetting id="support-email" label="Support email" value="support@safalmarkethub.com" />
              <TextSetting id="support-phone" label="Support phone" value="+91 22 4000 1200" />
              <SelectSetting id="currency" label="Currency" value="INR" options={['INR']} />
              <SelectSetting id="timezone" label="Time zone" value="Asia/Kolkata (IST)" options={['Asia/Kolkata (IST)', 'UTC']} />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="seller">
          <Panel title="Seller onboarding">
            <ToggleList defs={SELLER_TOGGLES} state={toggles} setState={setToggles} />
          </Panel>
        </TabsContent>

        <TabsContent value="orders">
          <Panel title="Cancellation & returns">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectSetting
                id="cancel-window"
                label="Buyer cancellation allowed until"
                value="Order shipped"
                options={['Order confirmed', 'Order packed', 'Order shipped']}
              />
              <TextSetting id="return-window" label="Return window (days)" value="7" hint="Applies to all categories unless a product overrides it." />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="payments">
          <Panel title="Payment gateway">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectSetting id="gateway" label="Primary gateway" value="Razorpay" options={['Razorpay', 'PayU', 'Cashfree']} />
              <TextSetting id="webhook" label="Webhook endpoint" value="https://api.safalmarkethub.com/webhooks/payments" />
            </div>
            <p className="mt-5 rounded-sm border bg-muted/60 px-4 py-3 text-[12px] leading-relaxed text-ink-500">
              Gateway API keys are stored in the secret manager, never in this portal. Webhook signatures are verified on
              every callback.
            </p>
          </Panel>
        </TabsContent>

        <TabsContent value="settlement">
          <Panel title="Settlement cycle">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextSetting id="waiting" label="Settlement waiting period (days after delivery)" value="7" />
              <SelectSetting id="frequency" label="Settlement frequency" value="Weekly" options={['Weekly', 'Fortnightly', 'Monthly']} />
            </div>
            <p className="mt-5 text-[12px] text-ink-500">
              Seller-specific overrides can be introduced later without changing this default.
            </p>
          </Panel>
        </TabsContent>

        <TabsContent value="shipping">
          <Panel title="Logistics">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectSetting id="courier" label="Default courier partner" value="Delhivery" options={['Delhivery', 'Blue Dart', 'Ecom Express']} />
              <TextSetting id="free-shipping" label="Free shipping above (₹)" value="999" />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="marketplace">
          <Panel title="Marketplace controls">
            <ToggleList defs={MARKETPLACE_TOGGLES} state={toggles} setState={setToggles} />
            <div className="mt-6 grid gap-5 border-t pt-5 sm:grid-cols-2">
              <TextSetting id="min-order" label="Minimum order value (₹)" value="199" />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="homepage">
          <Panel title="Homepage" description="Lightweight merchandising only — no full CMS in Phase 1.">
            <div className="grid gap-5">
              <TextSetting id="hero" label="Hero headline" value="Buy what you love. Sell what you create." />
              <TextSetting id="featured-categories" label="Featured categories" value="Electronics, Fashion, Home & Living" />
              <TextSetting id="featured-products" label="Featured product IDs" value="SH-P-1042, SH-P-2214, SH-P-2218" />
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  )
}

function TextSetting({ id, label, value, hint }: { id: string; label: string; value: string; hint?: string }) {
  return (
    <div className="grid gap-[7px]">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} defaultValue={value} />
      {hint && <p className="text-[12px] text-ink-500">{hint}</p>}
    </div>
  )
}

function SelectSetting({ id, label, value, options }: { id: string; label: string; value: string; options: string[] }) {
  return (
    <div className="grid gap-[7px]">
      <Label htmlFor={id}>{label}</Label>
      <Select defaultValue={value}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function ToggleList({
  defs,
  state,
  setState,
}: {
  defs: ToggleDef[]
  state: Record<string, boolean>
  setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  return (
    <ul className="divide-y">
      {defs.map((def) => (
        <li key={def.key} className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
          <div>
            <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{def.label}</p>
            <p className="mt-0.5 text-[12px] text-ink-500">{def.body}</p>
          </div>
          <Switch
            checked={state[def.key]}
            onCheckedChange={(checked) => setState((prev) => ({ ...prev, [def.key]: checked }))}
            aria-label={def.label}
          />
        </li>
      ))}
    </ul>
  )
}

import { useMemo } from 'react'
import qrcode from 'qrcode-generator'

/**
 * A QR code for the seller's storefront, rendered as SVG so it stays sharp
 * on a shop counter print-out or an Instagram story. Generated in the browser
 * from the store URL — nothing to configure, nothing to upload.
 */
export function StoreQr({ url, size = 148, className }: { url: string; size?: number; className?: string }) {
  const path = useMemo(() => {
    // Type 0 lets the library pick the smallest version that fits the URL.
    const qr = qrcode(0, 'M')
    qr.addData(`https://${url.replace(/^https?:\/\//, '')}`)
    qr.make()
    const count = qr.getModuleCount()
    let d = ''
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`
      }
    }
    return { d, count }
  }, [url])

  return (
    <svg
      viewBox={`-1 -1 ${path.count + 2} ${path.count + 2}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`QR code linking to ${url}`}
      shapeRendering="crispEdges"
    >
      <rect x={-1} y={-1} width={path.count + 2} height={path.count + 2} fill="#fff" />
      <path d={path.d} fill="#0B0A12" />
    </svg>
  )
}

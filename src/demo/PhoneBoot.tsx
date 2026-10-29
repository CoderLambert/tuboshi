/** Compact boot indicator. Inline px so the 100px rem root cannot enlarge it. */
export default function PhoneBoot({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flex: '1 1 auto',
        width: '100%',
        height: '100%',
        minHeight: 0,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: '#9ca3af',
        fontSize: 13,
        lineHeight: '18px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 16,
          height: 16,
          flex: '0 0 auto',
          borderRadius: 999,
          border: '2px solid #e5e7eb',
          borderTopColor: '#4b5563',
          animation: 'tubo-spin 0.7s linear infinite',
        }}
      />
      <span>{label}</span>
      <style>
        {'@keyframes tubo-spin{to{transform:rotate(360deg)}}'}
      </style>
    </div>
  )
}

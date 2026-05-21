interface EscrowBadgeProps {
  size?: 'sm' | 'md';
}

export function EscrowBadge({ size = 'sm' }: EscrowBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-full ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span>🔒</span>
      <span className="font-medium">Được bảo vệ bởi Escrow</span>
    </div>
  );
}

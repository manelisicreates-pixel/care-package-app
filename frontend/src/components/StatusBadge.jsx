function StatusBadge({ status }) {
  const styles = {
    Pending: { background: '#fef3c7', color: '#92400e' },
    Processing: { background: '#dbeafe', color: '#1d4ed8' },
    Shipped: { background: '#e0e7ff', color: '#4338ca' },
    Delivered: { background: '#dcfce7', color: '#166534' },
    Cancelled: { background: '#fee2e2', color: '#991b1b' },
  }

  const current = styles[status] || { background: '#e5e7eb', color: '#374151' }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 'bold',
        background: current.background,
        color: current.color,
      }}
    >
      {status}
    </span>
  )
}

export default StatusBadge
function BrandLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <img
        src="/logo.png"
        alt="take.care box"
        style={{
          height: '120px',
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  )
}

export default BrandLogo
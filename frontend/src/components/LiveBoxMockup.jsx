import { previewFonts, previewImages, ribbonTextColors } from './mockupConfig'

function LiveBoxMockup({
  boxFinish,
  ribbonColor,
  cardStyle,
  boxName,
  cardMessage,
  fontChoice,
  extras,
  isMobile = false,
}) {
  const fallbackImage =
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'

  const previewImage =
    previewImages?.[boxFinish]?.[ribbonColor] || fallbackImage

  const selectedFont =
    previewFonts?.[fontChoice] || '"Times New Roman", Georgia, serif'

  const overlayTextColor =
    ribbonTextColors?.[ribbonColor] || '#ffffff'

  const selectedExtras = Object.entries(extras || {})
    .filter(([, value]) => value)
    .map(([key]) => {
      if (key === 'driedFlowers') return 'Dried flowers'
      if (key === 'tissuePaper') return 'Tissue paper'
      if (key === 'luxuryFiller') return 'Luxury filler'
      return key
    })

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        padding: '18px',
        background: '#faf8f3',
      }}
    >
      <div
        style={{
          position: 'relative',
          marginBottom: '16px',
        }}
      >
        <img
          src={previewImage}
          alt="Customized box preview"
          style={{
            width: '100%',
            height: isMobile ? '280px' : '360px',
            objectFit: 'cover',
            display: 'block',
            border: '1px solid var(--border-strong)',
          }}
        />

        {boxName?.trim() ? (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              textAlign: 'center',
              color: overlayTextColor,
              textShadow: '0 2px 8px rgba(0,0,0,0.45)',
              fontSize: isMobile ? '22px' : '28px',
              fontFamily: selectedFont,
              fontStyle: fontChoice === 'Signature' ? 'italic' : 'normal',
              letterSpacing: fontChoice === 'Minimal' ? '0.08em' : 'normal',
              textTransform: fontChoice === 'Minimal' ? 'uppercase' : 'none',
            }}
          >
            {boxName}
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            right: '18px',
            width: isMobile ? '135px' : '145px',
            minHeight: '95px',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid var(--border-strong)',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#222',
            fontFamily: selectedFont,
            fontStyle:
              cardStyle === 'Elegant' || fontChoice === 'Signature'
                ? 'italic'
                : 'normal',
            textTransform: cardStyle === 'Minimal' ? 'uppercase' : 'none',
            letterSpacing: cardStyle === 'Minimal' ? '0.06em' : 'normal',
            lineHeight: 1.35,
            fontSize: '13px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          }}
        >
          {cardMessage?.trim() || `${cardStyle} card`}
        </div>

        {extras?.driedFlowers ? (
          <div
            style={{
              position: 'absolute',
              top: '54px',
              right: '18px',
              fontSize: '22px',
            }}
          >
            🌾
          </div>
        ) : null}

        {extras?.luxuryFiller ? (
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              left: '18px',
              fontSize: '24px',
            }}
          >
            ✨
          </div>
        ) : null}

        {extras?.tissuePaper ? (
          <div
            style={{
              position: 'absolute',
              top: '56px',
              left: '18px',
              fontSize: '22px',
            }}
          >
            🧻
          </div>
        ) : null}
      </div>

      <div
        style={{
          color: 'var(--text-soft)',
          lineHeight: 1.7,
          fontSize: '14px',
        }}
      >
        <div><strong>Finish:</strong> {boxFinish}</div>
        <div><strong>Ribbon:</strong> {ribbonColor}</div>
        <div><strong>Card:</strong> {cardStyle}</div>
        <div><strong>Name on box:</strong> {boxName || 'None added'}</div>
        <div><strong>Card message:</strong> {cardMessage || 'None added'}</div>
        <div><strong>Font:</strong> {fontChoice}</div>
        <div>
          <strong>Extras:</strong>{' '}
          {selectedExtras.length > 0 ? selectedExtras.join(', ') : 'None selected'}
        </div>
      </div>
    </div>
  )
}

export default LiveBoxMockup
function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
      }}
    >
      {categories.map((category) => {
        const active = selectedCategory === category

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            style={{
              padding: '10px 14px',
              borderRadius: '0px',
              border: active ? '1px solid var(--text)' : '1px solid var(--border)',
              background: active ? 'var(--text)' : '#ffffff',
              color: active ? '#ffffff' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: active ? 700 : 500,
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '0.08em',
            }}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
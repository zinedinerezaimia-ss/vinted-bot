import { useState, useRef } from 'react'

export default function App() {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState({})
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image trop lourde (max 10MB)')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
        setImagePreview(reader.result)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
        setImagePreview(reader.result)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!image) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/.netlify/functions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: image })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Erreur lors de l\'analyse')
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifie ta connexion internet.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [field]: true })
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000)
  }

  const resetAll = () => {
    setImage(null)
    setImagePreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="app">
      {/* Background Effects */}
      <div className="bg-grid"></div>
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">VintedBot<span className="logo-ai">AI</span></span>
        </div>
        <p className="tagline">Créez des annonces parfaites en 1 clic</p>
      </header>

      <main className="main">
        {/* Upload Section */}
        <section className="upload-section">
          <div 
            className={`dropzone ${imagePreview ? 'has-image' : ''} ${loading ? 'loading' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="preview-container">
                <img src={imagePreview} alt="Aperçu" className="preview-image" />
                <button className="remove-btn" onClick={(e) => { e.stopPropagation(); resetAll(); }}>
                  ✕
                </button>
              </div>
            ) : (
              <div className="dropzone-content">
                <div className="upload-icon">📸</div>
                <p className="upload-text">Glisse ta photo ici</p>
                <p className="upload-subtext">ou clique pour sélectionner</p>
                <span className="upload-formats">JPG, PNG, WEBP (max 10MB)</span>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="file-input"
            />
          </div>

          {image && !loading && !result && (
            <button className="analyze-btn" onClick={analyzeImage}>
              <span className="btn-icon">✨</span>
              <span>Générer mon annonce</span>
            </button>
          )}

          {loading && (
            <div className="loading-state">
              <div className="loader"></div>
              <p>L'IA analyse ton article...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}
        </section>

        {/* Results Section */}
        {result && (
          <section className="results-section">
            <div className="results-header">
              <h2>🎉 Ton annonce est prête !</h2>
              <button className="new-btn" onClick={resetAll}>
                + Nouvelle annonce
              </button>
            </div>

            {/* Title Card */}
            <div className="result-card">
              <div className="card-header">
                <span className="card-label">Titre</span>
                <button 
                  className={`copy-btn ${copied.title ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(result.titre, 'title')}
                >
                  {copied.title ? '✓ Copié' : '📋 Copier'}
                </button>
              </div>
              <p className="card-content title-content">{result.titre}</p>
            </div>

            {/* Description Card */}
            <div className="result-card">
              <div className="card-header">
                <span className="card-label">Description</span>
                <button 
                  className={`copy-btn ${copied.desc ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(result.description, 'desc')}
                >
                  {copied.desc ? '✓ Copié' : '📋 Copier'}
                </button>
              </div>
              <p className="card-content">{result.description}</p>
            </div>

            {/* Price Card */}
            {result.prix_suggere && (
              <div className="result-card price-card">
                <div className="card-header">
                  <span className="card-label">💰 Prix suggéré</span>
                </div>
                <div className="price-range">
                  <div className="price-item">
                    <span className="price-label">Minimum</span>
                    <span className="price-value">{result.prix_suggere.minimum}€</span>
                  </div>
                  <div className="price-item optimal">
                    <span className="price-label">Optimal</span>
                    <span className="price-value">{result.prix_suggere.optimal}€</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Maximum</span>
                    <span className="price-value">{result.prix_suggere.maximum}€</span>
                  </div>
                </div>
                {result.prix_suggere.justification && (
                  <p className="price-justification">{result.prix_suggere.justification}</p>
                )}
              </div>
            )}

            {/* Details Grid */}
            <div className="details-grid">
              {result.categorie && (
                <div className="detail-item">
                  <span className="detail-label">📁 Catégorie</span>
                  <span className="detail-value">{result.categorie}</span>
                </div>
              )}
              {result.marque_detectee && result.marque_detectee !== 'Non identifiée' && (
                <div className="detail-item">
                  <span className="detail-label">🏷️ Marque</span>
                  <span className="detail-value">{result.marque_detectee}</span>
                </div>
              )}
              {result.couleur && (
                <div className="detail-item">
                  <span className="detail-label">🎨 Couleur</span>
                  <span className="detail-value">{result.couleur}</span>
                </div>
              )}
              {result.etat_estime && (
                <div className="detail-item">
                  <span className="detail-label">✨ État</span>
                  <span className="detail-value">{result.etat_estime}</span>
                </div>
              )}
              {result.taille_probable && (
                <div className="detail-item">
                  <span className="detail-label">📏 Taille</span>
                  <span className="detail-value">{result.taille_probable}</span>
                </div>
              )}
            </div>

            {/* Keywords & Hashtags */}
            {(result.mots_cles || result.hashtags) && (
              <div className="result-card">
                <div className="card-header">
                  <span className="card-label">🔑 Mots-clés & Hashtags</span>
                  <button 
                    className={`copy-btn ${copied.tags ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(
                      [...(result.mots_cles || []), ...(result.hashtags || [])].join(' '), 
                      'tags'
                    )}
                  >
                    {copied.tags ? '✓ Copié' : '📋 Copier'}
                  </button>
                </div>
                <div className="tags-container">
                  {result.mots_cles?.map((tag, i) => (
                    <span key={`kw-${i}`} className="tag keyword">{tag}</span>
                  ))}
                  {result.hashtags?.map((tag, i) => (
                    <span key={`ht-${i}`} className="tag hashtag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Tips */}
            {result.conseils_photo && result.conseils_photo.length > 0 && (
              <div className="result-card tips-card">
                <div className="card-header">
                  <span className="card-label">📷 Conseils photo</span>
                </div>
                <ul className="tips-list">
                  {result.conseils_photo.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Copy All Button */}
            <button 
              className={`copy-all-btn ${copied.all ? 'copied' : ''}`}
              onClick={() => {
                const allText = `${result.titre}\n\n${result.description}\n\n${result.hashtags?.join(' ') || ''}`
                copyToClipboard(allText, 'all')
              }}
            >
              {copied.all ? '✓ Tout copié !' : '📋 Copier titre + description'}
            </button>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Fait avec 💜 • Gratuit et open source</p>
        <p className="footer-tip">💡 Astuce : Prends tes photos en lumière naturelle pour de meilleurs résultats</p>
      </footer>
    </div>
  )
}

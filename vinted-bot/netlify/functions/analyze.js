// Fonction Netlify pour analyser les images avec Groq Vision
export async function handler(event) {
  // Gérer les CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { imageBase64, category } = JSON.parse(event.body);
    
    if (!imageBase64) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Image requise' }) 
      };
    }

    const GROQ_KEY = process.env.GROQ_KEY;
    
    if (!GROQ_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'Clé API non configurée' }) 
      };
    }

    // Analyse de l'image avec Groq Vision (llama-3.2-90b-vision-preview)
    const analysisPrompt = `Tu es un expert en vente de vêtements et articles de mode sur Vinted. Analyse cette image de produit et fournis une réponse JSON structurée.

IMPORTANT: Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.

{
  "titre": "Un titre accrocheur de max 50 caractères pour Vinted",
  "description": "Une description vendeuse de 150-200 mots qui inclut: état du produit, matière probable, couleur exacte, style, occasions de port, points forts. Utilise un ton amical et professionnel typique de Vinted.",
  "categorie": "La catégorie Vinted appropriée (ex: Hauts, Pantalons, Chaussures, Accessoires, etc.)",
  "marque_detectee": "La marque si visible, sinon 'Non identifiée'",
  "couleur": "Couleur principale",
  "etat_estime": "Neuf avec étiquette / Très bon état / Bon état / Satisfaisant",
  "taille_probable": "Estimation de taille si possible",
  "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "prix_suggere": {
    "minimum": 0,
    "optimal": 0,
    "maximum": 0,
    "justification": "Explication courte du prix suggéré basée sur la marque, l'état et le type de produit"
  },
  "conseils_photo": ["conseil1", "conseil2"],
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API Error:', errorText);
      return { 
        statusCode: 500, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Erreur API Groq', details: errorText }) 
      };
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content;

    // Parser la réponse JSON
    let parsedResponse;
    try {
      // Nettoyer la réponse (enlever les backticks markdown si présents)
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      parsedResponse = JSON.parse(cleanedResponse.trim());
    } catch (e) {
      console.error('Parse error:', e, 'Raw response:', aiResponse);
      parsedResponse = {
        titre: "Article de mode",
        description: aiResponse,
        categorie: category || "Mode",
        prix_suggere: { minimum: 5, optimal: 15, maximum: 30 }
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: parsedResponse
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}

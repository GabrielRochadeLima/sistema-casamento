import { RoomType, ProductPriority } from '../types';

export interface ExtractedProductInfo {
  name: string;
  brand?: string;
  estimatedPrice?: number;
  room: RoomType;
  priority: ProductPriority;
  specs?: string;
  storeName?: string;
  imageUrl?: string;
}

// Helper to infer room from keywords
function inferRoomFromText(text: string): RoomType {
  const t = text.toLowerCase();
  
  if (t.includes('geladeira') || t.includes('refrigerador') || t.includes('fogão') || t.includes('cooktop') || 
      t.includes('forno') || t.includes('micro-ondas') || t.includes('microondas') || t.includes('airfryer') || 
      t.includes('air fryer') || t.includes('cafeteira') || t.includes('lava-louça') || t.includes('lava louça') || 
      t.includes('panela') || t.includes('batedeira') || t.includes('liquidificador') || t.includes('coifa') || 
      t.includes('depurador')) {
    return 'Cozinha';
  }

  if (t.includes('cama') || t.includes('colchão') || t.includes('colchao') || t.includes('guarda-roupa') || 
      t.includes('guarda roupa') || t.includes('roupeiro') || t.includes('travesseiro') || t.includes('cabeceira') || 
      t.includes('penteadeira') || t.includes('lençol') || t.includes('edredom')) {
    return 'Quarto do Casal';
  }

  if (t.includes('lavadora') || t.includes('lava e seca') || t.includes('máquina de lavar') || 
      t.includes('secadora') || t.includes('tanquinho') || t.includes('varal') || t.includes('aspirador') ||
      t.includes('ferro de passar') || t.includes('tábua de passar') || t.includes('washer')) {
    return 'Área de Serviço';
  }

  if (t.includes('chuveiro') || t.includes('ducha') || t.includes('toalha') || t.includes('gabinete banheiro') || 
      t.includes('box') || t.includes('espelheira') || t.includes('torneira banheiro')) {
    return 'Banheiro';
  }

  if (t.includes('mesa escritório') || t.includes('cadeira escritório') || t.includes('cadeira gamer') || 
      t.includes('escrivaninha') || t.includes('computador') || t.includes('notebook') || t.includes('monitor') || 
      t.includes('varanda') || t.includes('churrasqueira')) {
    return 'Escritório / Varanda';
  }

  if (t.includes('tv') || t.includes('televisão') || t.includes('televisao') || t.includes('smart tv') || 
      t.includes('sofá') || t.includes('sofa') || t.includes('rack') || t.includes('painel') || 
      t.includes('poltrona') || t.includes('soundbar') || t.includes('mesa de jantar') || t.includes('tapete') ||
      t.includes('qled') || t.includes('oled') || t.includes('mini-led')) {
    return 'Sala de Estar';
  }

  return 'Sala de Estar';
}

// Helper to infer brand from text or host
function inferBrand(text: string, host: string = ''): string | undefined {
  const h = host.toLowerCase();
  if (h.includes('samsung')) return 'Samsung';
  if (h.includes('lg.com')) return 'LG';
  if (h.includes('brastemp')) return 'Brastemp';
  if (h.includes('electrolux')) return 'Electrolux';
  if (h.includes('consul')) return 'Consul';
  if (h.includes('mondial')) return 'Mondial';
  if (h.includes('philips')) return 'Philips Walita';
  if (h.includes('apple')) return 'Apple';
  if (h.includes('sony')) return 'Sony';
  if (h.includes('mobly')) return 'Mobly';
  if (h.includes('tokstok')) return 'Tok&Stok';

  const brands = [
    'Samsung', 'LG', 'Brastemp', 'Electrolux', 'Consul', 'Mondial', 'Philips Walita', 'Britânia',
    'Philco', 'Oster', 'Sony', 'TCL', 'Midea', 'Castor', 'Emma', 'Ortobom', 'Tok&Stok', 'MadeiraMadeira',
    'Mobly', 'Xiaomi', 'Apple', 'JBL', 'Bosch', 'Lorenzetti', 'Tramontina'
  ];

  for (const b of brands) {
    const regex = new RegExp(`\\b${b}\\b`, 'i');
    if (regex.test(text)) return b;
  }
  return undefined;
}

// Check if title is valid or generic/error
function isInvalidTitle(title: string): boolean {
  if (!title || title.trim().length < 4) return true;
  const lower = title.toLowerCase();
  return lower.includes('404') || 
         lower.includes('not found') || 
         lower.includes('página não encontrada') || 
         lower.includes('erro') || 
         lower.includes('error') || 
         lower.includes('access denied') || 
         lower.includes('acesso negado') ||
         lower.includes('robot') ||
         lower.includes('recaptcha');
}

// Clean title string
function cleanTitle(rawTitle: string): string {
  let cleaned = rawTitle
    .replace(/\s*\|\s*.*$/i, '')
    .replace(/\s*-\s*(Compre|Loja|Oficial|Brasil).*$/i, '')
    .replace(/Frete grátis.*$/i, '')
    .replace(/em até \d+x.*$/i, '')
    .trim();

  if (cleaned.length > 90) {
    cleaned = cleaned.substring(0, 90).trim() + '...';
  }
  return cleaned;
}

// Advanced Smart Slug Parser
function parseFromUrlSlug(urlStr: string): Partial<ExtractedProductInfo> {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    const brand = inferBrand('', host);

    // Filter path segments (ignore country code, short codes)
    const pathParts = url.pathname.split('/').filter(p => p.length > 2 && p !== 'br' && p !== 'pt' && p !== 'en');
    
    // Pick the longest hyphenated segment as it represents the full product description
    const candidates = pathParts.filter(p => p.includes('-') && !p.startsWith('MLB-') && !p.startsWith('dp'));
    candidates.sort((a, b) => b.length - a.length);
    const rawSlug = candidates[0] || pathParts[pathParts.length - 1] || '';

    if (!rawSlug) return { brand };

    // 1. Detect Specifications inside slug
    const specsList: string[] = [];
    
    // Inches: 43, 50, 55, 65, 75, 85
    const inchesMatch = rawSlug.match(/(\d{2})[-_]?(polegadas|pol|polegada)?(?=[-_]|$)/i);
    if (inchesMatch) {
      const num = parseInt(inchesMatch[1]);
      if (num >= 24 && num <= 98) {
        specsList.push(`${num}" Polegadas`);
      }
    }

    // Resolution & Display
    if (/8k/i.test(rawSlug)) specsList.push('Resolução 8K');
    else if (/4k/i.test(rawSlug)) specsList.push('Resolução 4K UHD');
    
    if (/neo[-_]?qled/i.test(rawSlug)) specsList.push('Painel Neo QLED');
    else if (/qled/i.test(rawSlug)) specsList.push('Painel QLED');
    else if (/oled/i.test(rawSlug)) specsList.push('Painel OLED');
    else if (/mini[-_]?led/i.test(rawSlug)) specsList.push('Tecnologia Mini LED');

    // Capacity (kg or L)
    const kgMatch = rawSlug.match(/(\d{1,2})[-_]?kg/i);
    if (kgMatch) specsList.push(`Capacidade ${kgMatch[1]}kg`);

    const litersMatch = rawSlug.match(/(\d{3})[-_]?l(?:itros)?/i);
    if (litersMatch) specsList.push(`Capacidade ${litersMatch[1]} Litros`);

    // Features
    if (/soundbar/i.test(rawSlug)) specsList.push('Acompanha Soundbar');
    if (/inverter/i.test(rawSlug)) specsList.push('Tecnologia Inverter');
    if (/frost[-_]?free/i.test(rawSlug)) specsList.push('Sistema Frost Free');
    if (/air[-_]?wash/i.test(rawSlug)) specsList.push('Lavagem a Seco (Air Wash)');
    if (/ai[-_]?control/i.test(rawSlug)) specsList.push('Painel com Inteligência Artificial');
    if (/inox/i.test(rawSlug)) specsList.push('Acabamento Inox');

    // Model Detection (ex: 55QN85D, HW-Q600C, WD11T, BRE57AK)
    const modelParts: string[] = [];
    const modelRegex = /\b([a-z]{1,4}\d{2,4}[a-z0-9_-]*)\b/gi;
    let match;
    while ((match = modelRegex.exec(rawSlug)) !== null) {
      const code = match[1].toUpperCase();
      if (!['MINI', 'QLED', 'OLED', '11KG', '12KG', '4K', '8K', 'UHD', 'FHD', 'SMART'].includes(code)) {
        modelParts.push(code);
      }
    }

    // 2. Format a Human-Readable Title
    // Replace hyphens with spaces and capitalize words properly
    let titleWords = rawSlug
      .replace(/[-_]/g, ' ')
      .split(' ')
      .filter(w => w.length > 0 && !w.startsWith('bn1') && !w.startsWith('az') && w !== 'loading' && w !== 'front')
      .map(w => {
        const upper = w.toUpperCase();
        if (['TV', '4K', '8K', 'UHD', 'FHD', 'QLED', 'OLED', 'LED', 'AI', 'SOUNDBAR', 'HW', 'WD', 'QN'].includes(upper)) {
          return upper;
        }
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(' ');

    // If title has "Kit", "Smart TV", format nicely
    if (specsList.length > 0 && !titleWords.toLowerCase().includes('polegadas') && inchesMatch) {
      titleWords = titleWords.replace(new RegExp(`\\b${inchesMatch[1]}\\b`), `${inchesMatch[1]}"`);
    }

    const detectedBrand = brand || inferBrand(titleWords, host);
    const detectedRoom = inferRoomFromText(`${titleWords} ${specsList.join(' ')}`);

    return {
      name: cleanTitle(titleWords),
      brand: detectedBrand,
      room: detectedRoom,
      specs: specsList.length > 0 ? specsList.join(' • ') : undefined,
      priority: detectedRoom === 'Cozinha' || /lavadora|lava e seca/i.test(titleWords) ? 'Essencial' : 'Alta'
    };
  } catch (err) {
    console.warn('Error in smart slug parser:', err);
    return {};
  }
}

/**
 * Extracts product details from an online store URL.
 */
export async function extractProductFromUrl(
  url: string,
  geminiApiKey?: string
): Promise<ExtractedProductInfo> {
  if (!url || !url.startsWith('http')) {
    throw new Error('Insira uma URL válida começando com http:// ou https://');
  }

  let scrapedTitle = '';
  let scrapedDescription = '';
  let scrapedImage = '';
  let scrapedPublisher = '';
  let scrapedPrice: number | undefined = undefined;

  // 1. Try Microlink API metadata extractor
  try {
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true`, {
      signal: AbortSignal.timeout(6000)
    });

    if (response.ok) {
      const json = await response.json();
      if (json.status === 'success' && json.data) {
        const candidateTitle = json.data.title || '';
        if (!isInvalidTitle(candidateTitle)) {
          scrapedTitle = candidateTitle;
          scrapedDescription = json.data.description || '';
          scrapedImage = json.data.image?.url || '';
          scrapedPublisher = json.data.publisher || '';

          // Look for price in description or title
          const textToSearch = `${scrapedTitle} ${scrapedDescription}`;
          const priceMatch = textToSearch.match(/R\$\s*([0-9.]+)(?:,([0-9]{2}))?/i);
          if (priceMatch) {
            const cleanNum = priceMatch[1].replace(/\./g, '') + (priceMatch[2] ? '.' + priceMatch[2] : '');
            const parsed = parseFloat(cleanNum);
            if (!isNaN(parsed) && parsed > 5) {
              scrapedPrice = parsed;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Microlink error, falling back to smart slug parser:', err);
  }

  // 2. Parse smart data from URL slug and domain
  const slugData = parseFromUrlSlug(url);
  
  // Decide which name to use
  let finalName = '';
  if (scrapedTitle && !isInvalidTitle(scrapedTitle)) {
    finalName = cleanTitle(scrapedTitle);
  } else if (slugData.name) {
    finalName = slugData.name;
  } else {
    finalName = 'Item da Loja Online';
  }

  // Brand inference
  const detectedBrand = slugData.brand || inferBrand(`${finalName} ${scrapedDescription}`, new URL(url).hostname);
  const detectedRoom = slugData.room || inferRoomFromText(`${finalName} ${scrapedDescription}`);
  
  // Specs: combine scraped description or slug specs
  let finalSpecs = slugData.specs;
  if (!finalSpecs && scrapedDescription && !isInvalidTitle(scrapedDescription)) {
    finalSpecs = scrapedDescription.substring(0, 140).trim() + '...';
  } else if (slugData.specs && scrapedDescription && !isInvalidTitle(scrapedDescription)) {
    finalSpecs = `${slugData.specs} • ${scrapedDescription.substring(0, 80)}...`;
  }

  // 3. If Gemini API Key is configured, make it even smarter
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      const prompt = `Analise este produto para casal de noivos:
URL: ${url}
Título: ${finalName}
Especificações: ${finalSpecs || ''}

Retorne ESTRITAMENTE este JSON:
{
  "name": "Nome limpo e amigável do produto (sem códigos chatos, ex: Smart TV 55' Samsung Neo QLED 4K + Soundbar)",
  "brand": "Marca",
  "estimatedPrice": número ou null,
  "room": "Sala de Estar" ou "Cozinha" ou "Quarto do Casal" ou "Banheiro" ou "Área de Serviço" ou "Escritório / Varanda",
  "priority": "Essencial" ou "Alta" ou "Média" ou "Baixa",
  "specs": "Principais especificações em 1 frase elegante"
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            name: parsed.name || finalName,
            brand: parsed.brand || detectedBrand,
            estimatedPrice: parsed.estimatedPrice || scrapedPrice,
            room: parsed.room || detectedRoom,
            priority: parsed.priority || slugData.priority || 'Alta',
            specs: parsed.specs || finalSpecs,
            storeName: scrapedPublisher,
            imageUrl: scrapedImage
          };
        }
      }
    } catch (e) {
      console.warn('Gemini parser fallback:', e);
    }
  }

  return {
    name: finalName,
    brand: detectedBrand,
    estimatedPrice: scrapedPrice,
    room: detectedRoom,
    priority: slugData.priority || 'Alta',
    specs: finalSpecs,
    storeName: scrapedPublisher,
    imageUrl: scrapedImage
  };
}

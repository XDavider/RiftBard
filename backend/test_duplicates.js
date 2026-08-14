import fetch from 'node-fetch';

async function test() {
  let allCards = [];
  console.log('Fetching...');
  const res = await fetch(`https://api.riftcodex.com/cards?page=1`);
  const data = await res.json();
  const pages = data.pages || 1;
  for(let i = 1; i <= pages; i++) {
    const r = await fetch(`https://api.riftcodex.com/cards?page=${i}`);
    const d = await r.json();
    let cards = d.data || d.cards || d.items || d;
    allCards = allCards.concat(cards);
  }
  
  const imageToNames = new Map();
  for (const card of allCards) {
    const imageUrl = (card.media && card.media.image_url) || card.image_url || card.imageUrl || card.image || (card.assets && card.assets[0] && card.assets[0].gameAbsolutePath) || '';
    const name = card.name || 'Unknown Name';
    if (imageUrl) {
      if (!imageToNames.has(imageUrl)) imageToNames.set(imageUrl, new Set());
      imageToNames.get(imageUrl).add(name);
    }
  }

  const groupedCards = new Map();
  for (const card of allCards) {
    const name = card.name || 'Unknown Name';
    const setName = (card.set && card.set.label) || (typeof card.set === 'string' ? card.set : null) || card.set_name || card.setRef || 'Promo';
    const key = `${name}:::${setName}`;
    if (!groupedCards.has(key)) groupedCards.set(key, []);
    groupedCards.get(key).push(card);
  }

  for (const [key, cards] of groupedCards.entries()) {
    if (cards.length > 1 && (key.includes('Akali, Silent') || key.includes('Shen, Scourge of Shadows'))) {
      console.log(`Found ${cards.length} duplicates for ${key}`);
      for (const c of cards) {
        const imageUrl = (c.media && c.media.image_url) || c.image_url || c.imageUrl || c.image || (c.assets && c.assets[0] && c.assets[0].gameAbsolutePath) || '';
        const distinctNamesCount = imageToNames.get(imageUrl).size;
        console.log(`- ID: ${c.id}, DistinctNames: ${distinctNamesCount}, Names: ${Array.from(imageToNames.get(imageUrl)).join(', ')}, Image: ${imageUrl}`);
      }
    }
  }
}
test();

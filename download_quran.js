const fs = require('fs');

async function download() {
  const pages = {};
  console.log("Kuran verisi indiriliyor (604 sayfa)...");
  for(let i = 1; i <= 604; i++) {
    let success = false;
    while (!success) {
      try {
        const res = await fetch(`https://api.quran.com/api/v4/verses/by_page/${i}?words=true&word_fields=text_uthmani,line_number,char_type_name`);
        if (!res.ok) throw new Error("HTTP error " + res.status);
        const data = await res.json();
        pages[i] = data.verses;
        success = true;
      } catch (e) {
        console.log(`Hata sayfa ${i}, tekrar deneniyor...`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    if (i % 50 === 0) console.log(`İndirilen sayfa: ${i}/604`);
    await new Promise(r => setTimeout(r, 30)); // Rate limit koruması
  }
  fs.mkdirSync('./public/data', { recursive: true });
  fs.writeFileSync('./public/data/quran.json', JSON.stringify(pages));
  console.log("İndirme tamamlandı! public/data/quran.json oluşturuldu.");
}

download();

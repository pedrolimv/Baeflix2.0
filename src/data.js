import { publicAsset } from './assets';

export const moments = [
  { id: 'first', title: 'Onde tudo começou', subtitle: 'O primeiro de muitos capítulos.', year: 1, category: 'Nós dois', duration: 'Uma lembrança', image: publicAsset('/images/memories.png'), frame: 0, position: 'center', description: 'Aquele frio na barriga, as primeiras conversas e um encontro que mudou tudo. Algumas histórias começam sem avisar. A nossa começou assim.', tag: 'O PRIMEIRO ENCONTRO' },
  { id: 'sea', title: 'Só nós e o mar', subtitle: 'O nosso lugar no mundo.', year: 2, category: 'Viagens', duration: 'Uma lembrança', image: publicAsset('/images/memories.png'), frame: 1, description: 'Pés na areia, o barulho das ondas e você do meu lado. Nem precisava de destino: estar junto sempre foi a melhor parte da viagem.', tag: 'PÉ NA AREIA' },
  { id: 'little', title: 'Nos pequenos detalhes', subtitle: 'A felicidade mora aqui.', year: 3, category: 'Nós dois', duration: 'Uma lembrança', image: publicAsset('/images/memories.png'), frame: 2, description: 'Um café dividido, uma risada fora de hora, um abraço no fim do dia. Os momentos mais simples se tornaram os nossos favoritos.', tag: 'VIDA A DOIS' },
  { id: 'road', title: 'Qualquer lugar com você', subtitle: 'Vamos colecionar caminhos.', year: 2, category: 'Viagens', duration: 'Uma lembrança', image: publicAsset('/images/memories.png'), frame: 3, description: 'As playlists, os caminhos errados e as paradas inesperadas. Quando a companhia é você, até o trajeto vira uma lembrança boa.', tag: 'NA ESTRADA' },
  { id: 'forever', title: 'Ainda é só o começo', subtitle: 'A próxima temporada é nossa.', year: 4, category: 'Nós dois', duration: 'Uma lembrança', image: publicAsset('/images/hero.png'), description: 'Quatro anos de uma história que eu escolheria viver de novo. E de novo. Obrigado por fazer da minha vida o nosso lugar favorito.', tag: '4 ANOS DE NÓS' },
  { id: 'sunset', title: 'Até o último pôr do sol', subtitle: 'O tempo para quando estamos juntos.', year: 4, category: 'Viagens', duration: 'Uma lembrança', image: publicAsset('/images/memories.png'), frame: 4, description: 'A luz vai embora devagar, mas essa lembrança fica. Que a gente nunca perca a vontade de ver o mundo lado a lado.', tag: 'GOLDEN HOUR' },
  { id: 'city', title: 'Perdidos por aí', subtitle: 'Sem roteiro. Com você.', year: 1, category: 'Viagens', duration: 'Uma lembrança', image: publicAsset('/images/memories.png'), frame: 5, description: 'Novas ruas, novos sabores e histórias para contar. O melhor de descobrir o mundo é poder dividir cada descoberta com você.', tag: 'NOSSA AVENTURA' },
  { id: 'home', title: 'Você é meu lugar', subtitle: 'O melhor final de todos os dias.', year: 3, category: 'Nós dois', duration: 'Uma lembrança', image: publicAsset('/images/memories.png'), frame: 0, description: 'Tem dias em que tudo o que a gente precisa é ficar em casa, escolher um filme e abraçar quem faz a vida ficar mais leve.', tag: 'FEITO DE AMOR' },
];

export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('baeflix-memories', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('moments', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readMemories() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('moments', 'readonly');
    const request = transaction.objectStore('moments').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}
export async function saveMemory(memory) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('moments', 'readwrite');
    transaction.objectStore('moments').put(memory);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}

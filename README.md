# Baeflix

Um presente para quatro anos de namoro, de **22/10/2022 a 22/10/2026**. Uma experiência de streaming romântica em português, com catálogo, quatro temporadas, seleção de perfil, busca, favoritos e reprodução das lembranças.

## Executar

Requer Node.js 22 ou 24 e npm.

```sh
cd /workspace/Baeflix2.0
npm ci
npm run dev -- --port 5173
```

```sh
npm run build
npm run preview -- --port 4173
```

O build estático é gerado em `dist/`. Não há backend nem credenciais necessárias.

## Colocar a história de vocês

- Abra o menu do coração no canto superior direito e selecione **Personalizar Baeflix** para editar o nome do casal, a data inicial e a mensagem.
- Use **Adicionar lembrança** para selecionar fotos ou vídeos, título, descrição, temporada e coleção. Uma foto de capa para vídeos é opcional.
- A primeira lembrança de vídeo adicionada vira o destaque principal. Na ausência de vídeos, a foto adicionada mais recentemente vira o destaque.
- Use o **+** nos cartões para guardar os favoritos em **Minha lista**.

Os arquivos enviados são armazenados em IndexedDB **somente no navegador e na origem em que foram adicionados**. Preferências e favoritos ficam em localStorage. Recarregar preserva os dados, mas limpar o armazenamento do navegador os remove. Abrir outro dispositivo ou outro endereço não transfere a coleção. Preserve os arquivos originais.

As imagens iniciais foram geradas como exemplos e não representam o casal. Sem vídeos adicionados, o botão de reprodução exibe uma prévia animada da imagem, identificada como exemplo. Vídeos reais usam o player HTML5; MP4 com H.264 ou WebM são as opções recomendadas.

## Preparar um presente que possa ser compartilhado

O upload local serve para montar e testar a experiência. Para a namorada abrir a coleção em outro celular, os vídeos e imagens precisam fazer parte do site publicado ou de um armazenamento remoto.

O helper `publicAsset`, já importado em `src/data.js`, preserva o caminho correto no GitHub Pages. Uma opção estática é colocar os arquivos em `public/media/` e substituir os exemplos em `src/data.js` por entradas como:

```js
{
  id: 'primeira-viagem',
  title: 'Nossa primeira viagem',
  description: 'Uma descrição do momento de vocês.',
  year: 1,
  category: 'Viagens',
  duration: '3 min',
  image: publicAsset('/media/primeira-viagem.jpg'),
  media: publicAsset('/media/primeira-viagem.mp4'),
  isVideo: true,
  custom: true,
  tag: 'NOSSA MEMÓRIA'
}
```

Para alterar também o vídeo principal da versão estática, ajuste `featured` em `src/main.jsx` para apontar para essa entrada. Depois execute `npm run build` e hospede `dist/`. A hospedagem precisa aceitar o tamanho dos vídeos e requisições de mídia. Arquivos de um site público podem ser acessados por quem conhece seus URLs; um presente privado exige controle de acesso no servidor ou na hospedagem.

## Organização

- `src/main.jsx`: telas, navegação, player e formulários.
- `src/data.js`: exemplos do catálogo e armazenamento local.
- `src/styles.css`: layout responsivo e estética da coleção.
- `public/images/`: imagens de exemplo locais, sem dependência de servidores de fotos.

Fontes e ícones também são empacotados localmente. O funcionamento não depende de APIs externas.

## Validação realizada

Build de produção e testes reais com Chromium: layout desktop e mobile, imagens, detalhes, prévia animada, busca, resultado vazio, persistência de favoritos, personalização, data inicial, persistência de fotos após recarregar, upload e reprodução de um WebM real, e seleção de perfil. O armazenamento entre dispositivos ainda não está implementado.


## GitHub Pages

A publicação automática está configurada em `.github/workflows/deploy-pages.yml`.

1. Envie o projeto para a branch `main` de `pedrolimv/Baeflix2.0`.
2. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
3. Em **Actions**, acompanhe **Deploy Baeflix to GitHub Pages**. Caso o primeiro run tenha ocorrido antes de ativar Pages, execute-o novamente com **Run workflow**.
4. Após a implantação bem-sucedida, o endereço esperado é `https://pedrolimv.github.io/Baeflix2.0/`.

O build usa caminhos relativos, incluindo fotos, fontes e favicon. Os uploads feitos pelo navegador continuam locais: publicar no Pages não envia essas lembranças ao repositório. Para que sua namorada veja os mesmos vídeos, inclua-os na versão estática ou use armazenamento remoto. GitHub Pages publica um site acessível pela Internet; arquivos publicados não têm proteção por senha neste projeto.

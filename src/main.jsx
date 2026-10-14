import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Plus, Check, ChevronDown, ChevronLeft, ChevronRight, Search, Bell, X, Info, Heart, Upload, Settings, ArrowLeft, Pause, Maximize, Volume2, VolumeX, Pencil, Film, Image, CheckCircle2 } from 'lucide-react';
import { moments, readMemories, saveMemory } from './data';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-sans/800.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import './styles.css';
import { publicAsset } from './assets';

const featured = { ...moments[4], title: 'A nossa melhor série.' };
const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const initialPersonal = { names: 'Nós dois', date: '2022-10-22', message: 'Algumas histórias merecem ser vividas. A nossa merece ser revivida.' };

function App() {
  const [page, setPage] = useState('Início');
  const [saved, setSaved] = useState(() => readJSON('baeflix-list', []));
  const [personal, setPersonal] = useState(() => readJSON('baeflix-personal', initialPersonal));
  const [custom, setCustom] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [toast, setToast] = useState('');
  const [year, setYear] = useState('Todos');
  const [scrolled, setScrolled] = useState(false);
  const catalog = [...custom, ...moments];
  const feature = custom.find(item => item.isVideo) || custom[0] || featured;
  useEffect(() => {
    let disposed = false; const urls = [];
    readMemories().then(items => { if (disposed) return; setCustom(items.map(item => {
      const media = URL.createObjectURL(item.file); urls.push(media);
      const cover = item.cover ? URL.createObjectURL(item.cover) : null; if (cover) urls.push(cover);
      return { ...item, media, image: cover || (item.file.type.startsWith('image/') ? media : publicAsset('/images/hero.png')), isVideo: item.file.type.startsWith('video/'), custom: true };
    })); }).catch(() => notify('Não foi possível carregar as lembranças deste navegador.'));
    return () => { disposed = true; urls.forEach(url => URL.revokeObjectURL(url)); };
  }, []);
  useEffect(() => { localStorage.setItem('baeflix-list', JSON.stringify(saved)); }, [saved]);
  useEffect(() => { const handler = () => setScrolled(window.scrollY > 30); window.addEventListener('scroll', handler); return () => window.removeEventListener('scroll', handler); }, []);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3500); return () => clearTimeout(id); }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => document.querySelector('.modal-shell button, .profile-screen button')?.focus());
    const handler = event => {
      if (event.key === 'Escape') setModal(null);
      if (event.key === 'Tab') {
        const elements = [...document.querySelectorAll('.modal-shell button, .modal-shell input, .modal-shell textarea, .modal-shell select, .profile-screen button')].filter(e => !e.disabled);
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => { cancelAnimationFrame(frame); document.body.style.overflow = ''; window.removeEventListener('keydown', handler); previous?.focus(); };
  }, [modal]);
  function notify(text) { setToast(text); }
  function toggleSaved(item) { setSaved(previous => previous.includes(item.id) ? previous.filter(id => id !== item.id) : [...previous, item.id]); }
  function showDetails(item) { setSelected(item); setModal('details'); }
  function play(item) { setSelected(item); setModal('player'); }
  function navigate(next) { setPage(next); setYear('Todos'); setSearch(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  async function addMemory(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const file = form.get('file'); const cover = form.get('cover');
    if (!file?.size) { notify('Escolha uma foto ou um vídeo para a lembrança.'); return; }
    if (!/^(image|video)\//.test(file.type)) { notify('Selecione um arquivo de imagem ou vídeo.'); return; }
    const item = { id: crypto.randomUUID(), title: form.get('title').trim(), description: form.get('description').trim(), year: Number(form.get('year')), category: form.get('category'), duration: file.type.startsWith('video/') ? 'Vídeo' : 'Foto', tag: 'NOSSA MEMÓRIA', file, cover: cover?.size ? cover : null };
    try {
      await saveMemory(item); const media = URL.createObjectURL(file);
      setCustom(previous => [{ ...item, media, image: item.cover ? URL.createObjectURL(item.cover) : file.type.startsWith('image/') ? media : publicAsset('/images/hero.png'), custom: true, isVideo: file.type.startsWith('video/') }, ...previous]);
      setModal(null); notify('Uma nova lembrança para a nossa história.'); navigate('Nossos momentos');
    } catch { notify('Não foi possível salvar. Verifique o espaço disponível no navegador.'); }
  }
  const filtered = catalog.filter(item => (page !== 'Minha lista' || saved.includes(item.id)) && (page !== 'Viagens' || item.category === 'Viagens') && (year === 'Todos' || item.year === Number(year)) && `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  const isHome = page === 'Início' && !search;

  return <>
    <header className={`header ${scrolled || !isHome ? 'solid' : ''}`}>
      <button className="wordmark" onClick={() => navigate('Início')} aria-label="Baeflix início">BAEFLIX</button>
      <nav aria-label="Navegação principal">{['Início', 'Nossos momentos', 'Viagens', 'Minha lista'].map(tab => <button key={tab} className={page === tab ? 'active' : ''} onClick={() => navigate(tab)}>{tab}</button>)}</nav>
      <div className="header-actions">
        <div className={`search-box ${searchOpen ? 'open' : ''}`}><button className="icon-button" aria-label="Buscar lembranças" onClick={() => setSearchOpen(value => !value)}><Search size={21}/></button>{searchOpen && <input autoFocus aria-label="Buscar por título ou descrição" placeholder="Títulos, momentos…" value={search} onChange={e => setSearch(e.target.value)}/>}</div>
        <span className="just-us">Só nós dois</span>
        <div className="menu-wrap"><button className="icon-button notification-button" aria-label="Notificações" onClick={() => { setNotifications(!notifications); setProfileMenu(false); }}><Bell size={21}/><i/></button>{notifications && <div className="dropdown notification-menu"><Heart size={22}/><strong>A nossa nova temporada chegou.</strong><p>4 anos de amor. E tantos capítulos pela frente.</p><button onClick={() => { setNotifications(false); play(feature); }}>Rever a nossa história <ChevronRight size={15}/></button></div>}</div>
        <div className="menu-wrap"><button className="profile-button" aria-label="Abrir menu do perfil" aria-expanded={profileMenu} onClick={() => { setProfileMenu(!profileMenu); setNotifications(false); }}><span className="avatar"><Heart size={21} fill="currentColor"/></span><ChevronDown size={14}/></button>{profileMenu && <div className="dropdown"><strong>{personal.names}</strong><button onClick={() => { setModal('profiles'); setProfileMenu(false); }}><Heart size={16}/> Trocar perfil</button><button onClick={() => { setModal('settings'); setProfileMenu(false); }}><Pencil size={16}/> Personalizar Baeflix</button><button onClick={() => { setModal('upload'); setProfileMenu(false); }}><Plus size={16}/> Adicionar lembrança</button><button onClick={() => { navigate('Nossos momentos'); setProfileMenu(false); }}><Film size={16}/> Nossos momentos</button><button onClick={() => { navigate('Viagens'); setProfileMenu(false); }}><Heart size={16}/> Viagens</button></div>}</div>
      </div>
    </header>

    <main>
      {isHome ? <>
        <section className="hero" aria-label="Destaque: nossa história">
          <img className="hero-photo" src={feature.image} alt="Capa da nossa história"/>
          <div className="hero-shade"/>
          <div className="hero-content">
            <div className="original-label"><span>B</span> ORIGINAL BAEFLIX</div>
            <h1>A nossa<br/>melhor série<span>.</span></h1>
            <div className="hero-ranking"><span className="top-badge">TOP<br/><b>1</b></span><strong>Há 4 anos no topo da minha lista</strong></div>
            <p>{personal.message}<br/><span>4 temporadas. Infinitas memórias. Um amor só nosso.</span></p>
            <div className="hero-buttons"><button className="button light" onClick={() => play(feature)}><Play size={23} fill="currentColor"/> Assistir nossa história</button><button className="button glass" onClick={() => showDetails(feature)}><Info size={24}/> Mais informações</button></div>
          </div>
          <div className="hero-caption"><span>UMA HISTÓRIA SEM FINAL</span><Heart size={14}/><span className="rating">L</span></div>
        </section>

        <div className="catalog-home">
          <Row title="Os nossos favoritos" subtitle="Aqueles que a gente nunca cansa de rever" items={[moments[0], moments[1], moments[2], moments[3], moments[5], moments[6]]} onOpen={showDetails} saved={saved} onSave={toggleSaved}/>
          <section className="anniversary-strip"><div className="anniversary-icon"><Heart size={25}/></div><div><span>22 DE OUTUBRO DE 2026 · FELIZ NOSSO DIA</span><h2>4 anos. E eu ainda escolheria você.</h2><p>O melhor da nossa história é tudo o que ainda vamos viver.</p></div><button onClick={() => { setPage('Nossos momentos'); setYear('4'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Rever nossa última temporada <ChevronRight size={18}/></button><span className="anniversary-number">04</span></section>
          <Row title="Um amor, quatro temporadas" subtitle="Cada ano, um novo capítulo da gente" items={[moments[0], moments[3], moments[2], moments[4]]} onOpen={showDetails} saved={saved} onSave={toggleSaved} seasons/>
          {custom.length > 0 && <Row title="Acabaram de chegar" subtitle="Novas lembranças da nossa história" items={custom} onOpen={showDetails} saved={saved} onSave={toggleSaved}/>}
          <Row title="Nosso próximo destino: juntos" subtitle="O mundo fica mais bonito ao seu lado" items={moments.filter(item => item.category === 'Viagens')} onOpen={showDetails} saved={saved} onSave={toggleSaved}/>
          <section className="add-banner"><div><Film size={26}/><h3>A nossa história continua.</h3><p>Tem um momento que merece entrar nessa coleção?</p></div><button className="button outline" onClick={() => setModal('upload')}><Plus size={18}/> Adicionar lembrança</button></section>
        </div>
      </> : <section className="collection"><div className="collection-heading"><div><span className="eyebrow">NOSSA COLEÇÃO</span><h1>{search ? `Resultados para “${search}”` : page}</h1><p>{page === 'Minha lista' ? 'As lembranças que você quer guardar por perto.' : 'Cada momento, um motivo para apertar o play de novo.'}</p></div><button className="button outline" onClick={() => setModal('upload')}><Plus size={18}/> Adicionar lembrança</button></div><div className="filters" aria-label="Filtrar por temporada">{['Todos', '1', '2', '3', '4'].map(value => <button key={value} className={year === value ? 'selected' : ''} onClick={() => setYear(value)}>{value === 'Todos' ? 'Todas as temporadas' : `${value}ª temporada`}</button>)}</div>{filtered.length ? <div className="collection-grid">{filtered.map(item => <Card key={item.id} item={item} onOpen={showDetails} saved={saved} onSave={toggleSaved}/>)}</div> : <div className="empty-state"><Heart size={40}/><h2>{page === 'Minha lista' && !search ? 'Seus favoritos moram aqui.' : 'Nenhuma lembrança encontrada.'}</h2><p>{page === 'Minha lista' ? 'Toque no + de um momento para adicioná-lo à sua lista.' : 'Experimente outro título ou outra temporada.'}</p><button className="button light" onClick={() => navigate('Início')}>Explorar momentos</button></div>}</section>}
    </main>
    <footer><div className="footer-brand"><span className="wordmark">BAEFLIX</span><span>A nossa história. Sempre em cartaz.</span></div><div className="footer-links"><button onClick={() => setModal('settings')}>Feito para nós</button><button onClick={() => setModal('upload')}>Adicionar momentos</button><button onClick={() => setModal('privacy')}>Sobre esta coleção</button></div><div className="footer-bottom"><span>Feito com <Heart size={11} fill="currentColor"/> para o nosso amor.</span><span>© {new Date().getFullYear()} Baeflix · Edição de aniversário</span></div></footer>
    {toast && <div className="toast" role="status"><CheckCircle2 size={20}/>{toast}</div>}

    {modal && <div className="modal-backdrop" onClick={() => setModal(null)}>
      {modal === 'profiles' ? <div className="profile-screen" role="dialog" aria-modal="true" aria-label="Escolha um perfil" onClick={e => e.stopPropagation()}><button className="close-button" aria-label="Fechar" onClick={() => setModal(null)}><X/></button><span className="wordmark">BAEFLIX</span><h1>Quem vai reviver essa história?</h1><div className="profile-choices"><button onClick={() => setModal(null)}><span className="large-avatar"><Heart size={60} fill="currentColor"/></span>{personal.names}</button><button onClick={() => setModal(null)}><span className="large-avatar together">04<span>ANOS DE NÓS</span></span>Nós, para sempre</button></div><button className="button outline" onClick={() => setModal('settings')}>Personalizar perfis</button></div> : <div className={`modal-shell ${modal === 'player' ? 'player-shell' : ''} ${modal === 'details' ? 'details-shell' : ''}`} role="dialog" aria-modal="true" aria-label={modal === 'details' || modal === 'player' ? selected?.title : modal === 'upload' ? 'Adicionar lembrança' : 'Personalizar Baeflix'} onClick={e => e.stopPropagation()}>
        <button className="close-button" aria-label="Fechar" onClick={() => setModal(null)}><X size={22}/></button>
        {modal === 'details' && <><div className="details-cover"><Picture item={selected} alt={selected.title}/><div/><h2>{selected.title}</h2></div><div className="details-body"><div className="details-actions"><button className="button light" onClick={() => play(selected)}><Play fill="currentColor" size={20}/> {selected.isVideo ? 'Assistir' : 'Rever lembrança'}</button><button className={`circle-button ${saved.includes(selected.id) ? 'is-saved' : ''}`} aria-label={saved.includes(selected.id) ? 'Remover da minha lista' : 'Adicionar à minha lista'} onClick={() => toggleSaved(selected)}>{saved.includes(selected.id) ? <Check/> : <Plus/>}</button><Heart size={22} className="detail-heart"/></div><div className="metadata"><span className="match">100% nosso amor</span><span>{selected.year}ª temporada</span><span className="small-rating">L</span><span>{selected.duration}</span><span className="hd">HD</span></div><p className="description">{selected.description}</p><div className="detail-facts"><p><span>Estrelando:</span> {personal.names}</p><p><span>Gênero:</span> Romance, vida real, {selected.category.toLowerCase()}</p><p><span>Esta história é:</span> A nossa favorita</p></div>{!selected.custom && <div className="example-note"><Image size={16}/><span>Lembrança de exemplo. Adicione suas fotos e vídeos para deixar tudo com a cara de vocês.</span><button onClick={() => setModal('upload')}>Adicionar</button></div>}</div></>}
        {modal === 'player' && <Player item={selected} onBack={() => setModal('details')} onUpload={() => setModal('upload')}/>}
        {modal === 'upload' && <form className="form-content" onSubmit={addMemory}><span className="eyebrow">MAIS UM CAPÍTULO</span><h2>Adicionar lembrança</h2><p>Os nossos melhores momentos merecem estar aqui.</p><label className="upload-zone"><Upload size={30}/><strong>Escolha uma foto ou um vídeo</strong><span>MP4, WebM, JPG, PNG · Salvo neste navegador</span><input name="file" type="file" accept="image/*,video/*" required onChange={e => { e.currentTarget.closest('label').querySelector('strong').textContent = e.target.files[0]?.name || 'Escolha uma foto ou um vídeo'; }}/></label><label>Título<input name="title" placeholder="Ex.: Nossa primeira viagem" required maxLength={70}/></label><div className="form-row"><label>Temporada<select name="year">{[1,2,3,4].map(n => <option key={n} value={n}>{n}º ano de namoro</option>)}</select></label><label>Coleção<select name="category"><option>Nós dois</option><option>Viagens</option></select></label></div><label>Sobre esse momento<textarea name="description" placeholder="O que fez esse dia ser especial?" rows={3}/></label><label>Capa para o vídeo <span className="optional">(opcional)</span><input type="file" name="cover" accept="image/*"/></label><button type="submit" className="button red"><Plus size={19}/> Guardar lembrança</button><small>Os arquivos ficam somente neste navegador. Guarde também os originais; ainda não há sincronização entre dispositivos.</small></form>}
        {modal === 'settings' && <form className="form-content" onSubmit={e => { e.preventDefault(); const values = new FormData(e.currentTarget); const next = { names: values.get('names').trim(), date: values.get('date'), message: values.get('message').trim() }; setPersonal(next); localStorage.setItem('baeflix-personal', JSON.stringify(next)); setModal(null); notify('Agora a Baeflix ficou ainda mais nossa.'); }}><span className="eyebrow">FEITO PARA VOCÊS</span><h2>A história tem os nossos nomes.</h2><p>Dê o seu toque pessoal à Baeflix.</p><label>Nome do casal ou do perfil<input name="names" required defaultValue={personal.names} maxLength={50}/></label><label>O dia em que tudo começou<input name="date" type="date" defaultValue={personal.date}/></label><label>Uma frase para a tela inicial<textarea name="message" rows={3} required maxLength={180} defaultValue={personal.message}/></label><button className="button red" type="submit"><Check size={18}/> Salvar personalização</button><small>A edição celebra quatro anos de namoro. A data fica registrada no seu perfil neste navegador.</small></form>}
        {modal === 'privacy' && <div className="form-content"><Heart size={35} className="red-text"/><h2>Uma coleção só nossa.</h2><p>A Baeflix é um presente para celebrar quatro anos de namoro, inspirado nas nossas maratonas favoritas.</p><p>As imagens e histórias iniciais são exemplos. Suas fotos, vídeos, favoritos e personalização ficam armazenados neste navegador, sem envio a um servidor.</p><p>Para compartilhar a coleção em outro dispositivo, será necessário adicionar armazenamento e hospedagem. Preserve os arquivos originais: limpar os dados do navegador remove as lembranças locais.</p><button className="button red" onClick={() => setModal('upload')}>Adicionar nossa primeira lembrança</button></div>}
      </div>}
    </div>}
  </>;
}

function Row({ title, subtitle, items, onOpen, saved, onSave, seasons = false }) {
  const ref = useRef(); const [position, setPosition] = useState(0);
  return <section className={`row-section ${seasons ? 'seasons-section' : ''}`}><div className="row-heading"><div><h2>{title}<ChevronRight size={18}/></h2><p>{subtitle}</p></div><div className="row-controls"><div className="row-dots">{[0,1,2].map(n => <i key={n} className={n === position ? 'active' : ''}/>)}</div><button aria-label={`Anteriores: ${title}`} onClick={() => { ref.current.scrollBy({ left: -ref.current.clientWidth * .8, behavior: 'smooth' }); }}><ChevronLeft size={18}/></button><button aria-label={`Próximos: ${title}`} onClick={() => { ref.current.scrollBy({ left: ref.current.clientWidth * .8, behavior: 'smooth' }); }}><ChevronRight size={18}/></button></div></div><div className="card-row" ref={ref} onScroll={() => { const e=ref.current; const extent=e.scrollWidth-e.clientWidth; setPosition(extent > 0 ? Math.round(e.scrollLeft/extent*2) : 0); }}>{items.map((item,index) => <Card key={item.id} item={item} onOpen={onOpen} saved={saved} onSave={onSave} season={seasons ? index+1 : null}/>)}</div></section>;
}
function Picture({ item, alt, lazy = false, className = '' }) {
  const atlas = item.frame !== undefined;
  const style = atlas ? { left: `${-(item.frame % 3) * 100}%`, top: `${-Math.floor(item.frame / 3) * 100}%` } : { objectPosition: item.position || 'center' };
  return <span className={`media-image ${atlas ? 'atlas' : ''} ${className}`}><img src={item.image} alt={alt} loading={lazy ? 'lazy' : undefined} style={style}/></span>;
}
function Card({ item, onOpen, saved, onSave, season }) {
  return <article className={`card ${season ? 'season-card' : ''}`}><button className="card-main" onClick={() => onOpen(item)} aria-label={`Ver ${item.title}`}><Picture item={item} alt="" lazy/><div className="card-gradient"/><span className="card-brand">B</span>{season ? <div className="season-text"><span>TEMPORADA</span><strong>0{season}</strong><p>{['O começo de tudo', 'O mundo é nosso', 'Amor nos detalhes', 'Para sempre, nós'][season-1]}</p></div> : <div className="card-title"><span>{item.tag}</span><h3>{item.title}</h3></div>}<span className="card-play"><Play size={21} fill="currentColor"/></span>{item.custom && <span className="new-badge">NOVO</span>}</button>{!season && <div className="card-bottom"><span>{item.year}ª temporada <i/> {item.category}</span><button aria-label={`${saved.includes(item.id) ? 'Remover' : 'Adicionar'} ${item.title} ${saved.includes(item.id) ? 'da' : 'à'} minha lista`} className={saved.includes(item.id) ? 'is-saved' : ''} onClick={() => onSave(item)}>{saved.includes(item.id) ? <Check size={16}/> : <Plus size={16}/>}</button></div>}</article>;
}

function Player({ item, onBack, onUpload }) {
  const [playing, setPlaying] = useState(false); const [progress, setProgress] = useState(0); const [muted, setMuted] = useState(false); const [mediaError, setMediaError] = useState(false); const video = useRef(); const area = useRef();
  const demo = !item.isVideo;
  useEffect(() => { if (!playing || !demo) return; const id=setInterval(() => setProgress(p => { if(p >= 100) { setPlaying(false); return 100; } return p+1; }), 180); return () => clearInterval(id); }, [playing, demo]);
  function toggle() { if (demo) { if (progress >= 100) setProgress(0); setPlaying(!playing); } else if (video.current.paused) video.current.play().then(() => setPlaying(true)).catch(() => setMediaError(true)); else { video.current.pause(); setPlaying(false); } }
  return <div className="player" ref={area}><div className="player-top"><button aria-label="Voltar aos detalhes" onClick={onBack}><ArrowLeft size={22}/></button><div><span>VOCÊ ESTÁ ASSISTINDO</span><h2>{item.title}</h2></div></div>{item.isVideo ? <video ref={video} src={item.media} poster={item.image} onTimeUpdate={() => setProgress(video.current.duration ? video.current.currentTime / video.current.duration * 100 : 0)} onEnded={() => setPlaying(false)} onError={() => setMediaError(true)} playsInline/> : <><Picture item={item} className={`memory-preview ${playing ? 'animate' : ''}`} alt={item.title}/><div className="preview-shade"/><div className="memory-caption"><Heart size={28}/><h2>{item.title}</h2><p>{item.description}</p>{!item.custom && <><span>Prévia com imagem de exemplo</span><button className="button glass" onClick={onUpload}><Plus size={16}/> Adicionar nosso vídeo</button></>}</div></>}{mediaError && <div className="player-error"><Film size={32}/><h3>Não foi possível reproduzir este vídeo.</h3><p>Tente um arquivo MP4 com vídeo H.264 ou WebM.</p><button className="button light" onClick={onUpload}>Escolher outro vídeo</button></div>}<div className="player-controls"><input aria-label="Posição da reprodução" type="range" min="0" max="100" value={progress} onChange={e => { setProgress(Number(e.target.value)); if (!demo && video.current.duration) video.current.currentTime = Number(e.target.value) / 100 * video.current.duration; }}/><div><button aria-label={playing ? 'Pausar' : 'Reproduzir'} onClick={toggle}>{playing ? <Pause size={25} fill="currentColor"/> : <Play size={25} fill="currentColor"/>}</button>{item.isVideo && <button aria-label={muted ? 'Ativar som' : 'Silenciar'} onClick={() => { video.current.muted = !muted; setMuted(!muted); }}>{muted ? <VolumeX/> : <Volume2/>}</button>}<span>{item.isVideo ? 'Nossa lembrança' : item.custom ? 'Nossa foto' : 'Prévia da lembrança'}</span><button className="fullscreen" aria-label="Tela cheia" onClick={() => { if (document.fullscreenElement) document.exitFullscreen?.(); else area.current.requestFullscreen?.().catch(() => {}); }}><Maximize size={22}/></button></div></div></div>;
}

createRoot(document.getElementById('root')).render(<App/>);

/* ================================================================
 * 我的音乐站 - 多音源聚合 PWA
 * 音源：网易云(meting) / QQ(tang) / 酷我(OIAPI) / JOOX
 * ================================================================ */
'use strict';

/* ---------------- 常量 ---------------- */
const API = {
  neteaseSearch: kw => `https://api.qijieya.cn/meting/?type=search&id=${encodeURIComponent(kw)}&limit=30&server=netease`,
  neteaseUrl: id => `https://api.qijieya.cn/meting/?server=netease&type=url&id=${encodeURIComponent(id)}`,
  neteaseLrc: id => `https://api.qijieya.cn/meting/?server=netease&type=lrc&id=${encodeURIComponent(id)}`,
  qqSearch: kw => `https://tang.api.s01s.cn/music_open_api.php?msg=${encodeURIComponent(kw)}&type=json`,
  qqDetail: (kw, mid) => `https://tang.api.s01s.cn/music_open_api.php?msg=${encodeURIComponent(kw)}&type=json&mid=${encodeURIComponent(mid)}`,
  kuwoSearch: (kw, limit) => `https://oiapi.net/api/Kuwo?msg=${encodeURIComponent(kw)}&page=1&limit=${encodeURIComponent(limit)}`,
  kuwoDetail: (kw, n) => `https://oiapi.net/api/Kuwo?msg=${encodeURIComponent(kw)}&n=${encodeURIComponent(n)}&br=1`,
  jooxSearch: kw => `https://apicx.asia/api/joox_music?msg=${encodeURIComponent(kw)}&token=f84ao9lMF_q7husBWRfgUw&br=4`,
  jooxDetail: (kw, n) => `https://apicx.asia/api/joox_music?msg=${encodeURIComponent(kw)}&n=${encodeURIComponent(n)}&token=f84ao9lMF_q7husBWRfgUw&br=4`,
};
const SOURCE_NAME = { netease: '网易云', qq: 'QQ', kuwo: '酷我', joox: 'JOOX' };
const MODE_ICON = { loop: '🔁', one: '🔂', random: '🔀' };
const MODE_NAME = { loop: '列表循环', one: '单曲循环', random: '随机播放' };
const LS_KEY = 'mystation.v1';
// 猜你喜欢：热门关键词池（与用户听过的歌手混合推荐）
const RECOMMEND_POOL = [
  '周杰伦', '林俊杰', '陈奕迅', '邓紫棋', '五月天', '薛之谦', '毛不易', '赵雷',
  '李荣浩', '周深', '王菲', '孙燕姿', '陶喆', '方大同', '田馥甄', '蔡健雅',
  'Taylor Swift', 'Adele', 'Ed Sheeran', 'Coldplay', 'Bruno Mars', 'Billie Eilish',
];
// 常见繁->简字符映射（覆盖歌手姓名与歌名高频字，用于跨源归一去重）
const T2S = {
  // 姓氏
  '吳': '吴', '陳': '陈', '劉': '刘', '楊': '杨', '黃': '黄', '趙': '赵', '馬': '马',
  '蔣': '蒋', '鄭': '郑', '馮': '冯', '衛': '卫', '許': '许', '盧': '卢', '賀': '贺',
  '譚': '谭', '羅': '罗', '龔': '龚', '龐': '庞', '顧': '顾', '萬': '万', '賴': '赖',
  '錢': '钱', '孫': '孙', '張': '张', '溫': '温', '閆': '闫', '閻': '阎', '齊': '齐',
  // 名字高频
  '倫': '伦', '憲': '宪', '傑': '杰', '謙': '谦', '鄧': '邓', '鳳': '凤', '儀': '仪',
  '賢': '贤', '詩': '诗', '語': '语', '瑤': '瑶', '瓊': '琼', '瑋': '玮', '穎': '颖',
  '彥': '彦', '樺': '桦', '嵐': '岚', '瀟': '潇', '靈': '灵', '蓮': '莲', '薇': '薇',
  // 歌名高频
  '愛': '爱', '戀': '恋', '夢': '梦', '無': '无', '風': '风', '雲': '云', '龍': '龙',
  '國': '国', '樂': '乐', '聲': '声', '歲': '岁', '時': '时', '間': '间', '為': '为',
  '後': '后', '長': '长', '離': '离', '別': '别', '斷': '断', '點': '点', '頭': '头',
  '髮': '发', '歸': '归', '還': '还', '來': '来', '說': '说', '誰': '谁', '們': '们',
  '這': '这', '裡': '里', '裏': '里', '見': '见', '覺': '觉', '聽': '听', '讀': '读',
  '寫': '写', '話': '话', '會': '会', '樣': '样', '纔': '才', '雙': '双', '單': '单',
  '對': '对', '錯': '错', '淚': '泪', '傷': '伤', '憶': '忆', '記': '记', '戰': '战',
  '勝': '胜', '敗': '败', '劍': '剑', '書': '书', '畫': '画', '詞': '词', '調': '调',
  '譜': '谱', '隊': '队', '團': '团', '聯': '联', '歡': '欢', '慶': '庆', '節': '节',
  '禮': '礼', '鳥': '鸟', '島': '岛', '橋': '桥', '門': '门', '園': '园', '場': '场',
  '館': '馆', '車': '车', '飛': '飞', '魚': '鱼', '貓': '猫', '龜': '龟', '蟲': '虫',
  '獨': '独', '幾': '几', '霧': '雾', '電': '电', '燈': '灯', '燭': '烛', '燦': '灿',
  '爛': '烂', '輝': '辉', '閃': '闪', '陽': '阳', '陰': '阴', '晝': '昼', '濤': '涛',
  '氣': '气', '煙': '烟', '冰': '冰', '凍': '冻', '魂': '魂', '虛': '虚', '實': '实',
  '滿': '满', '絕': '绝', '恆': '恒', '暫': '暂', '紀': '纪', '載': '载', '頁': '页',
  '陣': '阵', '勢': '势', '強': '强', '剛': '刚', '鋼': '钢', '鐵': '铁', '銅': '铜',
  '銀': '银', '財': '财', '寶': '宝', '貝': '贝', '翠': '翠', '紅': '红', '綠': '绿',
  '藍': '蓝', '蒼': '苍', '絹': '绢', '綾': '绫', '緞': '缎', '錦': '锦', '繡': '绣',
  '織': '织', '縫': '缝', '線': '线', '絲': '丝', '綿': '绵', '紗': '纱', '網': '网',
  '繩': '绳', '結': '结', '綁': '绑', '縛': '缚', '纏': '缠', '繞': '绕', '縱': '纵',
  '橫': '横', '豎': '竖', '彎': '弯', '疊': '叠', '偉': '伟', '歡': '欢', '傳': '传',
  '壞': '坏', '爺': '爷', '媽': '妈', '藍': '蓝', '鐘': '钟', '衛': '卫', '歌': '歌',
};
function artistKey(artist) {
  // 归一：trim + 小写 + 繁->简
  return String(artist || '').trim().toLowerCase()
    .replace(/[\u3400-\u9fff]/g, ch => T2S[ch] || ch);
}

/* ---------------- 状态 ---------------- */
const state = {
  searchKeyword: '',
  searchResults: [],          // 搜索结果（track 数组，交错排序）
  trackMap: new Map(),        // uid -> track
  enabledSources: { netease: true, qq: true, kuwo: true, joox: false },
  perSourceLimit: 10,
  searching: false,

  favorites: [],              // 收藏 track 数组
  playlists: [],              // [{id, name, tracks:[track]}]

  listView: 'recommend',      // 列表视图：recommend(猜你喜欢) | search(搜索结果)
  recommendTracks: [],        // 猜你喜欢列表
  recoKeywords: [],           // 本次推荐依据的关键词
  recoLoading: false,

  queue: { type: 'results', plId: null },   // 当前播放队列
  currentTrack: null,
  playMode: 'loop',
  lyrics: [],                 // [{time, text}]
  lyricLines: [],
  retryCount: 0,
};

/* ---------------- DOM ---------------- */
const $ = id => document.getElementById(id);
const dom = {
  searchInput: $('searchInput'), searchBtn: $('searchBtn'), searchStatus: $('searchStatus'),
  sourceChips: $('sourceChips'), limitSelect: $('limitSelect'),
  resultList: $('resultList'), resultCount: $('resultCount'),
  listTitle: $('listTitle'), btnRefreshReco: $('btnRefreshReco'), btnBackReco: $('btnBackReco'),
  favList: $('favList'), favCount: $('favCount'), userPlaylists: $('userPlaylists'),
  miniPlayer: $('miniPlayer'), miniArt: $('miniArt'), miniTitle: $('miniTitle'),
  miniArtist: $('miniArtist'), miniProgressBar: $('miniProgressBar'),
  miniPrev: $('miniPrev'), miniPlay: $('miniPlay'), miniNext: $('miniNext'), miniPlayIcon: $('miniPlayIcon'),
  pf: $('playerFullscreen'), pfBg: $('pfBg'), pfClose: $('pfClose'), pfFav: $('pfFav'),
  pfListName: $('pfListName'),
  pfTitle: $('pfTitle'), pfArtist: $('pfArtist'), pfSource: $('pfSource'), pfQuality: $('pfQuality'),
  pfTimeCur: $('pfTimeCur'), pfTimeDur: $('pfTimeDur'), pfSeek: $('pfSeek'),
  pfMode: $('pfMode'), pfPrev: $('pfPrev'), pfPlay: $('pfPlay'), pfNext: $('pfNext'), pfPlayIcon: $('pfPlayIcon'),
  pfVolume: $('pfVolume'), volWrap: document.querySelector('.pf-volume-wrap'),
  pfLyrics: $('pfLyrics'),
  modalMask: $('modalMask'), modalTitle: $('modalTitle'), modalBody: $('modalBody'), modalClose: $('modalClose'),
  toast: $('toast'),
  audio: $('audio'),
};

const ICON_PLAY = 'M8 5v14l11-7z';
const ICON_PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';

/* ---------------- 工具 ---------------- */
function toast(msg, ms = 1800) {
  dom.toast.textContent = msg;
  dom.toast.classList.remove('hidden');
  dom.toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { dom.toast.classList.add('hidden'); dom.toast.classList.remove('show'); }, ms);
}
const fmtTime = s => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};
const uidOf = t => t && t.uid;
function trackFromStored(t) {
  // 从 localStorage 恢复的 track，播放相关字段可能过期，标记需重取
  return Object.assign({ detailsLoaded: false, audioUrl: null, lrc: null }, t, { _stale: true });
}

/* ---------------- 持久化 ---------------- */
function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      favorites: state.favorites,
      playlists: state.playlists,
      playMode: state.playMode,
      enabledSources: state.enabledSources,
    }));
  } catch (e) { console.warn('save failed', e); }
}
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    state.favorites = (d.favorites || []).map(trackFromStored);
    state.playlists = (d.playlists || []).map(p => ({
      id: p.id, name: p.name, tracks: (p.tracks || []).map(trackFromStored),
    }));
    if (d.playMode && MODE_ICON[d.playMode]) state.playMode = d.playMode;
    if (d.enabledSources) state.enabledSources = Object.assign(state.enabledSources, d.enabledSources);
  } catch (e) { console.warn('load failed', e); }
}

/* ================================================================
 * 搜索
 * ================================================================ */
async function fetchJson(url, timeout = 12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally { clearTimeout(timer); }
}

async function searchNetease(kw) {
  const json = await fetchJson(API.neteaseSearch(kw));
  if (!Array.isArray(json)) return [];
  return json.map((it, idx) => {
    let songid = '';
    try { songid = new URL(it.url).searchParams.get('id') || ''; } catch (e) {}
    if (!songid) { const m = String(it.url || '').match(/[?&]id=(\d+)/); songid = m ? m[1] : `${kw}-${idx}`; }
    return {
      uid: `netease-${songid}`, source: 'netease', songid,
      title: it.name || '', artist: it.artist || '', album: '', keyword: kw,
      cover: it.pic || null, audioUrl: it.url || null, lrcUrl: it.lrc || null, lrc: null,
      detailsLoaded: false, displayIndex: idx + 1,
    };
  });
}

async function searchQQ(kw) {
  const json = await fetchJson(API.qqSearch(kw));
  const data = Array.isArray(json) ? json : (Array.isArray(json && json.data) ? json.data : []);
  // 过滤 VIP/付费歌曲（无法播放）
  return data.filter(it => it.song_mid && it.pay !== '付费' && it.pay !== 'VIP').map((it, idx) => ({
    uid: `qq-${it.song_mid}`, source: 'qq', songid: it.song_mid, songMid: it.song_mid,
    title: it.song_title || '', artist: it.singer_name || '', album: '', keyword: kw,
    cover: null, audioUrl: null, lrc: null, detailsLoaded: false,
    displayIndex: idx + 1, vipTag: it.pay === '付费' ? 'VIP' : null,
  }));
}

async function searchKuwo(kw, limit) {
  const json = await fetchJson(API.kuwoSearch(kw, limit));
  const data = Array.isArray(json && json.data) ? json.data : [];
  return data.filter(it => it.rid).map((it, idx) => ({
    uid: `kuwo-${it.rid}`, source: 'kuwo', songid: String(it.rid),
    title: it.song || '', artist: it.singer || '', album: it.album || '', keyword: kw,
    cover: it.picture || null, audioUrl: null, lrc: null, detailsLoaded: false,
    displayIndex: idx + 1,
  }));
}

async function searchJoox(kw) {
  const json = await fetchJson(API.jooxSearch(kw));
  const songs = (json && json.code === 200 && json.data && Array.isArray(json.data.songs)) ? json.data.songs : [];
  return songs.filter(it => (it.songmid || it['歌曲ID'])).map((it, idx) => ({
    uid: `joox-${it.songmid || it['歌曲ID']}`, source: 'joox',
    songid: String(it['歌曲ID'] || it.songmid || idx + 1), songMid: it.songmid || '',
    title: it['歌曲名称'] || '', artist: it['歌手'] || '', album: it['专辑'] || '', keyword: kw,
    cover: null, audioUrl: null, lrc: it['歌词内容'] || null, detailsLoaded: false,
    jooxIndex: idx + 1, displayIndex: idx + 1,
  }));
}

/* 交错合并各源结果（round-robin） */
function interleave(groups) {
  const out = [];
  const max = Math.max(0, ...groups.map(g => g.length));
  for (let i = 0; i < max; i++) {
    for (const g of groups) { if (i < g.length) out.push(g[i]); }
  }
  return out;
}

async function doSearch(reset = true) {
  const kw = dom.searchInput.value.trim();
  if (!kw) { toast('请输入歌名或歌手名'); dom.searchInput.focus(); return; }
  const enabled = Object.keys(state.enabledSources).filter(k => state.enabledSources[k]);
  if (!enabled.length) { toast('请至少选择一个音源'); return; }

  state.searchKeyword = kw;
  state.searching = true;
  dom.searchStatus.textContent = '搜索中…';
  dom.searchBtn.disabled = true;

  const limit = parseInt(dom.limitSelect.value, 10) || 10;
  state.perSourceLimit = limit;

  const tasks = enabled.map(s => {
    const fn = { netease: searchNetease, qq: searchQQ, kuwo: () => searchKuwo(kw, limit), joox: searchJoox }[s];
    return fn(kw, limit).catch(e => { console.warn('source fail', s, e); return []; });
  });

  let results = [];
  try {
    const groups = await Promise.all(tasks);
    results = interleave(groups).slice(0, limit * enabled.length);
  } catch (e) { console.error(e); }

  // 去重 & 更新 map
  const seen = new Set();
  results = results.filter(t => { if (seen.has(t.uid)) return false; seen.add(t.uid); return true; });
  results.forEach(t => state.trackMap.set(t.uid, t));

  if (reset) state.searchResults = results;
  else state.searchResults = state.searchResults.concat(results.filter(t => !state.searchResults.some(x => x.uid === t.uid)));

  state.searching = false;
  dom.searchBtn.disabled = false;
  state.listView = 'search';
  dom.searchStatus.textContent = results.length ? `搜索完成 · ${results.length} 首` : '没有找到结果，换个关键词试试';
  renderResults();
  if (!state.currentTrack && state.searchResults.length) {
    playFromQueue(0);
  }
}

/* ================================================================
 * 猜你喜欢（进入 APP 的推荐列表，可直接整列播放）
 * ================================================================ */
function collectListenedArtists() {
  // 从收藏 + 自建歌单提取听过的歌手（个性化依据）
  const artists = new Set();
  const collect = t => String(t.artist || '').split(/[\/,，、&]/).forEach(a => {
    const s = a.trim();
    if (s && s.length >= 2 && s.length <= 12 && !/live/i.test(s)) artists.add(s);
  });
  state.favorites.forEach(collect);
  state.playlists.forEach(p => p.tracks.forEach(collect));
  return [...artists];
}

function pickRecoKeywords() {
  // 1 个听过的歌手（如有）+ 3 个热门池关键词：个性化与多样性兼顾
  // 个性化只取 1 个：深度合作的歌手组合搜索结果高度重合，取多个会被去重大量消耗
  const kws = [];
  const mine = collectListenedArtists().filter(a => !RECOMMEND_POOL.includes(a));
  if (mine.length) {
    kws.push(mine[Math.floor(Math.random() * mine.length)]);
  }
  const pool = [...RECOMMEND_POOL];
  for (let i = 0; i < 3 && pool.length; i++) {
    kws.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return [...new Set(kws)].slice(0, 4);
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 洗牌 + 双层去重：歌名级（繁简双版本只留一首）+ 歌手级（每位歌手全段检查只留一首）
// seenTitle / seenArtist 由调用方持有，跨批次累积
function dedupeReco(tracks, seenTitle, seenArtist) {
  shuffleArr(tracks);
  return tracks.filter(t => {
    const tkey = artistKey(t.title).replace(/[\s\-—·、()（）\[\]【】]/g, '');
    if (tkey && seenTitle.has(tkey)) return false;
    const parts = String(t.artist || '').split(/[\/,，、&]/).map(artistKey).filter(Boolean);
    if (parts.length && parts.some(p => seenArtist.has(p))) return false;
    if (tkey) seenTitle.add(tkey);
    parts.forEach(p => seenArtist.add(p));
    return true;
  });
}

async function loadRecommendations() {
  if (state.recoLoading) return;
  state.recoLoading = true;

  const kws = pickRecoKeywords();
  state.recoKeywords = kws;
  state.listView = 'recommend';
  dom.searchStatus.textContent = '正在为你挑选歌曲…';
  dom.listTitle.textContent = '猜你喜欢';
  renderResults(); // 先显示空态占位

  const enabled = Object.keys(state.enabledSources).filter(k => state.enabledSources[k]);
  const PER_KW = 8;  // 每个关键词每源取 8 首（去重后仍能保住列表长度）
  const tasks = [];
  kws.forEach(kw => enabled.forEach(s => {
    const fn = {
      netease: () => searchNetease(kw),
      qq: () => searchQQ(kw),
      kuwo: () => searchKuwo(kw, PER_KW),
      joox: () => searchJoox(kw),
    }[s];
    tasks.push(fn().catch(e => { console.warn('reco source fail', s, e); return []; }));
  }));

  let tracks = [];
  try {
    const groups = await Promise.all(tasks);
    tracks = interleave(groups.map(g => (g || []).slice(0, PER_KW)));
  } catch (e) { console.error(e); }

  // 去重 & 入 map
  const seen = new Set();
  tracks = tracks.filter(t => { if (seen.has(t.uid)) return false; seen.add(t.uid); return true; });
  tracks.forEach(t => state.trackMap.set(t.uid, t));

  // 洗牌 + 双层去重（歌名级：繁简双版本只留一首；歌手级：每位歌手全段检查只留一首）
  const seenTitle = new Set();
  const seenArtist = new Set();
  tracks = dedupeReco(tracks, seenTitle, seenArtist);

  // 候选不足（音源超时等）：自动补充 2 个热门关键词
  if (tracks.length < 10) {
    const extraKws = shuffleArr([...RECOMMEND_POOL].filter(k => !kws.includes(k))).slice(0, 2);
    if (extraKws.length) {
      const extraTasks = [];
      extraKws.forEach(kw => enabled.forEach(s => {
        const fn = {
          netease: () => searchNetease(kw),
          qq: () => searchQQ(kw),
          kuwo: () => searchKuwo(kw, 6),
          joox: () => searchJoox(kw),
        }[s];
        extraTasks.push(fn().catch(() => []));
      }));
      try {
        const extraGroups = await Promise.all(extraTasks);
        let more = interleave(extraGroups.map(g => (g || []).slice(0, 6)));
        const seenMore = new Set();
        more = more.filter(t => { if (seen.has(t.uid) || seenMore.has(t.uid)) return false; seenMore.add(t.uid); return true; });
        more.forEach(t => state.trackMap.set(t.uid, t));
        tracks = tracks.concat(dedupeReco(more, seenTitle, seenArtist));
      } catch (e) { console.warn('reco extra fail', e); }
    }
  }
  state.recommendTracks = tracks.slice(0, 24);
  state.recoLoading = false;

  if (state.listView === 'recommend') {
    dom.searchStatus.textContent = state.recommendTracks.length
      ? `根据「${kws.join('、')}」为你推荐，点一首开始听`
      : '推荐加载失败，手动搜索试试';
    renderResults();
  }
}

/* ================================================================
 * 详情 & 播放
 * ================================================================ */
async function fetchQQDetails(track) {
  const msg = (track.keyword || track.qqSearchKey || `${track.title} ${track.artist}`).trim();
  const d = await fetchJson(API.qqDetail(msg, track.songid));
  if (!d || typeof d !== 'object' || !d.song_mid) throw new Error('qq detail invalid');
  track.title = d.song_title || d.song_name || track.title;
  track.artist = d.singer_name || track.artist;
  track.album = d.album_name || d.album_title || track.album || '';
  track.cover = d.album_pic || d.singer_pic || track.cover;
  // 按优先级选播放链接
  const best =
    d.song_play_url_sq || d.song_play_url_pq || d.song_play_url_hq || d.song_play_url_accom ||
    d.song_play_url_standard || d.song_play_url_fq || d.song_play_url || null;
  track.audioUrl = best || track.audioUrl;
  track.lrc = d.song_lyric || d.lyric || track.lrc || null;
  if (d.song_play_url_sq) track.qualityLabel = '无损';
  else if (d.song_play_url_hq || d.song_play_url_pq) track.qualityLabel = 'HQ';
  else if (best) track.qualityLabel = '标准';
  if (d.vip) track.vipTag = 'VIP';
  track.detailsLoaded = true;
}

async function fetchKuwoDetails(track) {
  const n = track.displayIndex || 1;
  const j = await fetchJson(API.kuwoDetail(track.keyword, n));
  if (!j || !j.data || Array.isArray(j.data)) throw new Error('kuwo detail invalid');
  const d = j.data;
  track.title = d.song || track.title;
  track.artist = d.singer || track.artist;
  track.album = d.album || track.album;
  track.cover = d.picture || track.cover;
  track.audioUrl = d.url || track.audioUrl;
  track.lrc = d.lyric || d.lrc || d.lyrics || track.lrc || null;
  const q = `${d.level || ''}${d.format || ''}`.toLowerCase();
  track.qualityLabel = /lossless|无损|flac|wav|ape/.test(q) ? '无损' : '标准';
  track.detailsLoaded = true;
}

async function fetchJooxDetails(track) {
  const n = track.jooxIndex || track.displayIndex || 1;
  const j = await fetchJson(API.jooxDetail(track.keyword, n));
  if (!j || j.code !== 200 || !j.data) throw new Error('joox detail invalid');
  const links = j.data['播放链接'] || {};
  const url = links['320k'] || links['192k'] || links['128k'] || links.flac || null;
  if (!url) throw new Error('joox no play url');
  track.audioUrl = url;
  if (links.flac) track.qualityLabel = '无损';
  else if (links['320k']) track.qualityLabel = '320K';
  track.detailsLoaded = true;
}

async function fetchNeteaseDetails(track) {
  if (!track.audioUrl) track.audioUrl = API.neteaseUrl(track.songid);
  if (!track.lrcUrl) track.lrcUrl = API.neteaseLrc(track.songid);
  track.qualityLabel = '标准';
  track.detailsLoaded = true;
}

async function ensurePlayable(track) {
  if (track._stale) { track._stale = false; track.detailsLoaded = false; track.audioUrl = null; }
  if (track.audioUrl) return track;
  const fn = { netease: fetchNeteaseDetails, qq: fetchQQDetails, kuwo: fetchKuwoDetails, joox: fetchJooxDetails }[track.source];
  if (!fn) throw new Error('未知音源');
  await fn(track);
  return track;
}

/* -------- 播放队列 -------- */
function getQueueList() {
  const q = state.queue;
  if (q.type === 'recommend') return state.recommendTracks;
  if (q.type === 'results') return state.searchResults;
  if (q.type === 'favorites') return state.favorites;
  if (q.type === 'playlist') {
    const pl = state.playlists.find(p => p.id === q.plId);
    return pl ? pl.tracks : [];
  }
  return [];
}
function queueName() {
  const q = state.queue;
  if (q.type === 'recommend') return '猜你喜欢';
  if (q.type === 'results') return '搜索结果';
  if (q.type === 'favorites') return '我的收藏';
  const pl = state.playlists.find(p => p.id === q.plId);
  return pl ? `歌单 · ${pl.name}` : '歌单';
}

async function playFromQueue(index) {
  const list = getQueueList();
  if (!list.length) { toast('列表为空'); return; }
  const track = list[index];
  if (!track) return;
  state.currentTrack = track;
  state.retryCount = 0;
  updatePlayerUI();
  renderAllLists();

  dom.searchStatus.textContent = `正在缓冲 · ${track.title}`;
  try {
    await ensurePlayable(track);
  } catch (e) {
    console.error('detail fail', e);
    toast(`「${track.title}」获取播放链接失败`);
    autoNext();
    return;
  }
  await loadLyrics(track);
  playAudio(track);
}

async function playAudio(track) {
  if (!track.audioUrl) { toast('暂无播放链接'); return; }
  dom.audio.src = track.audioUrl;
  try {
    await dom.audio.play();
    updatePlayerUI();
    setupMediaSession(track);
  } catch (e) {
    // iOS 首次播放可能被拦截，等待用户手势后重试
    console.warn('play blocked', e);
    toast('请再点一次播放按钮');
    updatePlayerUI();
  }
}

function nextIndex(dir) {
  const list = getQueueList();
  if (!list.length) return -1;
  const cur = list.findIndex(t => t.uid === (state.currentTrack && state.currentTrack.uid));
  let idx;
  if (state.playMode === 'random') {
    if (list.length === 1) return 0;
    do { idx = Math.floor(Math.random() * list.length); } while (idx === cur && list.length > 1);
    return idx;
  }
  idx = (cur + dir + list.length * 2) % list.length; // dir 可为 -1
  return idx;
}

function playNext() { const i = nextIndex(1); if (i >= 0) playFromQueue(i); }
function playPrev() {
  // 播放超过 3 秒时上一曲回到开头
  if (dom.audio.currentTime > 3) { dom.audio.currentTime = 0; return; }
  const i = nextIndex(-1); if (i >= 0) playFromQueue(i);
}
function autoNext() {
  if (state.playMode === 'one') {
    dom.audio.currentTime = 0;
    dom.audio.play().catch(() => {});
    return;
  }
  playNext();
}

function togglePlay() {
  if (!state.currentTrack) {
    const list = getQueueList();
    if (list.length) playFromQueue(0);
    return;
  }
  if (dom.audio.paused) {
    dom.audio.play().catch(e => { toast('播放被拦截，再点一次'); });
  } else {
    dom.audio.pause();
  }
  updatePlayerUI();
}

/* -------- audio 事件 -------- */
dom.audio.addEventListener('timeupdate', () => {
  const a = dom.audio;
  if (!a.duration) return;
  const pct = (a.currentTime / a.duration) * 100;
  dom.miniProgressBar.style.width = pct + '%';
  if (!dom.pfSeek.dragging) {
    dom.pfSeek.value = pct;
    dom.pfTimeCur.textContent = fmtTime(a.currentTime);
  }
  syncLyrics(a.currentTime);
});
dom.audio.addEventListener('loadedmetadata', () => {
  dom.pfTimeDur.textContent = fmtTime(dom.audio.duration);
});
dom.audio.addEventListener('play', () => { updatePlayerUI(); dom.miniArt.classList.add('pulse'); });
dom.audio.addEventListener('pause', () => { updatePlayerUI(); dom.miniArt.classList.remove('pulse'); });
dom.audio.addEventListener('ended', autoNext);
dom.audio.addEventListener('error', () => {
  const t = state.currentTrack;
  if (!t) return;
  // 播放链接可能过期：重取一次详情
  if (state.retryCount < 1) {
    state.retryCount++;
    t.audioUrl = null; t.detailsLoaded = false; t.lrc = null;
    toast('链接失效，正在重试…');
    ensurePlayable(t).then(() => playAudio(t)).catch(() => { toast('播放失败，自动下一首'); autoNext(); });
  } else {
    toast(`「${t.title}」播放失败`);
    state.retryCount = 0;
    autoNext();
  }
});

/* ================================================================
 * 歌词
 * ================================================================ */
function parseLrc(text) {
  const lines = String(text || '').split('\n');
  const out = [];
  const timeRe = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;
  for (const line of lines) {
    const times = [];
    let m;
    while ((m = timeRe.exec(line)) !== null) {
      const min = parseInt(m[1], 10), sec = parseInt(m[2], 10);
      const ms = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) : 0;
      times.push(min * 60 + sec + ms / 1000);
    }
    const textPart = line.replace(timeRe, '').trim();
    if (times.length && textPart) times.forEach(t => out.push({ time: t, text: textPart }));
  }
  out.sort((a, b) => a.time - b.time);
  return out;
}

async function loadLyrics(track) {
  state.lyrics = [];
  renderLyrics();
  try {
    let text = track.lrc;
    if (!text && track.source === 'netease' && track.songid) {
      const lrcUrl = track.lrcUrl || API.neteaseLrc(track.songid);
      const res = await fetch(lrcUrl);
      const raw = await res.text();
      try {
        const j = JSON.parse(raw);
        text = j && (j.lrc || j.lyric || (j.data && (j.data.lrc || j.data.lyric)) || (typeof j.data === 'string' ? j.data : null));
      } catch (e) { text = raw; }
    }
    if (!text) return;
    state.lyrics = parseLrc(text);
    renderLyrics();
  } catch (e) { console.warn('lyric fail', e); }
}

function renderLyrics() {
  const box = dom.pfLyrics;
  box.innerHTML = '';
  if (!state.lyrics.length) {
    box.innerHTML = '<div class="lyrics-placeholder">暂无歌词</div>';
    state.lyricLines = [];
    return;
  }
  const frag = document.createDocumentFragment();
  state.lyrics.forEach(l => {
    const div = document.createElement('div');
    div.className = 'lyric-line';
    div.textContent = l.text;
    frag.appendChild(div);
  });
  box.appendChild(frag);
  state.lyricLines = Array.from(box.children);
}

function syncLyrics(time) {
  if (!state.lyrics.length || !state.lyricLines.length) return;
  let active = -1;
  for (let i = 0; i < state.lyrics.length; i++) {
    if (state.lyrics[i].time <= time + 0.3) active = i; else break;
  }
  if (syncLyrics._last === active) return;
  syncLyrics._last = active;
  state.lyricLines.forEach((el, i) => el.classList.toggle('active', i === active));
  if (active >= 0 && dom.pf.classList.contains('open')) {
    const el = state.lyricLines[active];
    const boxTop = dom.pfLyrics.scrollTop;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

/* ================================================================
 * UI 渲染
 * ================================================================ */
function trackItemHtml(track, listType, index) {
  const playing = state.currentTrack && state.currentTrack.uid === track.uid;
  const faved = isFaved(track);
  const artHtml = track.cover
    ? `<img src="${track.cover}" alt="" loading="lazy" onerror="this.remove()">`
    : '♪';
  const vip = track.vipTag ? `<span class="src-tag qq">VIP</span>` : '';
  return `<li class="track-item${playing ? ' playing' : ''}" data-index="${index}">
    <div class="t-art">${artHtml}</div>
    <div class="t-info">
      <div class="t-title">${esc(track.title)}</div>
      <div class="t-sub">
        <span class="src-tag ${track.source}">${SOURCE_NAME[track.source] || track.source}</span>
        ${vip}
        <span>${esc(track.artist)}</span>
      </div>
    </div>
    <div class="t-actions">
      <button class="t-btn fav${faved ? ' faved' : ''}" data-act="fav">${faved ? '❤' : '♡'}</button>
      <button class="t-btn" data-act="add" aria-label="加入歌单">＋</button>
    </div>
  </li>`;
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderTrackList(listEl, tracks, listType, emptyHtml) {
  if (!tracks.length) {
    listEl.innerHTML = emptyHtml;
    return;
  }
  listEl.innerHTML = tracks.map((t, i) => trackItemHtml(t, listType, i)).join('');
}

const EMPTY_SEARCH = `<li class="empty-hint"><div class="empty-art">🎧</div><p>搜索并播放一首歌吧！</p></li>`;
const EMPTY_FAV = `<li class="empty-hint"><div class="empty-art">♡</div><p>还没有收藏，点击歌曲右侧 ♡ 收藏</p></li>`;
const EMPTY_RECO = `<li class="empty-hint"><div class="empty-art">🎵</div><p>正在为你准备推荐…<br>也可以直接搜索想听的歌</p></li>`;

function renderResults() {
  if (state.listView === 'recommend') {
    dom.listTitle.textContent = '猜你喜欢';
    renderTrackList(dom.resultList, state.recommendTracks, 'recommend', EMPTY_RECO);
    dom.resultCount.textContent = state.recommendTracks.length ? `${state.recommendTracks.length} 首` : '';
    dom.btnRefreshReco.classList.remove('hidden');
    dom.btnBackReco.classList.add('hidden');
  } else {
    dom.listTitle.textContent = `搜索「${state.searchKeyword}」`;
    renderTrackList(dom.resultList, state.searchResults, 'results', EMPTY_SEARCH);
    dom.resultCount.textContent = state.searchResults.length ? `${state.searchResults.length} 首` : '';
    dom.btnRefreshReco.classList.add('hidden');
    dom.btnBackReco.classList.remove('hidden');
  }
}
function renderFavorites() {
  renderTrackList(dom.favList, state.favorites, 'favorites', EMPTY_FAV);
  dom.favCount.textContent = state.favorites.length;
}
function renderPlaylists() {
  const box = dom.userPlaylists;
  if (!state.playlists.length) {
    box.innerHTML = `<div class="empty-hint" style="padding:24px"><p>还没有自建歌单，点击上方「＋ 新建歌单」</p></div>`;
    return;
  }
  box.innerHTML = state.playlists.map(pl => `
    <div class="user-pl" data-plid="${pl.id}">
      <div class="user-pl-head">
        <h3>🎵 ${esc(pl.name)}</h3>
        <span class="group-count">${pl.tracks.length} 首</span>
        <button class="icon-btn" data-act="del-pl" aria-label="删除歌单">🗑</button>
      </div>
      <ul class="track-list">
        ${pl.tracks.length
          ? pl.tracks.map((t, i) => trackItemHtml(t, 'playlist', i)).join('')
          : `<li class="empty-hint" style="padding:16px"><p style="font-size:12.5px">歌单为空，从搜索结果点 ＋ 添加</p></li>`}
      </ul>
    </div>`).join('');
}
function renderAllLists() {
  renderResults(); renderFavorites(); renderPlaylists();
}

/* -------- mini player & 全屏播放页 -------- */
function setArtImg(imgEl, fallbackEl, cover) {
  if (cover) {
    imgEl.src = cover;
    imgEl.style.display = 'block';
    fallbackEl.style.display = 'none';
  } else {
    imgEl.style.display = 'none';
    fallbackEl.style.display = 'flex';
  }
}

function updatePlayerUI() {
  const t = state.currentTrack;
  const paused = dom.audio.paused;
  const playSvg = paused ? ICON_PLAY : ICON_PAUSE;
  dom.miniPlayIcon.firstElementChild && (dom.miniPlayIcon.innerHTML = `<path fill="currentColor" d="${playSvg}"/>`);
  dom.pfPlayIcon && (dom.pfPlayIcon.innerHTML = `<path fill="currentColor" d="${playSvg}"/>`);
  dom.miniArt.classList.toggle('pulse', !paused && !!t);

  if (!t) {
    dom.miniTitle.textContent = '未在播放';
    dom.miniArtist.textContent = '点一首歌开始吧';
    return;
  }
  dom.miniTitle.textContent = t.title;
  dom.miniArtist.textContent = `${SOURCE_NAME[t.source] || ''} · ${t.artist}`;
  setArtImg(dom.miniArt.querySelector('img') || createMiniImg(), dom.miniArt, t.cover);

  dom.pfTitle.textContent = t.title;
  dom.pfArtist.textContent = t.artist || '—';
  dom.pfSource.textContent = SOURCE_NAME[t.source] || t.source;
  dom.pfQuality.textContent = t.qualityLabel || (t.audioUrl && /\.flac|\.wav/i.test(t.audioUrl) ? '无损' : '标准');
  dom.pfListName.textContent = queueName();
  dom.pfFav.textContent = isFaved(t) ? '❤' : '♡';
  dom.pfFav.classList.toggle('faved', isFaved(t));
  dom.pfMode.textContent = MODE_ICON[state.playMode];
  document.title = `${t.title} - ${t.artist} | 我的音乐站`;
}
function createMiniImg() {
  const img = document.createElement('img');
  dom.miniArt.appendChild(img);
  return img;
}

function openPlayer() {
  dom.pf.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => dom.pf.classList.add('open')));
}
function closePlayer() {
  dom.pf.classList.remove('open');
  setTimeout(() => dom.pf.classList.add('hidden'), 330);
}

/* -------- Media Session（锁屏控制） -------- */
function setupMediaSession(track) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || '我的音乐站',
      artwork: track.cover ? [{ src: track.cover, sizes: '512x512', type: 'image/jpeg' }] : [],
    });
    navigator.mediaSession.setActionHandler('play', () => dom.audio.play());
    navigator.mediaSession.setActionHandler('pause', () => dom.audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', playPrev);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
  } catch (e) { console.warn('mediaSession', e); }
}

/* ================================================================
 * 收藏 & 歌单
 * ================================================================ */
function isFaved(track) {
  return track && state.favorites.some(f => f.uid === track.uid);
}
function toggleFav(track) {
  if (!track) return;
  const i = state.favorites.findIndex(f => f.uid === track.uid);
  if (i >= 0) {
    state.favorites.splice(i, 1);
    toast('已取消收藏');
  } else {
    state.favorites.push(track);
    toast('已加入收藏 ❤');
  }
  save();
  renderAllLists();
  updatePlayerUI();
}

function showModal(title, bodyHtml) {
  dom.modalTitle.textContent = title;
  dom.modalBody.innerHTML = bodyHtml;
  dom.modalMask.classList.remove('hidden');
}
function closeModal() { dom.modalMask.classList.add('hidden'); }

function promptNewPlaylist() {
  showModal('新建歌单', `
    <input type="text" id="newPlName" placeholder="例如：通勤歌单 / 深夜歌单" maxlength="30">
    <div class="row">
      <button class="btn btn-ghost" id="mCancel">取消</button>
      <button class="btn btn-primary" id="mOk">创建</button>
    </div>`);
  $('newPlName').focus();
  $('mCancel').onclick = closeModal;
  $('mOk').onclick = () => {
    const name = $('newPlName').value.trim();
    if (!name) { toast('歌单名不能为空'); return; }
    state.playlists.push({ id: 'pl' + Date.now(), name, tracks: [] });
    save(); renderPlaylists(); closeModal();
    toast(`歌单「${name}」已创建`);
  };
}

function promptAddToPlaylist(track) {
  if (!state.playlists.length) {
    showModal('加入歌单', `
      <div class="hint">还没有自建歌单，先创建一个吧～</div>
      <div class="row"><button class="btn btn-primary" id="mOk">去新建歌单</button></div>`);
    $('mOk').onclick = () => { closeModal(); promptNewPlaylist(); };
    return;
  }
  const opts = state.playlists.map(pl =>
    `<button class="pl-pick" data-plid="${pl.id}"><span>${esc(pl.name)}</span><span class="cnt">${pl.tracks.length} 首</span></button>`
  ).join('');
  showModal('加入歌单', opts);
  dom.modalBody.querySelectorAll('.pl-pick').forEach(btn => {
    btn.onclick = () => {
      const pl = state.playlists.find(p => p.id === btn.dataset.plid);
      if (!pl) return;
      if (pl.tracks.some(t => t.uid === track.uid)) { toast('这首歌已在歌单里'); closeModal(); return; }
      pl.tracks.push(track);
      save(); renderPlaylists(); closeModal();
      toast(`已加入「${pl.name}」`);
    };
  });
}

function exportData() {
  const data = { favorites: state.favorites, playlists: state.playlists, exportedAt: new Date().toISOString() };
  const json = JSON.stringify(data, null, 2);
  showModal('导出收藏 & 歌单', `
    <div class="hint">复制以下 JSON 保存到备忘录，之后可通过「导入」恢复：</div>
    <textarea id="exportArea" readonly>${esc(json)}</textarea>
    <div class="row">
      <button class="btn btn-ghost" id="mCancel">关闭</button>
      <button class="btn btn-primary" id="mCopy">复制</button>
    </div>`);
  $('mCancel').onclick = closeModal;
  $('mCopy').onclick = async () => {
    const area = $('exportArea');
    area.select();
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(area.value);
      else document.execCommand('copy');
      toast('已复制到剪贴板');
    } catch (e) {
      toast('复制失败，请手动全选复制');
      area.focus(); area.select();
    }
  };
}

function importData() {
  showModal('导入收藏 & 歌单', `
    <div class="hint">粘贴之前导出的 JSON（将合并导入，不会清空现有数据）：</div>
    <textarea id="importArea" placeholder='{"favorites":[...],"playlists":[...]}'></textarea>
    <div class="row">
      <button class="btn btn-ghost" id="mCancel">取消</button>
      <button class="btn btn-primary" id="mOk">导入</button>
    </div>`);
  $('mCancel').onclick = closeModal;
  $('importArea').focus();
  $('mOk').onclick = () => {
    let data;
    try { data = JSON.parse($('importArea').value); }
    catch (e) { toast('JSON 格式有误，请检查'); return; }
    let addedFav = 0, addedPl = 0;
    (data.favorites || []).forEach(t => {
      if (t && t.uid && !state.favorites.some(f => f.uid === t.uid)) {
        state.favorites.push(trackFromStored(t)); addedFav++;
      }
    });
    (data.playlists || []).forEach(p => {
      if (p && p.name) {
        const exist = state.playlists.find(x => x.name === p.name);
        if (exist) {
          (p.tracks || []).forEach(t => { if (t && t.uid && !exist.tracks.some(x => x.uid === t.uid)) exist.tracks.push(trackFromStored(t)); });
        } else {
          state.playlists.push({ id: 'pl' + Date.now() + Math.random().toString(36).slice(2, 6), name: p.name, tracks: (p.tracks || []).map(trackFromStored) });
          addedPl++;
        }
      }
    });
    save(); renderAllLists(); closeModal();
    toast(`导入完成：收藏 +${addedFav}，歌单 +${addedPl}`);
  };
}

/* ================================================================
 * 云端同步（GitHub 私有仓库文件）
 * 电脑/手机各粘贴一次 Token（repo 权限），之后可互相同步：
 * 上传=本地覆盖云端，下载=云端合并到本地
 * ================================================================ */
const SYNC_LS_KEY = 'mystation.sync';
const SYNC_REPO = 'mystation-sync';
const SYNC_FILE = 'mystation.json';

function loadSyncCfg() {
  try { return JSON.parse(localStorage.getItem(SYNC_LS_KEY)) || {}; } catch (e) { return {}; }
}
function saveSyncCfg(cfg) {
  try { localStorage.setItem(SYNC_LS_KEY, JSON.stringify(cfg)); } catch (e) {}
}

async function ghApi(path, method = 'GET', body) {
  const cfg = loadSyncCfg();
  if (!cfg.token) throw new Error('no-token');
  const res = await fetch('https://api.github.com' + path, {
    method,
    headers: {
      'Authorization': 'token ' + cfg.token,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) throw new Error('token-invalid');
  if (!res.ok && res.status !== 404) throw new Error('HTTP ' + res.status);
  if (res.status === 404) {
    const err = new Error('not-found');
    err.status = 404;
    throw err;
  }
  return res.json();
}

// UTF-8 安全的 base64 编解码（中文歌名）
const b64encode = s => btoa(unescape(encodeURIComponent(s)));
const b64decode = s => decodeURIComponent(escape(atob(s)));

async function ensureSyncRepo() {
  // 确认 token 有效并记录用户名；确认同步仓库存在（不存在则创建私有仓库）
  const cfg = loadSyncCfg();
  if (!cfg.username) {
    const me = await ghApi('/user');
    cfg.username = me.login;
    saveSyncCfg(cfg);
  }
  try {
    await ghApi(`/repos/${cfg.username}/${SYNC_REPO}`);
  } catch (e) {
    if (e.status !== 404) throw e;
    await ghApi('/user/repos', 'POST', { name: SYNC_REPO, private: true, description: '我的音乐站同步数据（自动创建）' });
  }
}

async function uploadToCloud() {
  await ensureSyncRepo();
  const cfg = loadSyncCfg();
  const data = {
    favorites: state.favorites,
    playlists: state.playlists,
    syncedAt: new Date().toISOString(),
  };
  const content = b64encode(JSON.stringify(data));
  // 已有文件需带 sha 才能更新
  let sha = null;
  try {
    const file = await ghApi(`/repos/${cfg.username}/${SYNC_REPO}/contents/${SYNC_FILE}`);
    sha = file.sha;
  } catch (e) { if (e.status !== 404) throw e; }
  await ghApi(`/repos/${cfg.username}/${SYNC_REPO}/contents/${SYNC_FILE}`, 'PUT', {
    message: `音乐站同步 ${new Date().toLocaleString()}`,
    content,
    sha: sha || undefined,
  });
  cfg.lastSyncAt = data.syncedAt; cfg.lastSyncDir = 'upload'; saveSyncCfg(cfg);
  return { fav: state.favorites.length, pl: state.playlists.length };
}

async function downloadFromCloud() {
  await ensureSyncRepo();
  const cfg = loadSyncCfg();
  let file;
  try {
    file = await ghApi(`/repos/${cfg.username}/${SYNC_REPO}/contents/${SYNC_FILE}`);
  } catch (e) {
    if (e.status === 404) throw new Error('cloud-empty');
    throw e;
  }
  let data;
  try { data = JSON.parse(b64decode(file.content)); }
  catch (e) { throw new Error('cloud-data-broken'); }
  let addedFav = 0, addedPl = 0;
  (data.favorites || []).forEach(t => {
    if (t && t.uid && !state.favorites.some(f => f.uid === t.uid)) {
      state.favorites.push(trackFromStored(t)); addedFav++;
    }
  });
  (data.playlists || []).forEach(p => {
    if (p && p.name) {
      const exist = state.playlists.find(x => x.name === p.name);
      if (exist) {
        (p.tracks || []).forEach(t => { if (t && t.uid && !exist.tracks.some(x => x.uid === t.uid)) exist.tracks.push(trackFromStored(t)); });
      } else {
        state.playlists.push({ id: 'pl' + Date.now() + Math.random().toString(36).slice(2, 6), name: p.name, tracks: (p.tracks || []).map(trackFromStored) });
        addedPl++;
      }
    }
  });
  save(); renderAllLists();
  cfg.lastSyncAt = new Date().toISOString(); cfg.lastSyncDir = 'download'; saveSyncCfg(cfg);
  return { addedFav, addedPl };
}

function handleSyncError(e) {
  console.warn('sync error', e);
  const m = String(e && e.message || e);
  if (m === 'no-token') toast('请先粘贴 GitHub Token');
  else if (m === 'token-invalid') toast('Token 无效或已过期，请更换');
  else if (m === 'cloud-empty') toast('云端还没有数据，先在另一台设备「上传」');
  else if (m === 'cloud-data-broken') toast('云端数据损坏，重新上传覆盖');
  else toast('同步失败：' + m);
}

function promptSync() {
  const cfg = loadSyncCfg();
  const hasToken = !!cfg.token;
  const last = cfg.lastSyncAt
    ? `上次同步：${cfg.lastSyncDir === 'upload' ? '上传' : '恢复'} · ${new Date(cfg.lastSyncAt).toLocaleString()}`
    : '尚未同步过';
  showModal('☁ 云端同步', `
    <div class="hint">收藏和歌单保存在你的 GitHub <b>私有仓库</b> mystation-sync（仅自己可见）。<br>每台设备粘贴一次 Token，即可互相「上传 / 恢复」。</div>
    ${hasToken
      ? `<div class="hint">✓ Token 已设置${cfg.username ? '（' + esc(cfg.username) + '）' : ''} <button id="mResetToken" class="text-btn" style="margin-left:6px">更换</button></div>`
      : `<input type="text" id="syncToken" placeholder="粘贴 GitHub Token（ghp_ 开头）" autocomplete="off">
         <div class="hint">Token 需勾选 <b>repo</b> 权限（github.com/settings/tokens/new）</div>`}
    <div class="hint">${esc(last)}</div>
    <div class="row">
      <button class="btn btn-ghost" id="mClose">关闭</button>
      <button class="btn btn-ghost" id="mDownload">⬇ 从云端恢复</button>
      <button class="btn btn-primary" id="mUpload">⬆ 上传到云端</button>
    </div>`);

  $('mClose').onclick = closeModal;
  const resetBtn = $('mResetToken');
  if (resetBtn) resetBtn.onclick = () => {
    const c = loadSyncCfg();
    delete c.token; delete c.username;
    saveSyncCfg(c);
    closeModal(); promptSync();
  };

  const readTokenInput = () => {
    const input = $('syncToken');
    if (input && input.value.trim()) {
      const c = loadSyncCfg();
      c.token = input.value.trim();
      saveSyncCfg(c);
      return true;
    }
    return !!loadSyncCfg().token;
  };

  $('mUpload').onclick = async () => {
    if (!readTokenInput()) { toast('请先粘贴 Token'); return; }
    const btn = $('mUpload');
    btn.disabled = true; btn.textContent = '上传中…';
    try {
      const r = await uploadToCloud();
      toast(`已上传：${r.fav} 首收藏、${r.pl} 个歌单`);
      closeModal();
    } catch (e) {
      btn.disabled = false; btn.textContent = '⬆ 上传到云端';
      handleSyncError(e);
    }
  };

  $('mDownload').onclick = async () => {
    if (!readTokenInput()) { toast('请先粘贴 Token'); return; }
    const btn = $('mDownload');
    btn.disabled = true; btn.textContent = '恢复中…';
    try {
      const r = await downloadFromCloud();
      toast(`已从云端恢复：收藏 +${r.addedFav}，歌单 +${r.addedPl}`);
      closeModal();
    } catch (e) {
      btn.disabled = false; btn.textContent = '⬇ 从云端恢复';
      handleSyncError(e);
    }
  };
}

/* ================================================================
 * 事件绑定
 * ================================================================ */
/* 搜索 */
dom.searchBtn.addEventListener('click', () => doSearch(true));
dom.searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); doSearch(true); dom.searchInput.blur(); }
});
dom.limitSelect.addEventListener('change', () => { state.perSourceLimit = parseInt(dom.limitSelect.value, 10); });

/* 猜你喜欢：换一批 / 返回推荐 */
dom.btnRefreshReco.addEventListener('click', () => loadRecommendations());
dom.btnBackReco.addEventListener('click', () => {
  if (!state.recommendTracks.length) { loadRecommendations(); return; }
  state.listView = 'recommend';
  renderResults();
  dom.searchStatus.textContent = state.recoKeywords.length
    ? `根据「${state.recoKeywords.join('、')}」为你推荐，点一首开始听`
    : '点一首开始听';
});

/* 音源 chips */
dom.sourceChips.querySelectorAll('.chip').forEach(chip => {
  const input = chip.querySelector('input');
  input.checked = !!state.enabledSources[chip.dataset.source];
  input.addEventListener('change', () => {
    state.enabledSources[chip.dataset.source] = input.checked;
    save();
  });
});

/* tab 切换 */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    $('panelResults').classList.toggle('hidden', btn.dataset.tab !== 'results');
    $('panelPlaylists').classList.toggle('hidden', btn.dataset.tab !== 'playlists');
  });
});

/* 列表点击（事件委托：播放 / 收藏 / 加歌单） */
function bindListClick(listEl, listType, plId) {
  listEl.addEventListener('click', e => {
    const li = e.target.closest('.track-item');
    if (!li) return;
    const idx = parseInt(li.dataset.index, 10);
    let list;
    if (listType === 'current') {
      // 搜索/推荐共用一个列表容器，按当前视图取列表
      list = state.listView === 'recommend' ? state.recommendTracks : state.searchResults;
    } else if (listType === 'results') list = state.searchResults;
    else if (listType === 'favorites') list = state.favorites;
    else { const pl = state.playlists.find(p => p.id === plId); list = pl ? pl.tracks : []; }
    const track = list && list[idx];
    if (!track) return;

    const actBtn = e.target.closest('[data-act]');
    if (actBtn) {
      e.stopPropagation();
      if (actBtn.dataset.act === 'fav') toggleFav(track);
      else if (actBtn.dataset.act === 'add') promptAddToPlaylist(track);
      return;
    }
    // 设置播放队列
    let qType = listType;
    if (listType === 'current') qType = state.listView === 'recommend' ? 'recommend' : 'results';
    state.queue = listType === 'playlist' ? { type: 'playlist', plId } : { type: qType, plId: null };
    playFromQueue(idx);
  });
}
bindListClick(dom.resultList, 'current');
bindListClick(dom.favList, 'favorites');

/* 用户歌单区域（删除歌单 + 列表播放，动态渲染所以委托在容器上） */
dom.userPlaylists.addEventListener('click', e => {
  const plBox = e.target.closest('.user-pl');
  if (!plBox) return;
  const plId = plBox.dataset.plid;
  if (e.target.closest('[data-act="del-pl"]')) {
    const pl = state.playlists.find(p => p.id === plId);
    if (!pl) return;
    if (confirm(`确定删除歌单「${pl.name}」？歌曲不会被删除。`)) {
      state.playlists = state.playlists.filter(p => p.id !== plId);
      if (state.queue.type === 'playlist' && state.queue.plId === plId) state.queue = { type: 'results', plId: null };
      save(); renderPlaylists();
      toast('歌单已删除');
    }
    return;
  }
  const li = e.target.closest('.track-item');
  if (!li) return;
  const pl = state.playlists.find(p => p.id === plId);
  if (!pl) return;
  const idx = parseInt(li.dataset.index, 10);
  const actBtn = e.target.closest('[data-act]');
  if (actBtn) {
    e.stopPropagation();
    if (actBtn.dataset.act === 'fav') toggleFav(pl.tracks[idx]);
    else if (actBtn.dataset.act === 'add') promptAddToPlaylist(pl.tracks[idx]);
    return;
  }
  state.queue = { type: 'playlist', plId };
  playFromQueue(idx);
});

/* 歌单按钮 */
$('btnNewPlaylist').addEventListener('click', promptNewPlaylist);
$('btnImport').addEventListener('click', importData);
$('btnExport').addEventListener('click', exportData);
$('btnSync').addEventListener('click', promptSync);
dom.modalClose.addEventListener('click', closeModal);
dom.modalMask.addEventListener('click', e => { if (e.target === dom.modalMask) closeModal(); });

/* mini player */
dom.miniPlay.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
dom.miniPrev.addEventListener('click', e => { e.stopPropagation(); playPrev(); });
dom.miniNext.addEventListener('click', e => { e.stopPropagation(); playNext(); });
dom.miniPlayer.addEventListener('click', () => { if (state.currentTrack) openPlayer(); });

/* 全屏播放页 */
dom.pfClose.addEventListener('click', closePlayer);
dom.pfPlay.addEventListener('click', togglePlay);
dom.pfPrev.addEventListener('click', playPrev);
dom.pfNext.addEventListener('click', playNext);
dom.pfFav.addEventListener('click', () => toggleFav(state.currentTrack));
dom.pfMode.addEventListener('click', () => {
  const modes = ['loop', 'one', 'random'];
  const next = modes[(modes.indexOf(state.playMode) + 1) % modes.length];
  state.playMode = next;
  save();
  dom.pfMode.textContent = MODE_ICON[next];
  toast(MODE_NAME[next]);
});

/* 进度条 seek */
dom.pfSeek.addEventListener('input', () => {
  dom.pfSeek.dragging = true;
  const pct = parseFloat(dom.pfSeek.value);
  if (dom.audio.duration) dom.pfTimeCur.textContent = fmtTime(dom.audio.duration * pct / 100);
});
dom.pfSeek.addEventListener('change', () => {
  const pct = parseFloat(dom.pfSeek.value);
  if (dom.audio.duration) {
    dom.audio.currentTime = dom.audio.duration * pct / 100;
    syncLyrics._last = -1;
  }
  dom.pfSeek.dragging = false;
});

/* 音量控制 */
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);  // iPadOS 伪装 Mac
let savedVol = parseInt(dom.pfVolume.value, 10) / 100;
dom.audio.volume = savedVol;

// 拖动音量滑块实时生效（安卓/桌面；iOS 由硬件音量控制，属性被 Apple 屏蔽）
dom.pfVolume.addEventListener('input', () => {
  const v = parseInt(dom.pfVolume.value, 10) / 100;
  dom.audio.volume = v;
  if (v === 0) dom.volWrap.querySelector('.pf-vol-icon').textContent = '🔇';
  else dom.volWrap.querySelector('.pf-vol-icon').textContent = v < 0.5 ? '🔉' : '🔊';
});

dom.volWrap.querySelector('.pf-vol-icon').addEventListener('click', () => {
  if (IS_IOS) { toast('iPhone 音量请用手机侧边按键调节'); return; }
  dom.volWrap.classList.toggle('expanded');
});

/* ================================================================
 * 初始化
 * ================================================================ */
function init() {
  load();
  renderAllLists();
  updatePlayerUI();
  dom.pfMode.textContent = MODE_ICON[state.playMode];

  // Service Worker 注册（PWA 离线缓存）
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('sw fail', e));
  }

  // 进入 APP 自动加载"猜你喜欢"推荐（异步，不阻塞首屏）
  loadRecommendations();
}
init();

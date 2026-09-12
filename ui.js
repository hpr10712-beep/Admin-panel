// UI helpers: toast, modal, theme, context menu, emoji picker
export const Toast = {
  show(title, type = 'info', duration = 3000) {
    const root = document.getElementById('toast-root') || (() => {
      const d = document.createElement('div');
      d.id = 'toast-root';
      document.body.appendChild(d);
      return d;
    })();
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    const ico = { success: '✓', error: '!', info: 'i' }[type] || 'i';
    el.innerHTML = `<div class="t-ico">${ico}</div><div>${escapeHtml(title)}</div>`;
    root.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },
  success: (m, d) => Toast.show(m, 'success', d),
  error: (m, d) => Toast.show(m, 'error', d),
  info: (m, d) => Toast.show(m, 'info', d),
};

export const Modal = {
  open({ title, body, footer, onMount }) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="modal-bg" id="modal-bg">
        <div class="modal">
          <div class="modal-head">
            <h3>${escapeHtml(title || '')}</h3>
            <button class="icon-btn" id="modal-close">✕</button>
          </div>
          <div class="modal-body">${body || ''}</div>
          ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
        </div>
      </div>
    `;
    const close = () => { root.innerHTML = ''; document.removeEventListener('keydown', esc); };
    const esc = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', esc);
    document.getElementById('modal-close').onclick = close;
    document.getElementById('modal-bg').onclick = (e) => e.target.id === 'modal-bg' && close();
    if (onMount) onMount(close);
    return close;
  },
  confirm({ title, message, confirmText = 'Hapus', danger = true, onConfirm }) {
    this.open({
      title: '',
      body: `<div style="text-align:center;padding:10px 0">
        <div style="font-size:40px;margin-bottom:12px">${danger ? '⚠️' : '❓'}</div>
        <h3 style="font-size:17px;font-weight:700;margin-bottom:8px">${escapeHtml(title)}</h3>
        <p style="color:var(--text-2);font-size:14px;line-height:1.5">${escapeHtml(message)}</p>
      </div>`,
      footer: `<button class="btn btn-ghost" id="cf-cancel">Batal</button><button class="btn ${danger ? 'btn-primary' : 'btn-primary'}" id="cf-ok" ${danger ? 'style="background:var(--danger);box-shadow:none"' : ''}>${escapeHtml(confirmText)}</button>`,
      onMount: (close) => {
        document.getElementById('cf-cancel').onclick = close;
        document.getElementById('cf-ok').onclick = () => { close(); onConfirm && onConfirm(); };
      }
    });
  },
};

export const Theme = {
  get() { return localStorage.getItem('neochat_theme') || 'dark'; },
  set(t) {
    if (t === 'system') {
      t = window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('neochat_theme', t);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = t === 'dark' ? '🌙' : '☀️';
  },
  toggle() {
    const cur = document.documentElement.getAttribute('data-theme');
    this.set(cur === 'dark' ? 'light' : 'dark');
  },
  init() { this.set(localStorage.getItem('neochat_theme') || 'dark'); }
};

export const ContextMenu = {
  show(x, y, items) {
    const menu = document.getElementById('context-menu');
    menu.innerHTML = items.map((it, i) => {
      if (it.sep) return '<div class="ctx-sep"></div>';
      return `<button class="ctx-item ${it.danger ? 'danger' : ''}" data-i="${i}">${it.icon || ''} <span>${escapeHtml(it.label)}</span></button>`;
    }).join('');
    menu.classList.remove('hidden');
    // Reposition if off-screen
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    if (x + rect.width > vw) x = vw - rect.width - 8;
    if (y + rect.height > vh) y = vh - rect.height - 8;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.querySelectorAll('.ctx-item').forEach(b => {
      b.onclick = () => {
        const it = items[Number(b.dataset.i)];
        this.hide();
        it.onClick && it.onClick();
      };
    });
    setTimeout(() => {
      const off = (e) => {
        if (!menu.contains(e.target)) { this.hide(); document.removeEventListener('click', off); }
      };
      document.addEventListener('click', off);
    }, 0);
  },
  hide() {
    const menu = document.getElementById('context-menu');
    if (menu) menu.classList.add('hidden');
  }
};

export const EmojiPicker = {
  EMOJIS: {
    '😀': ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕'],
    '👋': ['👋','🤚','🖐️','✋','🖖','👌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦶','👂','🦻','👃','🧠','🦷','🦴','👀','👁️','👅','👄'],
    '🐶': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦚','🦜','🦢','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔'],
    '🍎': ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🥗','🥘','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🍵','🧃','🥤','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊'],
    '⚽': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'],
    '✈️': ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍️','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🛰️','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','⚓','⛽','🚧','🚦','🚥','🚏','🗺️','🗿','🗽','🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺','🏠','🏡','🏘️','🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪','🕌','🕍','🛕','🕋','⛩️','🛤️','🛣️','🗾','🎑','🏞️','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙️','🌃','🌌','🌉','🌁'],
    '💡': ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🧰','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚙️','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪒','🧽','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
    '❤️': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','♾️','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','👁️‍🗨️','💬','💭','🗯️','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛'],
  },
  init(onPick) {
    const picker = document.getElementById('emoji-picker');
    if (!picker) return;
    const cats = Object.keys(this.EMOJIS);
    picker.innerHTML = `
      <div class="ep-tabs">${cats.map((c, i) => `<button class="ep-tab ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('')}</div>
      <div class="ep-grid" id="ep-grid"></div>
    `;
    const render = (cat) => {
      picker.querySelector('#ep-grid').innerHTML = this.EMOJIS[cat].map(e => `<div class="ep-item" data-emoji="${e}">${e}</div>`).join('');
    };
    render(cats[0]);
    picker.querySelectorAll('.ep-tab').forEach(t => t.onclick = () => {
      picker.querySelectorAll('.ep-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      render(t.dataset.cat);
    });
    picker.addEventListener('click', (e) => {
      const item = e.target.closest('.ep-item');
      if (item) onPick(item.dataset.emoji);
    });
    document.addEventListener('click', (e) => {
      if (!picker.classList.contains('hidden') && !picker.contains(e.target) && e.target.id !== 'emoji-btn') {
        picker.classList.add('hidden');
      }
    });
  },
  toggle() {
    document.getElementById('emoji-picker')?.classList.toggle('hidden');
  }
};

// Helpers
export function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
}
export function fmtTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  const isYest = d.toDateString() === yest.toDateString();
  if (sameDay) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (isYest) return 'Kemarin';
  const days = (now - d) / 86400000;
  if (days < 7) return d.toLocaleDateString('id-ID', { weekday: 'short' });
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
}
export function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}
export function fmtLastSeen(ts) {
  if (!ts) return 'offline';
  const d = new Date(ts);
  const diff = Date.now() - ts;
  if (diff < 60000) return 'baru saja';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' menit lalu';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' jam lalu';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

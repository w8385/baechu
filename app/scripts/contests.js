const ext = global.browser || global.chrome;

const iconify = document.createElement('script');
iconify.src =
  'https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js';
document.head.append(iconify);

const button = document.createElement('button');
button.setAttribute('onclick', `$('[data-toggle="tooltip"]').tooltip();`);
document.body.append(button);

ext.runtime.sendMessage({ query: 'getDB' }, (db) => {
  const contests = document.querySelectorAll('td > a[href^="/contest/view"]');
  for (const contest of contests) {
    const contestId = contest.href.split('/').at(-1);
    const info = db[contestId];
    if (!info) continue;
    for (const key in info) {
      const text = info[key];
      if (key === 'warning') {
        contest.parentElement.append(' ', createIconLabel(key, text));
        continue;
      }
      contest.parentElement.append(' ', createLabel(key, text));
    }
  }
  button.click();
});

function createLabel(key, text) {
  const label = document.createElement('span');
  label.classList.add('label', `baechu-label-${key}`);
  label.setAttribute('data-toggle', 'tooltip');
  label.setAttribute('data-placement', 'top');
  label.setAttribute('title', text);
  label.append(ext.i18n.getMessage(key));
  return label;
}

function createIconLabel(key, text) {
  const label = document.createElement('iconify-icon');
  label.classList.add('baechu-icon', `baechu-label-${key}`);
  label.setAttribute('data-toggle', 'tooltip');
  label.setAttribute('data-placement', 'top');
  label.setAttribute('title', text);
  return label;
}

const HIDDEN_CLASS = 'baechu-hidden-by-extension';
const visibilityState = {
  'baechu-label-badge': true,
  'baechu-label-background': true,
  'baechu-label-warning': true,
};

/* CSS */
const style = document.createElement('style');
style.textContent = `
  .${HIDDEN_CLASS} {
    display: none !important;
  }
`;
document.head.appendChild(style);

function applyVisibility(className, visible) {
  document.querySelectorAll(`.${className}`).forEach((el) => {
    el.classList.toggle(HIDDEN_CLASS, !visible);
  });
}

/* 초기 상태 로드 */
ext.storage.local.get(null, (res) => {
  Object.entries(res).forEach(([key, value]) => {
    if (key.startsWith('baechu-label-')) {
      visibilityState[key] = value;
      applyVisibility(key, value);
    }
  });
});

/* popup 메시지 */
ext.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TOGGLE_CLASS_VISIBILITY') {
    visibilityState[msg.className] = msg.visible;
    applyVisibility(msg.className, msg.visible);
  }
});

/* DOM 변화 감지 */
const observer = new MutationObserver(() => {
  Object.entries(visibilityState).forEach(([className, visible]) => {
    applyVisibility(className, visible);
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

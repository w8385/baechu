const ext = global.browser || global.chrome;

const mappings = {
  'toggle-badge': 'baechu-label-badge',
  'toggle-background': 'baechu-label-background',
  'toggle-warning': 'baechu-label-warning',
};

Object.entries(mappings).forEach(([checkboxId, className]) => {
  const checkbox = document.getElementById(checkboxId);

  /* 초기 상태 로드 */
  ext.storage.local.get([className], (res) => {
    checkbox.checked = res[className] ?? true;
  });

  /* 토글 변경 */
  checkbox.addEventListener('change', () => {
    const visible = checkbox.checked;

    ext.storage.local.set({ [className]: visible });

    ext.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;

      ext.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_CLASS_VISIBILITY',
        className,
        visible,
      });
    });
  });
});

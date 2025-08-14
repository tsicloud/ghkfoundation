// /assets/qr-app.js (compat: soldair "qrcode" OR davidshimjs "qrcodejs")
(function () {
  const textarea = document.getElementById('qrText');
  const sizeInput = document.getElementById('size');
  const marginInput = document.getElementById('margin');
  const eccSelect = document.getElementById('ecc');
  const darkColorInput = document.getElementById('darkColor');
  const lightColorInput = document.getElementById('lightColor');
  const canvas = document.getElementById('qrCanvas');
  const statusEl = document.getElementById('status');
  const previewWrap = document.getElementById('previewWrap');

  const genBtn = document.getElementById('generateBtn');
  const pngBtn = document.getElementById('downloadPngBtn');
  const svgBtn = document.getElementById('downloadSvgBtn');
  const clearBtn = document.getElementById('clearBtn');

  function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }
  function enableDownloads(enablePng, enableSvg) {
    if (pngBtn) pngBtn.disabled = !enablePng;
    if (svgBtn) svgBtn.disabled = !enableSvg;
  }

  function getOpts() {
    return {
      text: (textarea?.value || '').trim(),
      size: Math.max(64, parseInt(sizeInput?.value || '256', 10)),
      margin: Math.max(0, parseInt(marginInput?.value || '4', 10)),
      ecc: (eccSelect?.value || 'M'),
      dark: darkColorInput?.value || '#000000',
      light: lightColorInput?.value || '#ffffff'
    };
  }

  function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function isSoldairAPI() {
    // soldair/node-qrcode browser bundle
    return !!(window.QRCode && typeof window.QRCode.toCanvas === 'function');
  }

  function isShimAPI() {
    // davidshimjs/qrcodejs bundle
    return !!(window.QRCode && typeof window.QRCode === 'function' && window.QRCode.CorrectLevel);
  }

  function eccToCorrectLevel(ecc) {
    const lv = (window.QRCode && window.QRCode.CorrectLevel) || {};
    const map = { L: lv.L, M: lv.M, Q: lv.Q, H: lv.H };
    return map[ecc] || lv.M;
  }

  async function generateQR() {
    const { text, size, margin, ecc, dark, light } = getOpts();
    if (!text) {
      setStatus('Enter some text or a URL to generate a QR code.');
      enableDownloads(false, false);
      clearCanvas();
      if (previewWrap) previewWrap.innerHTML = '<canvas id="qrCanvas" width="256" height="256"></canvas>';
      return;
    }

    // soldair API path (supports SVG)
    if (isSoldairAPI()) {
      canvas.width = size; canvas.height = size;
      setStatus('Generating…');
      window.QRCode.toCanvas(
        canvas,
        text,
        { width: size, margin, errorCorrectionLevel: ecc, color: { dark, light } },
        function (err) {
          if (err) {
            console.error(err);
            setStatus('Error: ' + err.message);
            enableDownloads(false, false);
          } else {
            setStatus('Done. You can download as PNG or SVG.');
            enableDownloads(true, true);
          }
        }
      );
      return;
    }

    // davidshimjs fallback (PNG only)
    if (isShimAPI()) {
      setStatus('Generating…');
      if (previewWrap) previewWrap.innerHTML = '';
      const holder = document.createElement('div');
      if (previewWrap) previewWrap.appendChild(holder);
      try {
        new window.QRCode(holder, {
          text,
          width: size,
          height: size,
          colorDark: dark,
          colorLight: light,
          correctLevel: eccToCorrectLevel(ecc)
        });
        setStatus('Done. (SVG download not available with this library)');
        enableDownloads(true, false);
      } catch (e) {
        console.error(e);
        setStatus('Error: ' + e.message);
        enableDownloads(false, false);
      }
      return;
    }

    setStatus('QR library not loaded. Ensure /assets/qrcode.min.js is present.');
    enableDownloads(false, false);
  }

  function downloadPng() {
    // Prefer the fixed <canvas>; if not present, try shim-rendered canvas inside previewWrap
    let cnv = canvas;
    if ((!cnv || !cnv.getContext) && previewWrap) {
      cnv = previewWrap.querySelector('canvas');
    }
    if (!cnv || !cnv.toDataURL) {
      setStatus('PNG download unavailable. No canvas found.');
      return;
    }
    const link = document.createElement('a');
    link.download = 'qr.png';
    link.href = cnv.toDataURL('image/png');
    link.click();
  }

  async function downloadSvg() {
    if (!isSoldairAPI()) {
      setStatus('SVG download not supported with this library.');
      return;
    }
    const { text, size, margin, ecc, dark, light } = getOpts();
    try {
      const svgString = await window.QRCode.toString(text, {
        type: 'svg', width: size, margin, errorCorrectionLevel: ecc, color: { dark, light }
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'qr.svg'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setStatus('SVG error: ' + e.message);
    }
  }

  function clearAll() {
    if (textarea) textarea.value = '';
    setStatus('Cleared.');
    enableDownloads(false, false);
    clearCanvas();
    if (previewWrap) previewWrap.innerHTML = '<canvas id="qrCanvas" width="256" height="256"></canvas>';
  }

  genBtn?.addEventListener('click', generateQR);
  pngBtn?.addEventListener('click', downloadPng);
  svgBtn?.addEventListener('click', downloadSvg);
  clearBtn?.addEventListener('click', clearAll);

  if (textarea) textarea.value = 'https://example.com';
  setStatus('Ready.');
})();
// /assets/qr-app.js (robust loader + compat: soldair "qrcode" OR davidshimjs "qrcodejs")
(function () {
  const textarea = document.getElementById('qrText');
  const sizeInput = document.getElementById('size');
  const marginInput = document.getElementById('margin');
  const eccSelect = document.getElementById('ecc');
  const darkColorInput = document.getElementById('darkColor');
  const lightColorInput = document.getElementById('lightColor');
  const canvas = document.getElementById('qrCanvas');
  const statusEl = document.getElementById('status');
  const previewWrap = document.getElementById('previewWrap');

  const genBtn = document.getElementById('generateBtn');
  const pngBtn = document.getElementById('downloadPngBtn');
  const svgBtn = document.getElementById('downloadSvgBtn');
  const clearBtn = document.getElementById('clearBtn');

  function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }
  function enableDownloads(enablePng, enableSvg) {
    if (pngBtn) pngBtn.disabled = !enablePng;
    if (svgBtn) svgBtn.disabled = !enableSvg;
  }

  function getOpts() {
    return {
      text: (textarea?.value || '').trim(),
      size: Math.max(64, parseInt(sizeInput?.value || '256', 10)),
      margin: Math.max(0, parseInt(marginInput?.value || '4', 10)),
      ecc: (eccSelect?.value || 'M'),
      dark: darkColorInput?.value || '#000000',
      light: lightColorInput?.value || '#ffffff'
    };
  }

  function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function isSoldairAPI() {
    // soldair/node-qrcode browser bundle
    return !!(window.QRCode && typeof window.QRCode.toCanvas === 'function');
  }

  function isShimAPI() {
    // davidshimjs/qrcodejs bundle
    return !!(window.QRCode && typeof window.QRCode === 'function' && window.QRCode.CorrectLevel);
  }

  function eccToCorrectLevel(ecc) {
    const lv = (window.QRCode && window.QRCode.CorrectLevel) || {};
    const map = { L: lv.L, M: lv.M, Q: lv.Q, H: lv.H };
    return map[ecc] || lv.M;
  }

  function scriptExists(src) {
    return Array.from(document.scripts).some(s => s.src && s.src.includes(src));
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if (scriptExists(src)) {
        // If already in DOM, wait a tick in case it's still loading
        return setTimeout(() => resolve(), 50);
      }
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = (e) => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensureLib() {
    if (isSoldairAPI() || isShimAPI()) return true;
    setStatus('Loading QR library…');
    // Try common local paths
    const candidates = [
      '/assets/qrcode.min.js',
      '/assets/qrcode.js',
      '/assets/qrcodejs/qrcode.min.js',
      '/assets/qrcodejs/qrcode.js'
    ];
    for (const path of candidates) {
      try {
        await loadScriptOnce(path);
        if (isSoldairAPI() || isShimAPI()) {
          setStatus('Ready.');
          return true;
        }
      } catch (e) {
        // try next
      }
    }
    setStatus('QR library not loaded. Ensure /assets/qrcode.min.js exists.');
    return false;
  }

  async function generateQR() {
    const ok = await ensureLib();
    if (!ok) {
      enableDownloads(false, false);
      return;
    }

    const { text, size, margin, ecc, dark, light } = getOpts();
    if (!text) {
      setStatus('Enter some text or a URL to generate a QR code.');
      enableDownloads(false, false);
      clearCanvas();
      if (previewWrap) previewWrap.innerHTML = '<canvas id="qrCanvas" width="256" height="256"></canvas>';
      return;
    }

    // soldair API path (supports SVG)
    if (isSoldairAPI()) {
      canvas.width = size; canvas.height = size;
      setStatus('Generating…');
      window.QRCode.toCanvas(
        canvas,
        text,
        { width: size, margin, errorCorrectionLevel: ecc, color: { dark, light } },
        function (err) {
          if (err) {
            console.error(err);
            setStatus('Error: ' + err.message);
            enableDownloads(false, false);
          } else {
            setStatus('Done. You can download as PNG or SVG.');
            enableDownloads(true, true);
          }
        }
      );
      return;
    }

    // davidshimjs fallback (PNG only)
    if (isShimAPI()) {
      setStatus('Generating…');
      if (previewWrap) previewWrap.innerHTML = '';
      const holder = document.createElement('div');
      if (previewWrap) previewWrap.appendChild(holder);
      try {
        new window.QRCode(holder, {
          text,
          width: size,
          height: size,
          colorDark: dark,
          colorLight: light,
          correctLevel: eccToCorrectLevel(ecc)
        });
        setStatus('Done. (SVG download not available with this library)');
        enableDownloads(true, false);
      } catch (e) {
        console.error(e);
        setStatus('Error: ' + e.message);
        enableDownloads(false, false);
      }
      return;
    }

    setStatus('QR library not loaded.');
    enableDownloads(false, false);
  }

  function downloadPng() {
    let cnv = canvas;
    if ((!cnv || !cnv.getContext) && previewWrap) {
      cnv = previewWrap.querySelector('canvas');
    }
    if (!cnv || !cnv.toDataURL) {
      setStatus('PNG download unavailable. No canvas found.');
      return;
    }
    const link = document.createElement('a');
    link.download = 'qr.png';
    link.href = cnv.toDataURL('image/png');
    link.click();
  }

  async function downloadSvg() {
    const ok = await ensureLib();
    if (!ok || !isSoldairAPI()) {
      setStatus('SVG download not supported with this library.');
      return;
    }
    const { text, size, margin, ecc, dark, light } = getOpts();
    try {
      const svgString = await window.QRCode.toString(text, {
        type: 'svg', width: size, margin, errorCorrectionLevel: ecc, color: { dark, light }
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'qr.svg'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setStatus('SVG error: ' + e.message);
    }
  }

  function clearAll() {
    if (textarea) textarea.value = '';
    setStatus('Cleared.');
    enableDownloads(false, false);
    clearCanvas();
    if (previewWrap) previewWrap.innerHTML = '<canvas id="qrCanvas" width="256" height="256"></canvas>';
  }

  genBtn?.addEventListener('click', generateQR);
  pngBtn?.addEventListener('click', downloadPng);
  svgBtn?.addEventListener('click', downloadSvg);
  clearBtn?.addEventListener('click', clearAll);

  // Startup: detect & report which API is available
  (async () => {
    // If the HTML already included the script, this will just pass
    await ensureLib();
    if (isSoldairAPI()) setStatus('Ready. (engine: soldair)');
    else if (isShimAPI()) setStatus('Ready. (engine: qrcodejs)');
    else setStatus('QR library not loaded. Click Generate to retry.');
    if (textarea) textarea.value = 'https://example.com';
  })();
})();
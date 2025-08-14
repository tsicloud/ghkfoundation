// /assets/qr-app.js
(function () {
  const textarea = document.getElementById('qrText');
  const sizeInput = document.getElementById('size');
  const marginInput = document.getElementById('margin');
  const eccSelect = document.getElementById('ecc');
  const darkColorInput = document.getElementById('darkColor');
  const lightColorInput = document.getElementById('lightColor');
  const canvas = document.getElementById('qrCanvas');
  const statusEl = document.getElementById('status');

  const genBtn = document.getElementById('generateBtn');
  const pngBtn = document.getElementById('downloadPngBtn');
  const svgBtn = document.getElementById('downloadSvgBtn');
  const clearBtn = document.getElementById('clearBtn');

  function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }
  function enableDownloads(enable) {
    if (pngBtn) pngBtn.disabled = !enable;
    if (svgBtn) svgBtn.disabled = !enable;
  }

  function generateQR() {
    if (!window.QRCode) {
      setStatus('QR library not loaded.');
      return;
    }
    const text = (textarea?.value || '').trim();
    if (!text) {
      setStatus('Enter some text or a URL to generate a QR code.');
      enableDownloads(false);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const size = Math.max(64, parseInt(sizeInput?.value || '256', 10));
    const margin = Math.max(0, parseInt(marginInput?.value || '4', 10));
    const ecc = (eccSelect?.value || 'M');
    const dark = darkColorInput?.value || '#000000';
    const light = lightColorInput?.value || '#ffffff';

    canvas.width = size;
    canvas.height = size;

    setStatus('Generating…');
    window.QRCode.toCanvas(
      canvas,
      text,
      { width: size, margin, errorCorrectionLevel: ecc, color: { dark, light } },
      function (err) {
        if (err) {
          console.error(err);
          setStatus('Error: ' + err.message);
          enableDownloads(false);
        } else {
          setStatus('Done. You can download as PNG or SVG.');
          enableDownloads(true);
        }
      }
    );
  }

  function downloadPng() {
    const link = document.createElement('a');
    link.download = 'qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function downloadSvg() {
    if (!window.QRCode) {
      setStatus('QR library not loaded.');
      return;
    }
    const text = (textarea?.value || '').trim();
    if (!text) return;

    try {
      const size = Math.max(64, parseInt(sizeInput?.value || '256', 10));
      const margin = Math.max(0, parseInt(marginInput?.value || '4', 10));
      const ecc = (eccSelect?.value || 'M');
      const dark = darkColorInput?.value || '#000000';
      const light = lightColorInput?.value || '#ffffff';

      const svgString = await window.QRCode.toString(text, {
        type: 'svg', width: size, margin, errorCorrectionLevel: ecc, color: { dark, light }
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr.svg';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setStatus('SVG error: ' + e.message);
    }
  }

  function clearAll() {
    if (textarea) textarea.value = '';
    setStatus('Cleared.');
    enableDownloads(false);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Wire up events
  genBtn?.addEventListener('click', generateQR);
  pngBtn?.addEventListener('click', downloadPng);
  svgBtn?.addEventListener('click', downloadSvg);
  clearBtn?.addEventListener('click', clearAll);

  // Initial fill
  if (textarea) textarea.value = 'https://example.com';
  setStatus('Ready.');
})();
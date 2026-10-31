function applyScanFilter(data, mode) {
  if (!['enhance', 'grayscale', 'blackwhite'].includes(mode)) throw Error('Choose a scan filter.');
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(.299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2]);
    if (mode === 'grayscale') data[i] = data[i + 1] = data[i + 2] = gray;
    else if (mode === 'blackwhite') data[i] = data[i + 1] = data[i + 2] = gray >= 170 ? 255 : 0;
    else for (let j = 0; j < 3; j++) data[i + j] = Math.max(0, Math.min(255, (data[i + j] - 128) * 1.2 + 136));
  }
  return data;
}
module.exports = {applyScanFilter};

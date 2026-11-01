function scanLayout(paper, width, height, marginOption = '0') {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw Error('Could not read page dimensions.');
  const sizes = {a4: [595.28, 841.89], letter: [612, 792]};
  let pageWidth, pageHeight;
  if (paper === 'original') {
    const scale = Math.min(1, 14400 / Math.max(width, height));
    pageWidth = width * scale;
    pageHeight = height * scale;
  } else {
    const size = sizes[paper] || sizes.a4;
    [pageWidth, pageHeight] = width > height ? [size[1], size[0]] : size;
  }
  const requested = marginOption === 'small' ? 12 : marginOption === 'medium' ? 24 : 0;
  const margin = Math.min(requested, pageWidth / 4, pageHeight / 4);
  return {width: pageWidth, height: pageHeight, margin};
}
module.exports = {scanLayout};

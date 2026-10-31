function scanLayout(paper, width, height) {
  if (!(width > 0 && height > 0)) throw Error('Could not read page dimensions.');
  const sizes = {a4: [595.28, 841.89], letter: [612, 792]};
  if (paper === 'original') {
    const scale = Math.min(1, 14400 / Math.max(width, height));
    return {width: width * scale, height: height * scale, margin: 0};
  }
  const size = sizes[paper] || sizes.a4;
  return width > height ? {width: size[1], height: size[0], margin: 24} : {width: size[0], height: size[1], margin: 24};
}
module.exports = {scanLayout};

const fs = require('fs');
const PNG = require('png-js');
const IMG_WIDTH = 2880; // Updated image width

PNG.decode('mansionBounds.png', function (data, err) {
  if (err) {
    console.error('Error decoding PNG:', err);
    return;
  }

  if (!data || data.length === 0) {
    console.error('Decoded data is empty or invalid.');
    return;
  }


  const result = {};
  for (let i = 0; i < data.length; i += 4) {
    const row = Math.floor(i / 4 / IMG_WIDTH);
    if (data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) {
      if (result[row]) {
        result[row].push((i / 4) % IMG_WIDTH);
      } else {
        result[row] = [(i / 4) % IMG_WIDTH];
      }
    }
  }
  fs.writeFileSync(
    './mapBounds.js',
    'export const mapBounds = ' + JSON.stringify(result),
  );
});

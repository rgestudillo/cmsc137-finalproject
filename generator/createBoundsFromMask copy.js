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

  // Debugging - Check first few pixel values
  console.log(`First few pixels:`);
  for (let i = 0; i < 20; i += 4) {
    console.log(`Pixel ${i / 4}: R=${data[i]}, G=${data[i + 1]}, B=${data[i + 2]}, A=${data[i + 3]}`);
  }

  // Loop through each pixel to find green pixels (tuned for your map's green outline)
  for (let i = 0; i < data.length; i += 4) {
    const row = Math.floor(i / 4 / IMG_WIDTH); // Row based on pixel index
    const col = (i / 4) % IMG_WIDTH; // Column based on pixel index

    // Check for green pixels with a relaxed tolerance (targeting green outlines)
    if (data[i] <= 50 && data[i + 1] >= 200 && data[i + 1] <= 255 && data[i + 2] <= 50 && data[i + 3] > 0) {
      // If the pixel is a greenish color and not transparent
      if (result[row]) {
        result[row].push(col);
      } else {
        result[row] = [col];
      }
    }
  }

  // Write the result to a file
  fs.writeFileSync('./mapBounds.js', 'export const mapBounds = ' + JSON.stringify(result));

  // Debugging - Output result to verify
  console.log(result);
});

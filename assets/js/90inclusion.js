function calculatePercentile(values, percentile) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

function calculateInclusionWindowForFrequency(values) {
  const lowerPercentile = calculatePercentile(values, 5); // 5th percentile
  const upperPercentile = calculatePercentile(values, 95); // 95th percentile

  return {
      lower: lowerPercentile,
      upper: upperPercentile,
  };
}

function calculateInclusionWindows(rawChannels) {
  const numFrequencies = rawChannels[0].length; // 480 ppo

  const upperBounds = [];
  const lowerBounds = [];

  for (let i = 0; i < numFrequencies; i++) {
      const frequency = rawChannels[0][i][0]; // assumes all measurements have the same frequencies
      const dbValues = rawChannels.map(channel => channel[i][1]);

      const inclusionWindow = calculateInclusionWindowForFrequency(dbValues);
      upperBounds.push([frequency, inclusionWindow.upper]);
      lowerBounds.push([frequency, inclusionWindow.lower]);
  }

  // Prompt user to download bounds
    function downloadFile(data, filename) {
      const formattedData = data.map(item => item.join(', ')).join('\n');
      const blob = new Blob([formattedData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  // uncomment one at a time to download the lower and upper bounds, limitations of browser
  // downloadFile(lowerBounds, 'lower_bounds.txt');
  // downloadFile(upperBounds, 'upper_bounds.txt');
  return [upperBounds, lowerBounds];
}

const inclusionName = " 90% Inclusion"; // edit this to change the name of the inclusion zone

function setBoundsPhone(p, ch) {
  let ninetyPercentInclusion = {
    brand: p.brand, dispBrand: p.dispBrand, is90Bounds: true,
    phone: p.dispName + inclusionName, fullName: p.fullName + inclusionName,
    dispName: p.dispName + inclusionName, fileName: p.fullName + inclusionName,
    rawChannels: ch, channels: ch, lr: ch, norm: p.norm, id: -69
  }

  return ninetyPercentInclusion;
}
/**
 * @format
 * @OnlyCurrentDoc
 */

// Spodaj so definirani stolpci "Moji izvidi", "Avtorizirani izvidi" in "Popravljeni izvidi"
// Če bi rad spremenil kateri stolpec predstavlja kaj lahko samo popraviš te spremenljivke
var stolpecMojiIzvidi = 'D';
var stolpecAvtoriziraniIzvidi = 'E';
var stolpecPopravljeniIzvidi = 'C';

function onEdit(e) {
  var mojiRange = SpreadsheetApp.getActiveSheet().getRange('D2:D').getValues();
  var avtoriziraniRange = SpreadsheetApp.getActiveSheet()
    .getRange('E2:E')
    .getValues();

  var count = 0;
  while (mojiRange[count] != '' || avtoriziraniRange[count] != '') {
    count = count + 1;
  }

  for (var i = 0; i < count; i++) {
    var cellIndex = i + 2;
    var outCellValue = SpreadsheetApp.getActiveSheet()
      .getRange('C' + cellIndex.toString())
      .getValue();
    if (!outCellValue && mojiRange[i] != '' && avtoriziraniRange[i] != '') {
      compareCellText(
        stolpecMojiIzvidi + cellIndex.toString(),
        stolpecAvtoriziraniIzvidi + cellIndex.toString(),
        stolpecPopravljeniIzvidi + cellIndex.toString()
      );
    }
  }
}

function compareCellText(cell1, cell2, cell_out) {
  // Check for null or empty values
  if (!cell1 || !cell2 || !cell_out) {
    return 'Error: Null or empty input.';
  }
  var sheet = SpreadsheetApp.getActiveSheet();
  const inputCell1 = sheet.getRange(cell1);
  const inputCell2 = sheet.getRange(cell2);
  const outputCell = sheet.getRange(cell_out);

  var text1 = inputCell1.getValue();
  var text2 = inputCell2.getValue();

  // Use diff_match_patch to find differences
  var dmp = new diff_match_patch();
  var diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);

  let textSnips = [];
  let errorSnips = [];
  var textLengths = [];

  for (var i = 0; i < diffs.length; i++) {
    var diffType = diffs[i][0];
    var diffText = diffs[i][1];

    textSnips.push(diffText);
    errorSnips.push(diffType);
    textLengths.push(diffText.length);
  }

  var interText = textSnips.join('');
  var value = SpreadsheetApp.newRichTextValue().setText(interText);

  var deletions = SpreadsheetApp.newTextStyle()
    .setStrikethrough(true)
    .setForegroundColor('red')
    .build();
  var additions = SpreadsheetApp.newTextStyle()
    .setUnderline(true)
    .setForegroundColor('blue')
    .build();
  var clear = SpreadsheetApp.newTextStyle()
    .setStrikethrough(false)
    .setUnderline(false)
    .setForegroundColor('black')
    .build();

  value.setTextStyle(clear);

  var counter = 0;
  for (var i = 0; i < textLengths.length; i++) {
    if (textLengths[i] === 0) {
      continue;
    }
    if (errorSnips[i] === 1) {
      value.setTextStyle(counter, counter + textLengths[i], additions);
    } else if (errorSnips[i] === -1) {
      value.setTextStyle(counter, counter + textLengths[i], deletions);
    }
    counter = counter + textLengths[i];
  }

  // Set the rich text value in the output cell
  outputCell.setRichTextValue(value.build());
}

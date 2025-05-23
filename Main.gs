/**
 * Majhen programček, ki omogoča primerjavo dveh tekstov (npr. izvid preiskave pred in po avtorizaciji).
 * Avtorji:
 * - Jakob Meglič (prvotni avtor in avtor ideje) 2024,
 * - Simon Rekanovič (popravki za hitrejše procesiranje in dodatni UI elementi) 2025.
 *
 * @format
 * @OnlyCurrentDoc
 */

/**
 * PREGLED OSNOVNE FUNKCIONALNOSTI
 *
 * Doda meni za ročni zagon primerjave.
 *
 * Primerja prvotni in avtoriziran tekst in pokaže spremembe:
 *  - izbrisan tekst je obarva z rdečo in prečrtan
 *  - dodan tekst je obarvan z modro in podčrtan.
 *
 * Vključuje obsežen sistem logiranja napak, procesov primerjave in delovanja - za lažje spremljanje in popravke.
 */

// --- Osnovni podatki ---
// Spodaj so definirani stolpci
// Če bi rad spremenil kateri stolpec predstavlja kaj lahko samo popraviš te spremenljivke
const SOURCE_COLUMN_1 = 'D'; //"Moji izvidi"
const SOURCE_COLUMN_2 = 'E'; //"Avtorizirani izvidi"
const OUTPUT_COLUMN = 'C'; //"Popravljeni izvidi"
const START_ROW = 2; //Ne spreminjaj, določi začetek delovanja programa v drugi vrstici

const MENU_NAME = 'Primerjava izvidov';
const MENU_FUNCTION = 'processTextComparisons';

/**
 * Doda meni za ročni zagon primerjave.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(MENU_NAME)
    .addItem('Izvedi batch primerjavo', MENU_FUNCTION)
    .addToUi();
}

/**
 * Glavne funkcija za batch processing function.
 *
 * Reads source columns in bulk, generates diff for each row, and writes
 * each result individually to preserve styling behavior.
 */
function processTextComparisons() {
  const FN = 'processTextComparisons';
  Logger.log(`[${FN}] Start`);
  const ui = SpreadsheetApp.getActive();
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < START_ROW) {
      Logger.log(`[${FN}] No data (lastRow=${lastRow})`);
      ui.toast('Ni podatkov za primerjavo.', 'Status', 5);
      return;
    }

    const numRows = lastRow - START_ROW + 1;
    ui.toast(
      'Poteka primerjava. Primerjanih bo ' + numRows + ' vrstic',
      'Primerjam',
      10
    );
    Logger.log(`[${FN}] Processing ${numRows} rows`);

    // Bulk read input values
    const values1 = sheet
      .getRange(`${SOURCE_COLUMN_1}${START_ROW}:${SOURCE_COLUMN_1}${lastRow}`)
      .getDisplayValues();
    const values2 = sheet
      .getRange(`${SOURCE_COLUMN_2}${START_ROW}:${SOURCE_COLUMN_2}${lastRow}`)
      .getDisplayValues();

    let changedCount = 0;

    for (let i = 0; i < numRows; i++) {
      const row = START_ROW + i;
      const t1 = String(values1[i][0] || '');
      const t2 = String(values2[i][0] || '');
      const outCell = sheet.getRange(`${OUTPUT_COLUMN}${row}`);
      const existing = outCell.getValue();

      if (!existing && t1 && t2) {
        Logger.log(`[${FN}] Row ${row}: computing diff`);
        try {
          const richText = createRichTextDiff(t1, t2);
          outCell.setRichTextValue(richText);

          Logger.log(`[${FN}] Row ${row}: written rich text`);
          changedCount++;
        } catch (err) {
          Logger.log(
            `[${FN}] ERROR createRichTextDiff@row${row}: ${err.message}`
          );
          outCell.setValue(`ERROR: ${err.message}`);
        }
      } else {
        Logger.log(
          `[${FN}] Row ${row}: skip (exists:${!!existing}, t1:${!!t1}, t2:${!!t2})`
        );
      }
    }

    if (changedCount > 0) {
      ui.toast(
        `Primerjava končana – primerjanih je bilo \n${changedCount} \ntekstov.`,
        'KONČANO',
        10
      );
    } else {
      ui.toast('Primerjava končana – ni sprememb.', 'Info', 5);
    }
  } catch (e) {
    Logger.log(`[${FN}] UNEXPECTED ERROR: ${e.stack}`);
    ui.toast(`Napaka: ${e.message}`, 'Napaka', 15);
  }
  Logger.log(`[${FN}] End`);
}

/**
 * Osnovna diff + styling logika.
 *
 * Returns a RichTextValue highlighting deletions and insertions.
 * Extensive logging included.
 */
function createRichTextDiff(text1, text2) {
  const FN = 'createRichTextDiff';
  Logger.log(`[${FN}] Start: len1=${text1.length}, len2=${text2.length}`);

  if (typeof diff_match_patch === 'undefined') {
    Logger.log(`[${FN}] ERROR: diff_match_patch library missing`);
    throw new Error('diff_match_patch library not found.');
  }
  if (typeof text1 !== 'string' || typeof text2 !== 'string') {
    Logger.log(
      `[${FN}] ERROR: invalid input types (t1:${typeof text1}, t2:${typeof text2})`
    );
    throw new Error('Both inputs must be strings.');
  }

  const dmp = new diff_match_patch();
  let diffs;
  try {
    diffs = dmp.diff_main(text1, text2);
    Logger.log(`[${FN}] diff_main: ${diffs.length} segments`);
    dmp.diff_cleanupSemantic(diffs);
    Logger.log(`[${FN}] diff_cleanupSemantic done`);
  } catch (e) {
    Logger.log(`[${FN}] ERROR computing diffs: ${e.message}`);
    throw e;
  }

  // Build flat text
  let flatText = '';
  try {
    for (let idxSeg = 0; idxSeg < diffs.length; idxSeg++) {
      const seg = diffs[idxSeg];
      const part = seg[1] !== undefined ? seg[1] : String(seg.text || '');
      flatText += part;
    }
    Logger.log(`[${FN}] flatText length=${flatText.length}`);
  } catch (e) {
    Logger.log(`[${FN}] ERROR building flatText: ${e.message}`);
    throw e;
  }

  const builder = SpreadsheetApp.newRichTextValue().setText(flatText);
  const clearStyle = SpreadsheetApp.newTextStyle()
    .setForegroundColor('#000000')
    .setUnderline(false)
    .setStrikethrough(false)
    .build();
  builder.setTextStyle(0, flatText.length, clearStyle);
  Logger.log(`[${FN}] Applied clear style`);

  const deletions = SpreadsheetApp.newTextStyle()
    .setStrikethrough(true)
    .setForegroundColor('red')
    .build();
  const additions = SpreadsheetApp.newTextStyle()
    .setBold(true)
    .setForegroundColor('blue')
    .build();
  Logger.log(`[${FN}] Styles built`);

  // Apply styles segment by segment using numeric ops
  let idx = 0;
  try {
    for (let idxSeg = 0; idxSeg < diffs.length; idxSeg++) {
      const seg = diffs[idxSeg];
      const op = seg[0]; // -1 for delete, 1 for insert, 0 for equal
      const part = seg[1] !== undefined ? seg[1] : String(seg.text || '');
      const len = part.length;
      Logger.log(
        `[${FN}] segment ${idxSeg}: op=${op}, start=${idx}, len=${len}`
      );
      if (len > 0) {
        if (op === 1) {
          builder.setTextStyle(idx, idx + len, additions);
          Logger.log(`[${FN}] Applied addition style at ${idx}-${idx + len}`);
        } else if (op === -1) {
          builder.setTextStyle(idx, idx + len, deletions);
          Logger.log(`[${FN}] Applied deletion style at ${idx}-${idx + len}`);
        }
        idx += len;
      }
    }
    Logger.log(`[${FN}] Applied diff styles`);
  } catch (e) {
    Logger.log(`[${FN}] ERROR applying styles: ${e.message}`);
    throw e;
  }

  Logger.log(`[${FN}] End`);
  return builder.build();
}

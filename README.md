<!-- @format -->

# Google Sheets Diff Compare

A Google Apps Script project to compare differences between text in columns using Google Sheets.

## Setup for changes/branches.

1. Clone the repository.
2. Install `clasp`: `npm install -g @google/clasp`
3. Log in: `clasp login`
4. Create a new Apps Script project or clone an existing one: `clasp create --title "My Diff Compare Script"` or `clasp clone <scriptId>`
5. Push files: `clasp push`

## Usage

This script compares text between two columns in a Google Sheet and highlights the differences using rich text formatting in a designated column.

**Sheet Structure:**

- **Column 1 (A):** Unique ID for each row.
- **Column 2 (B):** Optional metadata (e.g., note, date, supervisor).
- **Column 3 (C):** Output column where the script places the rich text comparison results.
- **Column 4 (D):** The original text to be compared.
- **Column 5 (E):** The revised/latest version of the text to compare against the original.

**How to Use:**

1.  **Option 1 (For Developers):** Add the script code to your Google Sheet via `Extensions > Apps Script`. Follow the setup instructions above to push the code using `clasp` or manually copy.
2.  **Option 2 (For Non-Coders):** Copy the template Google Sheet (link to be provided) which already has the script associated with it.
3.  Ensure your data is structured according to the columns described above.
4.  Run the comparison function (details on how to trigger the function, e.g., via a custom menu, should be added here). The script will populate Column C with the differences highlighted.

## Features

- Compares text in Column D (Original) and Column E (Revised).
- Outputs a rich-text formatted comparison in Column C.
- Uses the `diff-match-patch` library for accurate differencing.
- Includes extensive logging for debugging and maintenance.
- Formatted with Prettier for code consistency.

## Authorship and License

- **Initial Development (2024):** Jakob Meglič
- **Later Development (2025):** Simon Rekanovič

The core text comparison logic utilizes the `diff-match-patch` library developed by Google, Inc., which is licensed under the Apache License 2.0. The original library code was added to this project without modification and is available at [https://github.com/google/diff-match-patch](https://github.com/google/diff-match-patch).

This project's specific Apps Script code is licensed under the [Apache License 2.0](LICENSE). You can find the full license text in the LICENSE file.

**Note:** AI assistance (e.g., GitHub Copilot) was used to support the development of this project.

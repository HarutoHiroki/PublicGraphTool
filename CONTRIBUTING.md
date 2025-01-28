# For Contributors
- The code is a mess, I know. I'm working on it. I'm sorry.
- If you want to contribute and help translate the tool, all the source English text is in the `en.json` file. Just copy the file and rename it to your language code (make sure to use ISO 639-1 Language Codes for auto-detection e.g. `fr.json` for French) and translate the text. I'll take care of the rest.
- The translation feature will always prioritize what's in the language files. If a text is missing in the translation file, it will default to the text in the `config.json` file.
- Please don't make any text/value `null`. If you want to not have a text/value, just leave it empty (e.g. `""` or `[]`).
- For targets, each target `"type"` is a key in the language files. The value of the key is the name of the category of targets.

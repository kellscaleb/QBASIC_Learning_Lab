# QBASIC Learning Lab

A no-install browser app for learning a friendly subset of QBASIC. It is responsive and runs completely on the device: there is no server, login, or upload required.

## Run it

Open `index.html` in a modern browser. For the best development experience, open the folder in VS Code and use its **Live Server** extension (or any simple local web server).

## What it includes

- **Learn**: four guided typing lessons with live error feedback and progress.
- **Code**: a line-numbered editor, examples, run/stop, saved programs, `.bas` download, and local-file open.
- **Graphics**: a canvas and example programs for shapes, stars, and a rainbow.

Programs saved with **Save** use browser local storage and remain only in that browser profile. Use **Download** to create a portable `.bas` file.

## Supported QBASIC commands

`PRINT`, `INPUT`, variables (including string variables ending in `$`), `LET`, `CLS`, `IF...THEN...ELSE...END IF`, `FOR...NEXT`, `GOTO`, `GOSUB`, `RETURN`, labels, `END`, `RND`, `INT`, `ABS`, arithmetic and comparisons.

Graphics: `SCREEN`, `PSET`, `LINE` (including `B` and `BF`), `CIRCLE`, and `PAINT`.

This is a learning interpreter, not a full QBASIC emulator. Unsupported commands stop with a line-numbered message rather than running arbitrary code.

## Project layout

```
index.html          App shell
css/style.css       Responsive presentation
js/app.js           UI, editor, tutor, and wiring
js/interpreter.js   Safe QBASIC subset interpreter
js/graphics.js      Canvas drawing commands
js/programs.js      Lessons and example programs
js/storage.js       Browser-local saved programs
```

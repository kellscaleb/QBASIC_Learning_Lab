export const lessons = [
  { title: 'Say hello', description: 'PRINT writes text to the screen. Text must be inside quotation marks.', code: 'CLS\nPRINT "Hello, world!"\nEND' },
  { title: 'Ask a question', description: 'INPUT pauses the program and asks the runner for a value.', code: 'CLS\nINPUT "What is your name"; name$\nPRINT "Hello, "; name$\nEND' },
  { title: 'Count with a loop', description: 'FOR and NEXT repeat a section of code.', code: 'CLS\nFOR number = 1 TO 5\n  PRINT number\nNEXT number\nEND' },
  { title: 'Make a choice', description: 'IF checks whether a condition is true.', code: 'CLS\nINPUT "Enter a number"; number\nIF number > 10 THEN\n  PRINT "That is big!"\nELSE\n  PRINT "That is 10 or less."\nEND IF\nEND' }
];

export const examples = [
  { name: 'Hello', code: 'CLS\nPRINT "Welcome to QBASIC Learning Lab!"\nPRINT "Write code, then press Run."\nEND' },
  { name: 'Number guess', code: 'CLS\nsecret = INT(RND * 10) + 1\nINPUT "Guess a number from 1 to 10"; guess\nIF guess = secret THEN\n  PRINT "You got it!"\nELSE\n  PRINT "Not this time. The answer was "; secret\nEND IF\nEND' },
  { name: 'Times table', code: 'CLS\nINPUT "Which multiplication table"; number\nFOR count = 1 TO 12\n  PRINT number; " x "; count; " = "; number * count\nNEXT count\nEND' },
  { name: 'Subroutine', code: 'CLS\nPRINT "Before the subroutine"\nGOSUB Cheer\nPRINT "Back in the main program"\nEND\n\nCheer:\nPRINT "Hooray!"\nRETURN' }
];

export const graphicsExamples = {
  shapes: 'SCREEN 13\nCLS\nLINE (40,40)-(250,160), 14, B\nLINE (40,40)-(250,160), 11, BF\nCIRCLE (360,110), 70, 12\nPAINT (360,110), 4, 12\nPSET (500,50), 15\nPRINT "Shapes!"\nEND',
  stars: 'SCREEN 13\nCLS\nFOR star = 1 TO 180\n  x = INT(RND * 640)\n  y = INT(RND * 400)\n  PSET (x,y), INT(RND * 15) + 1\nNEXT star\nEND',
  rainbow: 'SCREEN 13\nCLS\nFOR color = 1 TO 15\n  CIRCLE (320,390), color * 24, color\nNEXT color\nEND'
};

export const qbasicColors = ['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa','#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff'];

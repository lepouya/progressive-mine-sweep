# Progressive Mine Sweep

This is my progressive / incremental take on the classic minesweeper game

The user should start with a small and simple version of minesweep (3x3 with 1 mine?)

There will be 2 scores tracked: number of correct cells, and number of solved puzzles

(internally, we can track clicks, fails, mines, and auto vs manual version of all of these)

Progressive elements can be unlocked by using these scores: increase width, height,
number of mines, score per cell/puzzle, etc.

Automated aspects can be gradually introduced: Auto expand empty cells, logic reasoning for cells,
advancing it, making automation faster, auto mine marker, and guesser

Perhaps I could do prestige/reset options once this is ready

## TODO

### ~~M0: Framework and project config~~

### ~~M1: Get classic minesweeper working~~

### ~~M2: Make it incremental~~

### M3: Tutorial

- ~~Recover from failed loads~~
- Add a tutorial for starting the game and how to progress
- Tooltips and help options
- Add color themes

### M4: Automation

- Auto reset puzzle + interval
- Auto fill blank squares + upgrade interval
- Auto guess when stuck? + interval
- Auto hint + improvements + interval
- Auto mine + improvements? + interval
- Auto reason + improvements + interval

### M5: Achievements

- Add achievement tracking
- Some basic achievements to complete
- Bonuses for achivements
- More complex achievements perhaps
- More complex bonuses?

### M6: Prestige

- Brainstorm on what can be done here

### Bugs, Issues, and Ideas

- Resource selling?
- Resource minimums
- Better unit testing for models and utils
- Go through all the colors used and make a map under :root
- Figure out how to make a component glow or be highlighted for tutorials
- Add names and ids to important components
- buttons for next and prev

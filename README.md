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

### M2: Make it incremental

- ~~Set up resource management~~
- ~~Track and use game resources~~
- ~~Report game currencies on screen~~
- ~~Reseting board dialog and delays~~
- ~~Add options for increasing grid size~~
- ~~Add options for changing difficulty~~
- ~~Hint purchase, and options to increase hint quality~~
- Options to improve reset time
- Score multipliers

### M2: Automation

- Auto reset puzzle + interval
- Auto fill blank squares + upgrade interval
- Auto guess when stuck? + interval
- Auto hint + improvements + interval
- Auto mine + improvements? + interval
- Auto reason + improvements + interval

### M3: Tutorial

- Add a tutorial for starting the game and how to progress
- Tooltips and help options

### M4: Achievements

- Add achievement tracking
- Some basic achievements to complete
- Bonuses for achivements
- More complex achievements perhaps
- More complex bonuses?

### M5: Prestige

- Brainstorm on what can be done here

### Bugs to fix

- Resource selling?
- Resource minimums

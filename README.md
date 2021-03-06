# Progressive Mine Sweep

This is my progressive / incremental take on the classic minesweeper game

The user starts with a small and simple version of minesweep (3x3 with 1 mine),
and from there progresses to larger and more difficult boards.

There's 2 main scores tracked: number of correct cells, and number of solved
puzzles. All the other tracking for flags, clicks, losses, etc are tracked as
more resources that can be used to purchase upgrades later.

Progressive elements can be unlocked by using these scores: increase width,
height, number of mines, score per cell/puzzle, etc.

Automated aspects can be gradually introduced: Auto expand empty cells, logic
reasoning for cells, advancing it, making automation faster, auto mine marker,
and guesser

Perhaps I could do prestige/reset options once this is ready

## Finished Milestones

### ~~M0: Framework and project config~~

### ~~M1: Get classic minesweeper working~~

### ~~M2: Make it incremental~~

### ~~M3: Tutorial and themes~~

### ~~M4: Automation~~

### ~~M5: Achievements~~

## Future Milestones

### M6: Prestige

- Brainstorm on what can be done here
- Offline progress summary
- Mine shields
- Score multipliers and cost reducers
- Automation speed up

## Bugs, Issues, and Ideas

- Turn off all automation options
- Offline time counter might be broken
- Hint buying is bonused twice
- Negative numbers should truncate upwards
- First click shouldn't lead to explosion
- Rebalance hint costs
- Turning off auto click on reset doesn't actually turn it off

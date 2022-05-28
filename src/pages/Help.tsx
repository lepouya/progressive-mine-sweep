export default function Help() {
  return (
    <div>
      <div className="panel help">
        <div className="title-bar">Progressive Mine Sweep</div>
        <div className="full">
          This game is my take on the classic Minesweeper puzzle and making
          incremental aspects to it. The incremental part is not quite ready
          yet, so this version of the game has a normal playable field with
          controls at the bottom of the page to change the size and difficulty
          level.
        </div>
        <div className="full">
          I will put some more info here later about how to play minesweeper,
          but for now, you need to know that there is a playing field, and there
          is a number of mines buried under the squares on the field. The size
          of the field is shown on upper left corner of the scoreboard, and the
          number of mines is displaying on the upper right corner.
        </div>
        <div className="full">
          You can reveal the squares on the field by tapping on them. Each
          square is either a mine, or shows a clue of how many squares
          neighboring it have a mine on them -- from 8-ways, including diagonal
          neighbors. If a square that was revealed was a mine, the field
          explodes and you lose the game.
        </div>
        <div className="full">
          When you flag a square, you are marking it as a possible location for
          a mine. Have in mind that this doesn't necessarily mean it has a mine
          under it, as you might have made a mistake. Eventually, the number of
          flagged mines should match the number of mines on the field and the
          rest of squares should be revealed to win the game.
        </div>
        <div className="full">
          You can flag a square by either right clicking on it, or (when right
          click is not an option) by holding any of the modifier keys (either
          ctrl, alt, or meta) and clicking. Additionally, there is a selector at
          the top of the field to change the tapping style on mobile devices to
          be either revealing the squares, or flagging them. Tap on this button
          to toggle the reveal/flag mode.
        </div>
        <div className="full">
          The game is won when all the squares are revealed and all the mines
          are correctly flagged.
        </div>
      </div>
    </div>
  );
}

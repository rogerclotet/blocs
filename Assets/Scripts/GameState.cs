public class GameState
{
    public int score;
    public BoardState board;
    public PieceDefinition[] pieces;
    public GameState previous;

    public GameState(int score, BoardState board, PieceDefinition[] pieces, GameState previous)
    {
        this.score = score;
        this.board = board;
        this.pieces = pieces;
        this.previous = previous;
    }
}

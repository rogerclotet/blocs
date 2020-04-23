using UnityEngine;

public class GameState
{
    public int score;
    public BoardState board;
    public PieceDefinition[] pieces;
    public Random.State randomState;
    public GameState previous;

    public GameState(int score, BoardState board, PieceDefinition[] pieces, Random.State randomState, GameState previous)
    {
        this.score = score;
        this.board = board;
        this.pieces = pieces;
        this.randomState = randomState;
        this.previous = previous;
    }
}

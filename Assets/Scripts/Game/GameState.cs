using UnityEngine;

[System.Serializable]
public class GameState
{
    public int score;
    public int highScore;
    public BoardState board;
    public PieceDefinitionData[] pieces;
    public Random.State randomState;
}

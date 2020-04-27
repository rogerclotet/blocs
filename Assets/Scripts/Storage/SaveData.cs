using UnityEngine;

[System.Serializable]
public class SaveData
{
    public int highScore;
    public int highScoreBlocks;
    public HistoryEntry[] history;
    public GameState state;
    public GameState[] previousStates;
    public int undoTimes;
}

[System.Serializable]
public struct HistoryEntry
{
    public int score;
    public int blocks;
}

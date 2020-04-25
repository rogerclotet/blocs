using UnityEngine;

[System.Serializable]
public class SaveData
{
    public int highScore;
    public GameState state;
    public GameState[] previousStates;
    public int undoTimes;
}

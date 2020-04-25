using UnityEngine;

[System.Serializable]
public class SaveData
{
    public GameState state;
    public GameState[] previousStates;
    public int undoTimes;
}

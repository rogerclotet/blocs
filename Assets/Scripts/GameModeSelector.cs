using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum GameMode
{
    New,
    Continue,
}

public static class GameModeSelector
{
    public static GameMode Selected { get; set; }
}

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Cell : MonoBehaviour
{
    public Vector2 Position { get; protected set; }

    public void Init(Vector2 position)
    {
        Position = position;
    }
}

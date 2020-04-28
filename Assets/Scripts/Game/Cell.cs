using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Cell : MonoBehaviour
{
    private Block block;

    public Vector2 Position { get; protected set; }
    public bool Empty
    {
        get
        {
            return block == null || !block.Active;
        }
    }

    public void Init(Vector2 position)
    {
        Position = position;
    }

    public void Place(Block block)
    {
        this.block = block;
        block.Assign(this);
    }

    public void Clear(float delay)
    {
        if (block != null)
        {
            block.Clear(delay);
        }
    }
}

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BoardState
{
    public bool[][] filledCells;

    public BoardState(int size)
    {
        filledCells = new bool[size][];
        for (int i = 0; i < size; i++)
        {
            filledCells[i] = new bool[size];
        }
    }
}

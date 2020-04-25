using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

[System.Serializable]
public class PieceDefinitionData
{
    public int columns;
    public int rows;
    public Position[] blockPositions;

    public PieceDefinition ToDefinition()
    {
        PieceDefinition def = (PieceDefinition)ScriptableObject.CreateInstance("PieceDefinition");
        def.columns = columns;
        def.rows = rows;
        def.blockPositions = blockPositions.ToList().ConvertAll(v => new Vector2Int() { x = v.x, y = v.y }).ToArray();

        return def;
    }
}

[System.Serializable]
public class Position
{
    public int x;
    public int y;
}

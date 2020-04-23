using System;
using UnityEngine;

[CreateAssetMenu(fileName = "PieceDefinition", menuName = "Piece Definition", order = 1)]
public class PieceDefinition : ScriptableObject
{
    public int columns;
    public int rows;
    public Vector2Int[] blockPositions;

    public PieceDefinition Clone()
    {
        PieceDefinition def = (PieceDefinition)ScriptableObject.CreateInstance("PieceDefinition");
        def.columns = columns;
        def.rows = rows;
        def.blockPositions = (Vector2Int[])blockPositions.Clone();

        return def;
    }
}

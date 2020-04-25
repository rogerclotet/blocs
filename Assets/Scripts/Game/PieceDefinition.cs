using System;
using System.Linq;
using UnityEngine;

[CreateAssetMenu(fileName = "PieceDefinition", menuName = "Piece Definition", order = 1)]
public class PieceDefinition : ScriptableObject
{
    public int columns;
    public int rows;
    public Vector2Int[] blockPositions;

    public PieceDefinitionData Data()
    {
        return new PieceDefinitionData()
        {
            columns = columns,
            rows = rows,
            blockPositions = blockPositions.ToList().ConvertAll(v => new Position() { x = v.x, y = v.y }).ToArray(),
        };
    }
}

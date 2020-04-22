using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "PieceDefinition", menuName = "Piece Definition", order = 1)]
public class PieceDefinition : ScriptableObject
{
    public int columns;
    public int rows;
    public Vector2Int[] blockPositions;
}

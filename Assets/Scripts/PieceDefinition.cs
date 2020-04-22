using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "PieceDefinition", menuName = "Piece Definition", order = 1)]
public class PieceDefinition : ScriptableObject
{
    public int squareSize;
    public Vector2Int[] blockPositions;
}

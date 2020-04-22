using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class PieceFactory
{
    public static Piece[] CreatePieceSet(int amount, Piece piecePrefab, Canvas canvas)
    {
        Piece[] pieces = new Piece[amount];
        for (int i = 0; i < amount; i++)
        {
            Piece p = GameObject.Instantiate(piecePrefab);
            p.canvas = canvas;
            pieces[i] = p;
        }

        return pieces;
    }
}

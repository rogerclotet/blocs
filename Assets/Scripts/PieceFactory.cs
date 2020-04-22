using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public static class PieceFactory
{
    public static Piece[] CreatePieceSet(
        int amount,
        PieceDefinition[] definitions,
        Piece piecePrefab,
        Block blockPrefab,
        GameObject emptyBlockPrefab,
        Canvas canvas
    )
    {
        PieceDefinition[] defs = definitions.OrderBy(x => Random.value).Take(amount).ToArray();

        Piece[] pieces = new Piece[amount];
        for (int i = 0; i < defs.Length; i++)
        {
            Piece p = GameObject.Instantiate(piecePrefab);
            p.Init(defs[i], blockPrefab, emptyBlockPrefab);
            p.canvas = canvas;
            pieces[i] = p;
        }

        return pieces;
    }
}

using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public static class PieceFactory
{
    public static Piece[] CreateRandomPieceSet(
        Random.State state,
        int amount,
        PieceDefinition[] definitions,
        Piece piecePrefab,
        Block blockPrefab,
        GameObject emptyBlockPrefab,
        Canvas canvas
    )
    {
        Random.state = state;

        PieceDefinition[] defs = definitions.OrderBy(x => Random.value).Take(amount).ToArray();

        return CreatePieceSet(defs, piecePrefab, blockPrefab, emptyBlockPrefab, canvas);
    }

    public static Piece[] CreatePieceSet(
        PieceDefinition[] definitions,
        Piece piecePrefab,
        Block blockPrefab,
        GameObject emptyBlockPrefab,
        Canvas canvas
    )
    {
        Piece[] pieces = new Piece[definitions.Length];
        for (int i = 0; i < definitions.Length; i++)
        {
            Piece p = GameObject.Instantiate(piecePrefab);
            PieceDefinition def = definitions[i];

            if (def == null)
            {
                pieces[i] = null;
            }
            else
            {
                p.Init(i, def, blockPrefab, emptyBlockPrefab);
                p.canvas = canvas;
                pieces[i] = p;
            }
        }

        return pieces;
    }
}

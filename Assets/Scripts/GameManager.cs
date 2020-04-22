using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public Piece piecePrefab;
    public Block blockPrefab;
    public GameObject emptyBlockPrefab;
    public PieceDefinition[] pieceDefinitions;
    public Canvas canvas;

    private int emptySlots = 0;

    private const int slotsAmount = 3;

    void Start()
    {
        GeneratePieces();
    }

    void GeneratePieces()
    {
        GameObject[] slots = GameObject.FindGameObjectsWithTag("PieceSlot");
        Piece[] pieces = PieceFactory.CreatePieceSet(slotsAmount, pieceDefinitions, piecePrefab, blockPrefab, emptyBlockPrefab, canvas);

        for (int i = 0; i < pieces.Length; i++)
        {
            pieces[i].transform.SetParent(slots[i].transform);
            pieces[i].transform.localScale = Vector3.one;
        }
    }

    public void PiecePlaced()
    {
        emptySlots++;

        if (emptySlots >= slotsAmount)
        {
            GeneratePieces();
            emptySlots = 0;
        }
    }
}

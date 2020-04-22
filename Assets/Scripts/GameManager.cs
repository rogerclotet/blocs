using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class GameManager : MonoBehaviour
{
    public Piece piecePrefab;
    public Block blockPrefab;
    public GameObject emptyBlockPrefab;
    public PieceDefinition[] pieceDefinitions;
    public Canvas canvas;
    public Text scoreText;

    public int Score { get; set; }

    private int emptySlots = 0;
    private int displayedScore;
    private float lastScoreUpdate;

    private const int slotsAmount = 3;

    void Start()
    {
        GeneratePieces();
    }

    void Update()
    {
        float now = Time.realtimeSinceStartup;

        if (now < lastScoreUpdate + 0.05f) return;

        lastScoreUpdate = now;

        if (displayedScore < Score)
        {
            displayedScore++;
        }

        scoreText.text = $"Score: {displayedScore.ToString()}";
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

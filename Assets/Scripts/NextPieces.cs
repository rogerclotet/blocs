using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NextPieces : MonoBehaviour
{
    public Piece piecePrefab;
    public Block blockPrefab;
    public GameObject emptyBlockPrefab;
    public Canvas canvas;

    public Random.State RandomState { get; set; }
    public PieceDefinition[] Definitions { get; protected set; }
    public bool Empty
    {
        get
        {
            foreach (PieceDefinition def in Definitions)
            {
                if (def != null) return false;
            }
            return true;
        }
    }

    private PieceDefinition[] pieceDefinitions;
    private GameObject[] slots;

    private const int slotsAmount = 3;

    void Awake()
    {
        pieceDefinitions = Resources.LoadAll<PieceDefinition>("PieceDefinitions");
    }

    void Start()
    {
        RandomState = Random.state;
        slots = GameObject.FindGameObjectsWithTag("PieceSlot");
        Definitions = new PieceDefinition[slotsAmount];
    }

    public void OnPiecePlaced(Piece piece)
    {
        Definitions[piece.Slot] = null;

        if (Empty)
        {
            GeneratePieces();
        }
    }

    public void GeneratePieces()
    {
        Piece[] pieces = PieceFactory.CreateRandomPieceSet(RandomState, slotsAmount, pieceDefinitions, piecePrefab, blockPrefab, emptyBlockPrefab, canvas);

        RandomState = Random.state;

        SetPieces(pieces);
    }

    public void GeneratePieces(PieceDefinition[] definitions)
    {
        Piece[] pieces = PieceFactory.CreatePieceSet(definitions, piecePrefab, blockPrefab, emptyBlockPrefab, canvas);

        SetPieces(pieces);
    }

    void SetPieces(Piece[] pieces)
    {
        Piece[] previousPieces = GetComponentsInChildren<Piece>();
        foreach (Piece piece in previousPieces)
        {
            Destroy(piece.gameObject);
        }

        for (int i = 0; i < pieces.Length; i++)
        {
            Piece p = pieces[i];

            if (p != null)
            {
                p.transform.SetParent(slots[i].transform);
                p.transform.localScale = Vector3.one;
                p.transform.localPosition = Vector3.zero;

                Definitions[i] = p.Definition;
            }
            else
            {
                Definitions[i] = null;
            }
        }
    }
}

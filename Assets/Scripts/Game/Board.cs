using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class Board : MonoBehaviour, IDropHandler
{
    public GameManager gameManager;
    public ScoreManager scoreManager;
    public EventSystem eventSystem;
    public Cell cellPrefab;
    public Block blockPrefab;
    public AudioSource lineClearedAudioSource;
    public AudioSource piecePlacedAudioSource;

    private Cell[][] cells;
    private GraphicRaycaster raycaster;
    private int multiplier = 1;
    private int prevMultiplier = 1;

    private const int size = 10;
    private const float blockClearDelayIncrement = 0.05f;

    void Awake()
    {
        Transform parentGrid = GameObject.FindGameObjectWithTag("CellGrid").transform;

        cells = new Cell[size][];
        for (int i = 0; i < size; i++)
        {
            cells[i] = new Cell[size];
            for (int j = 0; j < size; j++)
            {
                Cell cell = Instantiate(cellPrefab);
                cell.Init(new Vector2(i, j));
                cells[i][j] = cell;

                cell.transform.SetParent(parentGrid);
                cell.transform.localScale = Vector3.one;
            }
        }
    }

    void Start()
    {
        raycaster = GetComponent<GraphicRaycaster>();
    }

    public void OnDrop(PointerEventData eventData)
    {
        if (eventData.pointerDrag == null) return;

        Piece piece = eventData.pointerDrag.GetComponent<Piece>();
        if (piece == null) return;

        Block[] blocks = piece.GetComponentsInChildren<Block>();
        Cell[] cellsUnderBlocks = new Cell[blocks.Length];
        for (int i = 0; i < blocks.Length; i++)
        {
            Block block = blocks[i];
            Cell cell = GetCellUnderBlock(block);
            if (cell == null || !cell.Empty)
            {
                // We can't place some of the blocks
                return;
            }

            cellsUnderBlocks[i] = cell;
        }

        PlaceBlocksInCells(piece, blocks, cellsUnderBlocks);

        piecePlacedAudioSource.PlayOneShot(piecePlacedAudioSource.clip);

        RemoveCompleteLines();

        if (prevMultiplier == multiplier)
        {
            multiplier = 1;
        }
        prevMultiplier = multiplier;

        Destroy(eventData.pointerDrag);

        gameManager.OnPiecePlaced(piece);
    }

    public bool IsPiecePlaceable(PieceDefinition piece)
    {
        for (int i = 0; i < size - piece.rows + 1; i++)
        {
            for (int j = 0; j < size - piece.columns + 1; j++)
            {
                if (IsPiecePlaceableFrom(piece, i, j))
                {
                    return true;
                }
            }
        }

        return false;
    }

    bool IsPiecePlaceableFrom(PieceDefinition piece, int row, int col)
    {
        for (int k = 0; k < piece.blockPositions.Length; k++)
        {
            Vector2Int pos = piece.blockPositions[k];

            if (!cells[row + pos.x][col + pos.y].Empty)
            {
                return false;
            }
        }

        return true;
    }

    Cell GetCellUnderBlock(Block block)
    {
        PointerEventData eventData = new PointerEventData(eventSystem);
        eventData.position = block.transform.position;

        List<RaycastResult> results = new List<RaycastResult>();

        raycaster.Raycast(eventData, results);
        foreach (RaycastResult result in results)
        {
            GameObject o = result.gameObject;
            Cell cell = o.GetComponent<Cell>();
            if (cell != null)
            {
                return cell;
            }
        }

        return null;
    }

    void PlaceBlocksInCells(Piece piece, Block[] blocks, Cell[] cellsUnderBlocks)
    {
        int scoreToAdd = 0;
        for (int i = 0; i < blocks.Length; i++)
        {
            Block b = blocks[i];
            cellsUnderBlocks[i].Place(b);
            scoreToAdd++;
        }

        scoreToAdd *= prevMultiplier;

        scoreManager.AddPiece(piece, scoreToAdd, prevMultiplier);
    }

    void RemoveCompleteLines()
    {
        bool[] completeRows = new bool[size];
        bool[] completeColumns = new bool[size];
        for (int i = 0; i < size; i++)
        {
            completeRows[i] = true;
            completeColumns[i] = true;
        }

        for (int i = 0; i < size; i++)
        {
            for (int j = 0; j < size; j++)
            {
                if (cells[i][j].Empty)
                {
                    completeRows[i] = false;
                    completeColumns[j] = false;
                }
            }
        }

        bool playSound = false;

        for (int i = 0; i < size; i++)
        {
            if (completeRows[i])
            {
                ClearRow(i);
                playSound = true;
            }

            if (completeColumns[i])
            {
                ClearColumn(i);
                playSound = true;
            }
        }

        if (playSound)
        {
            lineClearedAudioSource.pitch = Mathf.Min(0.4f + 0.2f * multiplier, 1.8f);
            lineClearedAudioSource.PlayOneShot(lineClearedAudioSource.clip);
        }
    }

    void ClearRow(int row)
    {
        float delay = 0;
        int pointsToAdd = 0;
        for (int j = 0; j < size; j++)
        {
            bool cleared = ClearCell(row, j, delay);
            if (cleared)
            {
                pointsToAdd++;
                delay += blockClearDelayIncrement;
            }
        }

        pointsToAdd *= multiplier;

        Vector2 pos = cells[row][4].transform.position + (cells[row][5].transform.position - cells[row][4].transform.position) / 2;

        scoreManager.AddClearedLine(pointsToAdd, pos, multiplier);

        multiplier++;
    }

    void ClearColumn(int column)
    {
        float delay = 0;
        int pointsToAdd = 0;
        for (int i = 0; i < size; i++)
        {
            bool cleared = ClearCell(i, column, delay);
            if (cleared)
            {
                pointsToAdd++;
                delay += blockClearDelayIncrement;
            }
        }

        pointsToAdd *= multiplier;

        Vector2 pos = cells[4][column].transform.position + (cells[5][column].transform.position - cells[4][column].transform.position) / 2;

        scoreManager.AddClearedLine(pointsToAdd, pos, multiplier);

        multiplier++;
    }

    bool ClearCell(int row, int column, float delay)
    {
        Cell c = cells[row][column];
        if (!c.Empty)
        {
            c.Clear(delay);
            return true;
        }

        return false;
    }

    public BoardState Export()
    {
        BoardState state = new BoardState(size);

        for (int i = 0; i < size; i++)
        {
            for (int j = 0; j < size; j++)
            {
                state.filledCells[i][j] = !cells[i][j].Empty;
            }
        }

        state.multiplier = multiplier;

        return state;
    }

    public void Import(BoardState state)
    {
        for (int i = 0; i < size; i++)
        {
            for (int j = 0; j < size; j++)
            {
                Cell c = cells[i][j];

                if (state.filledCells[i][j])
                {
                    if (c.Empty)
                    {
                        Block b = Instantiate(blockPrefab);
                        c.Place(b);
                        b.transform.localPosition = Vector3.zero;
                    }
                }
                else
                {
                    c.Clear(0);
                }
            }
        }

        prevMultiplier = Mathf.Max(1, state.multiplier - 1);
        multiplier = state.multiplier;
    }
}

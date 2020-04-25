using System;
using System.Collections;
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

    private Cell[][] cells;
    private GraphicRaycaster raycaster;

    private const int size = 10;

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

        PlaceBlocksInCells(blocks, cellsUnderBlocks);

        RemoveCompleteLines();

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

    void PlaceBlocksInCells(Block[] blocks, Cell[] cellsUnderBlocks)
    {
        int scoreToAdd = 0;
        for (int i = 0; i < blocks.Length; i++)
        {
            Block b = blocks[i];
            cellsUnderBlocks[i].Place(b);
            scoreToAdd++;
        }

        scoreManager.AddPiece(scoreToAdd);
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

        for (int i = 0; i < size; i++)
        {
            if (completeRows[i])
            {
                ClearRow(i);
            }

            if (completeColumns[i])
            {
                ClearColumn(i);
            }
        }
    }

    void ClearRow(int row)
    {
        int pointsToAdd = 0;
        for (int j = 0; j < size; j++)
        {
            bool cleared = ClearCell(row, j);
            if (cleared)
            {
                pointsToAdd++;
            }
        }

        scoreManager.AddClearedLine(pointsToAdd);
    }

    void ClearColumn(int column)
    {
        int pointsToAdd = 0;
        for (int i = 0; i < size; i++)
        {
            bool cleared = ClearCell(i, column);
            if (cleared)
            {
                pointsToAdd++;
            }
        }

        scoreManager.AddClearedLine(pointsToAdd);
    }

    bool ClearCell(int row, int column)
    {
        Cell c = cells[row][column];
        if (!c.Empty)
        {
            c.Clear();
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
                    }
                }
                else
                {
                    c.Clear();
                }
            }
        }
    }
}

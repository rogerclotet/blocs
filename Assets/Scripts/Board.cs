using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class Board : MonoBehaviour, IDropHandler, IPointerEnterHandler, IPointerExitHandler
{
    public GameManager gameManager;
    public EventSystem eventSystem;
    public Cell cellPrefab;

    private Cell[][] cells;
    private GameObject dragging;
    private GraphicRaycaster raycaster;

    private const int size = 10;

    void Start()
    {
        raycaster = GetComponent<GraphicRaycaster>();

        Transform parentGrid = GetComponentInChildren<GridLayoutGroup>().transform;

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

    void Update()
    {
        // If dragging, highlight legal positions
        if (dragging != null)
        {

        }
    }

    public void OnPointerEnter(PointerEventData eventData)
    {
        if (eventData.pointerDrag == null) return;

        dragging = eventData.pointerDrag;
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        dragging = null;

        // TODO Remove highlight
    }

    public void OnDrop(PointerEventData eventData)
    {
        if (eventData.pointerDrag == null) return; // TODO check it's actually a piece?

        Block[] blocks = dragging.GetComponentsInChildren<Block>();
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
        gameManager.PiecePlaced();
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
        for (int i = 0; i < blocks.Length; i++)
        {
            Block b = blocks[i];
            cellsUnderBlocks[i].Place(b);
            gameManager.Score++;
        }
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
        for (int j = 0; j < size; j++)
        {
            ClearCell(row, j);
        }
    }

    void ClearColumn(int column)
    {
        for (int i = 0; i < size; i++)
        {
            ClearCell(i, column);
        }
    }

    void ClearCell(int row, int column)
    {
        Cell c = cells[row][column];
        if (!c.Empty)
        {
            c.Clear();
            gameManager.Score++;
        }
    }
}

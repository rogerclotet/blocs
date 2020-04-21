using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class Board : MonoBehaviour, IDropHandler, IPointerEnterHandler, IPointerExitHandler
{
    public EventSystem eventSystem;

    private Cell[][] cells;
    private GameObject dragging;
    private GraphicRaycaster raycaster;

    private const int size = 10;

    void Start()
    {
        raycaster = GetComponent<GraphicRaycaster>();

        GameObject[] objects = GameObject.FindGameObjectsWithTag("Cell");
        if (objects.Length != size * size)
        {
            string error = "The board must contain " + size * size + " cells";
            Debug.LogError(error);

            throw new System.Exception(error);
        }

        Cell[][] cellObjects = new Cell[size][];
        for (int i = 0; i < size; i++)
        {
            cellObjects[i] = new Cell[size];
            for (int j = 0; j < size; j++)
            {
                Cell cell = objects[i * size + j].GetComponent<Cell>();
                cell.Init(new Vector2(i, j));
                cellObjects[i][j] = cell;
            }
        }
    }

    void Update()
    {
        // If dragging, highlight legal positions
        if (dragging != null)
        {
            Cell cell = GetCellUnderPiece();
            if (cell != null)
            {
                // Debug.Log("Hit " + cell.transform.name + ": " + cell.Position);
            }
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
        Cell cell = GetCellUnderPiece();
        if (cell != null)
        {
            dragging.GetComponent<Piece>().SetFinalPosition(cell.transform);
        }
    }

    Cell GetCellUnderPiece()
    {
        PointerEventData eventData = new PointerEventData(eventSystem);
        eventData.position = dragging.transform.position;

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
}

using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class Piece : MonoBehaviour, IDragHandler, IBeginDragHandler, IEndDragHandler
{
    enum State
    {
        Idle,
        Dragging,
    }

    public Canvas canvas;

    public PieceDefinition Definition { get; protected set; }
    public int Slot { get; protected set; }

    private State state = State.Idle;
    private CanvasGroup canvasGroup;
    private Transform parentToReturnTo;
    private bool dragEnabled = true;
    private int cellSize;

    private const float returnSpeed = 10;

    void Start()
    {
        canvasGroup = GetComponent<CanvasGroup>();
        parentToReturnTo = transform.parent;
        cellSize = Camera.main.scaledPixelWidth / 10;
    }

    public void Init(int slot, PieceDefinition definition, Block blockPrefab, GameObject emptyBlockPrefab)
    {
        Slot = slot;
        Definition = definition;

        int columns = definition.columns;
        int rows = definition.rows;

        GameObject prefab;

        int defIndex = 0;
        for (int i = 0; i < rows; i++)
        {
            for (int j = 0; j < columns; j++)
            {
                if (defIndex >= definition.blockPositions.Length)
                {
                    prefab = emptyBlockPrefab;
                }
                else
                {
                    Vector2 pos = definition.blockPositions[defIndex];
                    if (pos.x == i && pos.y == j)
                    {
                        prefab = blockPrefab.gameObject;

                        // We start checking the next block in the definition
                        defIndex++;
                    }
                    else
                    {
                        prefab = emptyBlockPrefab;
                    }
                }

                GameObject o = Instantiate(prefab);
                o.transform.SetParent(transform);

                GridLayoutGroup glg = GetComponent<GridLayoutGroup>();
                glg.constraintCount = columns;
            }
        }
    }

    void Update()
    {
        if (state == State.Idle && transform.localPosition != Vector3.zero)
        {
            transform.localPosition = Vector3.Lerp(transform.localPosition, Vector3.zero, returnSpeed * Time.deltaTime);
        }
    }

    public void OnBeginDrag(PointerEventData eventData)
    {
        if (!dragEnabled) return;

        state = State.Dragging;

        canvasGroup.blocksRaycasts = false;
        transform.SetParent(canvas.transform);

        GetComponent<GridLayoutGroup>().cellSize = new Vector2(100, 100); // TODO un-hardcode this

        Block[] blocks = GetComponentsInChildren<Block>();
        foreach (Block block in blocks)
        {
            RectTransform rt = block.GetComponent<RectTransform>();
            rt.sizeDelta = new Vector2(100, 100); // TODO un-hardcode this
        }

        GetComponent<CanvasGroup>().alpha = 0.8f;
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (!dragEnabled) return;

        transform.position = new Vector3(
            eventData.position.x,
            eventData.position.y + (Definition.rows / 2f + 2) * cellSize,
            0
        );
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        if (!dragEnabled) return;

        canvasGroup.blocksRaycasts = true;
        transform.SetParent(parentToReturnTo);

        GetComponent<GridLayoutGroup>().cellSize = new Vector2(60, 60); // TODO un-hardcode this

        Block[] blocks = GetComponentsInChildren<Block>();
        foreach (Block block in blocks)
        {
            RectTransform rt = block.GetComponent<RectTransform>();
            rt.sizeDelta = new Vector2(60, 60); // TODO un-hardcode this
        }

        state = State.Idle;

        GetComponent<CanvasGroup>().alpha = 1f;
    }

    public void SetFinalPosition(Transform parentToGo)
    {
        if (!dragEnabled) return;

        parentToReturnTo = parentToGo;
        dragEnabled = false;

        canvasGroup.blocksRaycasts = true;
        transform.SetParent(parentToReturnTo);
        transform.localScale = Vector3.one;

        state = State.Idle;
    }
}

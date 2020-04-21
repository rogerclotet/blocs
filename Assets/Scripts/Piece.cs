using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

public class Piece : MonoBehaviour, IDragHandler, IBeginDragHandler, IEndDragHandler
{
    enum State
    {
        Idle,
        Dragging,
    }

    public Canvas canvas;

    private State state = State.Idle;
    private CanvasGroup canvasGroup;
    private Transform parentToReturnTo;
    private bool dragEnabled = true;

    private const float returnSpeed = 10;

    void Start()
    {
        canvasGroup = GetComponent<CanvasGroup>();
        parentToReturnTo = transform.parent;
    }

    void Update()
    {
        if (state == State.Idle)
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
        transform.localScale = new Vector3(1.2f, 1.2f, 1.2f);
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (!dragEnabled) return;

        transform.position = new Vector3(
            eventData.position.x,
            eventData.position.y + 50, // TODO use y based on piece height
            0
        );
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        if (!dragEnabled) return;

        canvasGroup.blocksRaycasts = true;
        transform.SetParent(parentToReturnTo);
        transform.localScale = Vector3.one;

        state = State.Idle;
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

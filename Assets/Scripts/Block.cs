using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Block : MonoBehaviour
{
    private const float returnSpeed = 10;
    private bool movingToParent;

    void Update()
    {
        if (movingToParent)
        {
            float t = returnSpeed * Time.deltaTime;
            transform.localPosition = Vector3.Lerp(transform.localPosition, Vector3.zero, t);

            if (t == 1)
            {
                movingToParent = false;
            }
        }
    }

    public void Assign(Cell cell)
    {
        transform.SetParent(cell.transform);
        movingToParent = true;
    }
}

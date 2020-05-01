using System.Collections;
using UnityEngine;

public class Block : MonoBehaviour
{
    public bool Active { get; protected set; }

    private const float returnSpeed = 10;
    private bool movingToParent;

    void Start()
    {
        Active = true;
    }

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

        Animator animator = GetComponent<Animator>();
        animator.Play("BlockPlace");
    }

    public void Clear(float delay)
    {
        Active = false;

        StartCoroutine(DoClear(delay));
    }

    IEnumerator DoClear(float delay)
    {
        yield return new WaitForSeconds(delay);

        Animator animator = GetComponent<Animator>();
        animator.Play("BlockDisappear");
    }

    public void SelfDestruct()
    {
        Destroy(gameObject);
    }
}

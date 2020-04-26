using UnityEngine;
using UnityEngine.UI;

public class FloatingTextManager : MonoBehaviour
{
    public FloatingText prefab;
    public Canvas canvas;

    public void Show(string text, Vector2 position, Color color)
    {
        FloatingText ft = Instantiate(prefab);
        ft.transform.SetParent(canvas.transform);
        ft.transform.position = position;
        ft.transform.localScale = Vector3.one;

        Text t = ft.GetComponentInChildren<Text>();
        t.text = text;
        t.color = color;
    }
}

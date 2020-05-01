using UnityEngine;
using UnityEngine.UI;

abstract public class ApplyColor : MonoBehaviour
{
    public abstract Color color();

    void Start()
    {
        Image image = GetComponent<Image>();
        if (image != null)
        {
            image.color = color();
        }

        Text text = GetComponent<Text>();
        if (text != null)
        {
            text.color = color();
        }

        Destroy(this);
    }
}

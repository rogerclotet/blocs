using UnityEngine;
using UnityEngine.UI;

public class I18nText : MonoBehaviour
{
    public string id;

    void Start()
    {
        GetComponent<Text>().text = I18n.Fields[id];
    }
}

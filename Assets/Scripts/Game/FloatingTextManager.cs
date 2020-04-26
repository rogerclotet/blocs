using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class FloatingTextManager : MonoBehaviour
{
    struct MessageDefinition
    {
        public string Text;
        public Vector2 Position;
        public Color Color;
        public int SizeVariation;
    }

    public FloatingText prefab;
    public Canvas canvas;

    private List<MessageDefinition> msgQueue;
    private float nextMsgTime;

    private const float cooldown = 0.2f;

    void Start()
    {
        msgQueue = new List<MessageDefinition>();
    }

    void Update()
    {
        if (msgQueue.Count > 0 && Time.time > nextMsgTime)
        {
            MessageDefinition msg = msgQueue[0];
            msgQueue.RemoveAt(0);
            DoShow(msg);

            nextMsgTime = Time.time + cooldown;
        }
    }

    public void Show(string text, Vector2 position, Color color, int sizeVariation = 0)
    {
        msgQueue.Add(
            new MessageDefinition()
            {
                Text = text,
                Position = position,
                Color = color,
                SizeVariation = sizeVariation,
            }
        );
    }

    void DoShow(MessageDefinition msgDef)
    {
        FloatingText ft = Instantiate(prefab);
        ft.transform.SetParent(canvas.transform);
        ft.transform.position = msgDef.Position;
        ft.transform.localScale = Vector3.one;

        Text t = ft.GetComponentInChildren<Text>();
        t.text = msgDef.Text;
        t.color = msgDef.Color;
        t.fontSize += msgDef.SizeVariation;
    }
}

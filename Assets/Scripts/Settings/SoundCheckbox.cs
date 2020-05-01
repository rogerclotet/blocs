using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Audio;

public class SoundCheckbox : MonoBehaviour
{
    public Sprite enabledSprite;
    public Sprite disabledSprite;
    public Image checkbox;
    public SoundManager soundManager;

    private Text text;

    void Start()
    {
        text = GetComponentInChildren<Text>();

        UpdateCheckbox();
    }

    public void ToggleSoundEffects()
    {
        if (soundManager.IsMuted())
        {
            soundManager.Unmute();
        }
        else
        {
            soundManager.Mute();
        }

        UpdateCheckbox();
    }

    void UpdateCheckbox()
    {
        if (soundManager.IsMuted())
        {
            checkbox.sprite = disabledSprite;
            text.text = I18n.Fields["settings.sound_effects.disabled"];
        }
        else
        {
            checkbox.sprite = enabledSprite;
            text.text = I18n.Fields["settings.sound_effects.enabled"];
        }
    }
}

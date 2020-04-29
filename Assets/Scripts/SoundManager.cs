using UnityEngine;
using UnityEngine.Audio;

public class SoundManager : MonoBehaviour
{
    public AudioMixerGroup mixerGroup;

    public const string prefsKey = "soundEffects";

    void Start()
    {
        ApplyState();
    }

    public bool IsMuted()
    {
        return PlayerPrefs.HasKey(prefsKey) && PlayerPrefs.GetInt(prefsKey) == 0;
    }

    public void Unmute()
    {
        PlayerPrefs.SetInt(prefsKey, 1);

        ApplyState();
    }

    public void Mute()
    {
        PlayerPrefs.SetInt(prefsKey, 0);

        ApplyState();
    }

    void ApplyState()
    {
        if (IsMuted())
        {
            mixerGroup.audioMixer.SetFloat("EffectsVolume", -80);
        }
        else
        {
            mixerGroup.audioMixer.SetFloat("EffectsVolume", 0);
        }
    }
}

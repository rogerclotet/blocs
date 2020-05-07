using UnityEngine;
using UnityEngine.Audio;

public class SoundManager : MonoBehaviour
{
    private static SoundManager _instance;

    public static SoundManager instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = GameObject.FindObjectOfType<SoundManager>();

                DontDestroyOnLoad(_instance.gameObject);
            }

            return _instance;
        }
    }

    public AudioSource effectsAudioSource;
    public AudioClip buttonSound;

    private const string effectsPrefsKey = "soundEffects";
    private const string effectsVolumeKey = "EffectsVolume";

    void Awake()
    {
        ApplyState();

        if (_instance == null)
        {
            _instance = this;
            AudioSettings.OnAudioConfigurationChanged += OnAudioConfigurationChanged;
            DontDestroyOnLoad(this);
        }
        else if (this != _instance)
        {
            Destroy(this.gameObject);
        }
    }

    void OnApplicationFocus(bool hasFocus)
    {
        if (hasFocus) ApplyState();
    }

    void OnApplicationPause(bool pauseStatus)
    {
        if (!pauseStatus) ApplyState();
    }

    void OnAudioConfigurationChanged(bool deviceWasChanged)
    {
        ApplyState();
    }

    public bool IsMuted()
    {
        return PlayerPrefs.HasKey(effectsPrefsKey) && PlayerPrefs.GetInt(effectsPrefsKey) == 0;
    }

    public void Unmute()
    {
        PlayerPrefs.SetInt(effectsPrefsKey, 1);

        ApplyState();
    }

    public void Mute()
    {
        PlayerPrefs.SetInt(effectsPrefsKey, 0);

        ApplyState();
    }

    public static void PlayButtonSound()
    {
        instance.effectsAudioSource.PlayOneShot(instance.buttonSound);
    }

    void ApplyState()
    {
        if (IsMuted())
        {
            AudioListener.volume = 0;
        }
        else
        {
            AudioListener.volume = 1;
        }
    }
}

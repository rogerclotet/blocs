using UnityEngine;
using UnityEngine.UI;

public class GooglePlayGamesButton : MonoBehaviour
{
    public GameObject button;
    public Sprite connectedSprite;
    public Sprite disconnectedSprite;

    private GooglePlayGamesManager gpgManager;

    void Start()
    {
        gpgManager = GooglePlayGamesManager.instance;

        if (!gpgManager.Enabled)
        {
            gameObject.SetActive(false);
        }
    }

    void Update()
    {
        if (gpgManager.Connected)
        {
            button.GetComponent<Image>().sprite = connectedSprite;
        }
        else
        {
            button.GetComponent<Image>().sprite = disconnectedSprite;
        }
    }

    public void ToggleConnected()
    {
        if (gpgManager.Connected)
        {
            gpgManager.SignOut();
        }
        else
        {
            gpgManager.SignIn();
        }
    }
}

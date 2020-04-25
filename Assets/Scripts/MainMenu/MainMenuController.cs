using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenuController : MonoBehaviour
{
    public GameObject continueButton;

    void Start()
    {
        SaveData saveData = SaveGameStorage.LoadGame();
        if (saveData.state == null)
        {
            continueButton.SetActive(false);
        }
    }

    public void NewGame()
    {
        GameModeSelector.Selected = GameMode.New;
        SceneManager.LoadScene("Game");
    }

    public void Continue()
    {
        GameModeSelector.Selected = GameMode.Continue;
        SceneManager.LoadScene("Game");
    }

    public void Exit()
    {
        Application.Quit();
    }
}

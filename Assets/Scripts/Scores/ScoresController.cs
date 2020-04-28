using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class ScoresController : MonoBehaviour
{
    public Text highScoreText;
    public Text scoreHistoryText;

    void Start()
    {
        SaveData data = SaveGameStorage.LoadGame();

        if (data == null)
        {
            Debug.LogError("SaveData not found in scores!");
        }

        highScoreText.text = $"{data.highScore} <color=#FFF>({data.highScoreBlocks} blocs)</color>";

        string scores = "";
        for (int i = data.history.Length - 1; i >= 0 && i > data.history.Length - 6; i--)
        {
            HistoryEntry entry = data.history[i];
            scores += $"{entry.score} <color=#FFF>({entry.blocks} blocs)</color>\n";
        }
        scoreHistoryText.text = scores;
    }

    void Update()
    {
        // Handle back button
        if (Input.GetKeyUp(KeyCode.Escape))
        {
            Back();
        }
    }

    public void Back()
    {
        SceneManager.LoadScene("MainMenu");
    }
}

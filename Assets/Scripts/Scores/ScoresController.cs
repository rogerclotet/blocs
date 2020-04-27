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

        highScoreText.text = data.highScore.ToString();

        string scores = "";
        for (int i = data.scoreHistory.Length - 1; i > 0 && i > data.scoreHistory.Length - 6; i--)
        {
            scores += data.scoreHistory[i].ToString() + "\n";
        }
        scoreHistoryText.text = scores;
    }

    public void Back()
    {
        SceneManager.LoadScene("MainMenu");
    }
}

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
        for (int i = 0; i < 5 && i < data.scoreHistory.Length; i++)
        {
            if (i != 0) scores += "\n";
            scores += data.scoreHistory[i].ToString();
        }
        scoreHistoryText.text = scores;
    }

    public void Back()
    {
        SceneManager.LoadScene("MainMenu");
    }
}

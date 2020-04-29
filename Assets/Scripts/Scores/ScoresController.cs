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

        string blocksText = string.Format(I18n.Fields["scores.high_score.blocks_text"], data.highScoreBlocks);
        blocksText = $"<color=#FFF>{blocksText}</color>";
        highScoreText.text = string.Format(I18n.Fields["scores.high_score.text"], data.highScoreBlocks, blocksText);

        string scores = "";
        for (int i = data.history.Length - 1; i >= 0 && i > data.history.Length - 6; i--)
        {
            HistoryEntry entry = data.history[i];
            string entryBlocksText = string.Format(I18n.Fields["scores.history.entry_blocks_text"], entry.blocks);
            entryBlocksText = $"<color=#FFF>{entryBlocksText}</color>";
            scores += string.Format(I18n.Fields["scores.history.entry_text"], entry.score, entryBlocksText) + "\n";
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

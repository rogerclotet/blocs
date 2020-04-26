using System;
using UnityEngine;
using UnityEngine.UI;

public class ScoreManager : MonoBehaviour
{
    public Text scoreText;
    public FloatingTextManager floatingTextManager;

    public int Score { get; set; }
    public int HighScore { get; private set; }
    public bool IsNewHighScore { get; private set; }

    private int displayedScore;
    private int displayedHighScore;
    private float lastScoreUpdate;
    private float cellSize;

    void Start()
    {
        UpdateScoreText();

        cellSize = Camera.main.scaledPixelWidth / 10;
    }

    void Update()
    {
        if (displayedHighScore == Score)
        {
            return;
        }

        UpdateScoreText();
    }

    void UpdateScoreText()
    {
        float now = Time.realtimeSinceStartup;

        if (now < lastScoreUpdate + 0.05f) return;

        lastScoreUpdate = now;

        if (displayedScore != Score)
        {
            displayedScore = Mathf.CeilToInt(Mathf.Lerp(displayedScore, Score, Time.deltaTime * 10));
        }

        if (displayedHighScore != HighScore)
        {
            displayedHighScore = Mathf.CeilToInt(Mathf.Lerp(displayedHighScore, HighScore, Time.deltaTime * 10));
        }

        scoreText.text = $"Punts: {displayedScore.ToString()}\nRécord: {displayedHighScore.ToString()}";
    }

    public void AddPiece(Piece piece, int score)
    {
        Score += score;

        UpdateHighScore();

        floatingTextManager.Show(
            $"+{score}",
            piece.transform.position + new Vector3(0, piece.Definition.rows / 2f * cellSize),
            Color.white
        );
    }

    public void AddClearedLine(int score, Vector2 position, int multiplier)
    {
        Score += score;

        UpdateHighScore();

        int sizeVariation = score * 2;

        Color col;
        ColorUtility.TryParseHtmlString("#A4C54F", out col);

        string text = "";
        if (multiplier > 1)
        {
            text += $"<color=#8aa838>x{multiplier}</color> ";
        }
        text += $"+{score}";

        floatingTextManager.Show(
            text,
            position,
            col,
            sizeVariation
        );
    }

    void UpdateHighScore()
    {
        if (Score > HighScore)
        {
            HighScore = Score;
            IsNewHighScore = true;
        }
    }

    public void Save(ref GameState state)
    {
        state.score = Score;
        state.highScore = HighScore;
    }

    public void Load(GameState state)
    {
        Score = state.score;
        HighScore = state.highScore;

        displayedScore = Score;
        displayedHighScore = HighScore;

        UpdateScoreText();
    }

    internal void LoadHighScore(int highScore)
    {
        HighScore = highScore;
        displayedHighScore = HighScore;

        UpdateScoreText();
    }
}

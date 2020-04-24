using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization.Formatters.Binary;
using System.IO;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public Text scoreText;
    public Board board;
    public NextPieces nextPieces;
    public int score;
    public int highScore;
    public GameObject postGameOverlay;
    public Text postGameText;
    public Button undoButton;

    private GameState gameState;
    private int displayedScore;
    private int displayedHighScore;
    private float lastScoreUpdate;
    private bool isNewHighScore = false;
    private int undoTimes = 0;

    void Start()
    {
        LoadGame();

        nextPieces.GeneratePieces();

        PieceDefinition[] defs = new PieceDefinition[nextPieces.Definitions.Length];
        for (int i = 0; i < defs.Length; i++)
        {
            PieceDefinition def = nextPieces.Definitions[i];
            defs[i] = def == null ? null : def.Clone();
        }
        gameState = new GameState(score, board.Export(), defs, nextPieces.RandomState, null);

        UpdateUndoButton();
    }

    void Update()
    {
        float now = Time.realtimeSinceStartup;

        if (now < lastScoreUpdate + 0.05f) return;

        lastScoreUpdate = now;

        if (displayedScore != score)
        {
            displayedScore += (int)Mathf.Sign(score - displayedScore);
        }

        if (displayedHighScore != highScore)
        {
            displayedHighScore += (int)Mathf.Sign(highScore - displayedHighScore);
        }

        scoreText.text = $"Punts: {displayedScore.ToString()}\nRécord: {displayedHighScore.ToString()}";
    }

    public void OnPiecePlaced(Piece piece)
    {
        nextPieces.OnPiecePlaced(piece);

        PieceDefinition[] defs = new PieceDefinition[nextPieces.Definitions.Length];
        for (int i = 0; i < defs.Length; i++)
        {
            PieceDefinition def = nextPieces.Definitions[i];
            defs[i] = def == null ? null : def.Clone();
        }

        // TODO limit number of saved previous states
        gameState = new GameState(score, board.Export(), defs, nextPieces.RandomState, gameState);

        if (score > highScore)
        {
            highScore = score;
            isNewHighScore = true;
        }

        SaveGame();

        CheckPossibleMoves();

        if (undoTimes > 0)
        {
            undoTimes--;
        }
        UpdateUndoButton();
    }

    void UpdateUndoButton()
    {
        undoButton.gameObject.SetActive(undoTimes < 3 && gameState.previous != null);
    }

    public void Undo()
    {
        if (gameState.previous == null) return;
        if (undoTimes > 3) return;

        gameState = gameState.previous;

        score = gameState.score;
        board.Import(gameState.board);
        nextPieces.GeneratePieces(gameState.pieces);
        nextPieces.RandomState = gameState.randomState;

        undoTimes++;
        UpdateUndoButton();
    }

    void CheckPossibleMoves()
    {
        foreach (PieceDefinition pieceDefinition in nextPieces.Definitions)
        {
            if (pieceDefinition != null && board.IsPiecePlaceable(pieceDefinition))
            {
                return;
            }
        }

        postGameText.text = $"has aconseguit\n{score} punts!";
        if (isNewHighScore)
        {
            postGameText.text += $"\n\n<color=#A4C54F>nou récord!</color>";
        }

        postGameOverlay.SetActive(true);
    }

    void SaveGame()
    {
        SaveData saveData = new SaveData() { highScore = highScore };
        BinaryFormatter bf = new BinaryFormatter();
        FileStream file = File.OpenWrite(Application.persistentDataPath + "/save.blc");
        bf.Serialize(file, saveData);
        file.Close();
    }

    void LoadGame()
    {
        BinaryFormatter bf = new BinaryFormatter();

        try
        {
            FileStream file = File.OpenRead(Application.persistentDataPath + "/save.blc");
            SaveData saveData = (SaveData)bf.Deserialize(file);
            file.Close();

            highScore = saveData.highScore;
            displayedHighScore = highScore;
        }
        catch (FileNotFoundException)
        {
            Debug.Log("Save game not found");
        }
    }

    public void Restart()
    {
        SceneManager.LoadScene("Game");
    }
}

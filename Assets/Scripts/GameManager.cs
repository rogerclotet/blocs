using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization.Formatters.Binary;
using System.IO;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public Board board;
    public ScoreManager scoreManager;
    public NextPieces nextPieces;
    public GameObject postGameOverlay;
    public Text postGameText;
    public Button undoButton;

    private GameState gameState;
    private int undoTimes = 0;
    private List<GameState> previousStates;

    void Start()
    {
        previousStates = new List<GameState>();

        LoadGame();

        nextPieces.GeneratePieces();

        PieceDefinitionData[] defs = new PieceDefinitionData[nextPieces.Definitions.Length];
        for (int i = 0; i < defs.Length; i++)
        {
            PieceDefinition def = nextPieces.Definitions[i];
            defs[i] = def == null ? null : def.Data();
        }
        gameState = new GameState()
        {
            score = scoreManager.Score,
            board = board.Export(),
            pieces = defs,
            randomState = nextPieces.RandomState,
        };

        UpdateUndoButton();
    }

    public void OnPiecePlaced(Piece piece)
    {
        nextPieces.OnPiecePlaced(piece);

        UpdateGameState();

        CheckPossibleMoves();

        if (undoTimes > 0)
        {
            undoTimes--;
        }
        UpdateUndoButton();

        SaveGame();
    }

    void UpdateGameState()
    {
        PieceDefinitionData[] defs = new PieceDefinitionData[nextPieces.Definitions.Length];
        for (int i = 0; i < defs.Length; i++)
        {
            PieceDefinition def = nextPieces.Definitions[i];
            defs[i] = def == null ? null : def.Data();
        }

        if (previousStates.Count > 2)
        {
            previousStates.RemoveAt(0);
        }
        previousStates.Add(gameState);

        gameState = new GameState()
        {
            score = scoreManager.Score,
            board = board.Export(),
            pieces = defs,
            randomState = nextPieces.RandomState
        };
    }

    void UpdateUndoButton()
    {
        undoButton.gameObject.SetActive(undoTimes < 3 && previousStates.Count > 0);
    }

    public void Undo()
    {
        if (previousStates.Count == 0) return;
        if (undoTimes > 3) return;

        gameState = previousStates[previousStates.Count - 1];
        previousStates.RemoveAt(previousStates.Count - 1);

        scoreManager.Load(gameState);
        board.Import(gameState.board);

        PieceDefinition[] pieces = new PieceDefinition[gameState.pieces.Length];
        for (int i = 0; i < gameState.pieces.Length; i++)
        {
            pieces[i] = gameState.pieces[i] == null ? null : gameState.pieces[i].ToDefinition();
        }
        nextPieces.GeneratePieces(pieces);
        nextPieces.RandomState = gameState.randomState;

        undoTimes++;
        UpdateUndoButton();

        SaveGame();
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

        postGameText.text = $"has aconseguit\n{scoreManager.Score} punts!";
        if (scoreManager.IsNewHighScore)
        {
            postGameText.text += $"\n\n<color=#A4C54F>nou récord!</color>";
        }

        postGameOverlay.SetActive(true);
    }

    void SaveGame()
    {
        scoreManager.Save(ref gameState);
        SaveData saveData = new SaveData()
        {
            state = gameState,
            previousStates = previousStates.ToArray(),
            undoTimes = undoTimes,
        };

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

            if (saveData.state != null)
            {
                gameState = saveData.state;
                board.Import(saveData.state.board);
                scoreManager.Load(saveData.state);
            }
            else
            {
                Debug.Log("Incompatible save file");
                return;
            }

            if (saveData.previousStates != null)
            {
                previousStates = new List<GameState>(saveData.previousStates);
            }

            undoTimes = saveData.undoTimes;
        }
        catch (FileNotFoundException)
        {
            Debug.Log("Save game not found");
        }
    }

    public void Restart()
    {
        previousStates.Clear();
        gameState = new GameState();
        undoTimes = 0;

        SaveGame();

        SceneManager.LoadScene("Game");
    }
}

using System.IO;
using System.Runtime.Serialization.Formatters.Binary;
using UnityEngine;

public static class SaveGameStorage
{
    private const string fileName = "save.blc";

    public static void SaveGame(SaveData data)
    {
        BinaryFormatter bf = new BinaryFormatter();
        FileStream file = File.OpenWrite(Application.persistentDataPath + "/" + fileName);
        bf.Serialize(file, data);
        file.Close();
    }

    public static SaveData LoadGame()
    {
        BinaryFormatter bf = new BinaryFormatter();

        try
        {
            FileStream file = File.OpenRead(Application.persistentDataPath + "/" + fileName);
            SaveData saveData = (SaveData)bf.Deserialize(file);
            file.Close();

            return saveData;
        }
        catch (FileNotFoundException)
        {
            Debug.Log("Save game not found");
        }

        return null;
    }
}

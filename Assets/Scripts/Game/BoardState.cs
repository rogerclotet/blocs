[System.Serializable]
public class BoardState
{
    public bool[][] filledCells;
    public int multiplier;

    public BoardState(int size)
    {
        filledCells = new bool[size][];
        for (int i = 0; i < size; i++)
        {
            filledCells[i] = new bool[size];
        }

        multiplier = 1;
    }
}

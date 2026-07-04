#if UNITY_EDITOR
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

[InitializeOnLoad]
public static class AndroidSigningSetup
{
    static AndroidSigningSetup()
    {
        string projectRoot = Directory.GetParent(Application.dataPath).FullName;
        string credentialsPath = Path.Combine(projectRoot, "keystore", "credentials.txt");
        if (!File.Exists(credentialsPath))
        {
            return;
        }

        Dictionary<string, string> values = new Dictionary<string, string>();
        foreach (string line in File.ReadAllLines(credentialsPath))
        {
            string[] parts = line.Split('=', 2);
            if (parts.Length == 2)
            {
                values[parts[0].Trim()] = parts[1].Trim();
            }
        }

        if (!values.TryGetValue("KEYSTORE_PATH", out string keystorePath) ||
            !values.TryGetValue("KEYSTORE_PASS", out string keystorePass) ||
            !values.TryGetValue("KEY_ALIAS", out string keyAlias) ||
            !values.TryGetValue("KEY_PASS", out string keyPass))
        {
            return;
        }

        string fullKeystorePath = Path.Combine(projectRoot, keystorePath);
        if (!File.Exists(fullKeystorePath))
        {
            Debug.LogWarning($"Android signing keystore not found at {fullKeystorePath}");
            return;
        }

        PlayerSettings.Android.useCustomKeystore = true;
        PlayerSettings.Android.keystoreName = fullKeystorePath;
        PlayerSettings.Android.keystorePass = keystorePass;
        PlayerSettings.Android.keyaliasName = keyAlias;
        PlayerSettings.Android.keyaliasPass = keyPass;
    }
}
#endif

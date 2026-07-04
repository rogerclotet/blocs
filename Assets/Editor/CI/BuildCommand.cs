using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class BuildCommand
{
    private const string KeystoreFileName = "keystore.keystore";
    private const string KeystorePassEnv = "KEYSTORE_PASS";
    private const string KeyAliasPassEnv = "KEY_ALIAS_PASS";
    private const string KeyAliasNameEnv = "KEY_ALIAS_NAME";
    private const string BuildOptionsEnv = "BuildOptions";
    private const string AndroidBundleVersionCodeEnv = "VERSION_BUILD_VAR";
    private const string AndroidAppBundleEnv = "BUILD_APP_BUNDLE";
    private const string ScriptingBackendEnv = "SCRIPTING_BACKEND";
    private const string VersionNumberEnv = "VERSION_NUMBER_VAR";

    public static void PerformBuild()
    {
        var buildTarget = GetBuildTarget();
        Debug.Log(":: Performing build");

        if (TryGetEnv(VersionNumberEnv, out string bundleVersionNumber))
        {
            Debug.Log($":: Setting bundleVersion to '{bundleVersionNumber}'");
            PlayerSettings.bundleVersion = bundleVersionNumber;
        }

        if (buildTarget == BuildTarget.Android)
        {
            HandleAndroidAppBundle();
            HandleAndroidBundleVersionCode();
            HandleAndroidKeystore();
        }

        string buildPath = GetBuildPath();
        string buildName = GetBuildName();
        BuildOptions buildOptions = GetBuildOptions();
        string outputPath = GetFixedBuildPath(buildTarget, buildPath, buildName);

        SetScriptingBackendFromEnv(buildTarget);

        BuildReport buildReport = BuildPipeline.BuildPlayer(
            GetEnabledScenes(),
            outputPath,
            buildTarget,
            buildOptions
        );

        if (buildReport.summary.result != BuildResult.Succeeded)
        {
            throw new Exception($"Build ended with {buildReport.summary.result} status");
        }

        Debug.Log(":: Done with build");
    }

    static string[] GetEnabledScenes()
    {
        return EditorBuildSettings.scenes
            .Where(scene => scene.enabled && !string.IsNullOrEmpty(scene.path))
            .Select(scene => scene.path)
            .ToArray();
    }

    static BuildTarget GetBuildTarget()
    {
        string buildTargetName = GetArgument("customBuildTarget");
        Debug.Log(":: Received customBuildTarget " + buildTargetName);

        if (buildTargetName != null && buildTargetName.TryConvertToEnum(out BuildTarget target))
        {
            return target;
        }

        throw new Exception($"Unknown build target '{buildTargetName}'");
    }

    static string GetBuildPath()
    {
        string buildPath = GetArgument("customBuildPath");
        Debug.Log(":: Received customBuildPath " + buildPath);

        if (string.IsNullOrEmpty(buildPath))
        {
            throw new Exception("customBuildPath argument is missing");
        }

        return buildPath;
    }

    static string GetBuildName()
    {
        string buildName = GetArgument("customBuildName");
        Debug.Log(":: Received customBuildName " + buildName);

        if (string.IsNullOrEmpty(buildName))
        {
            throw new Exception("customBuildName argument is missing");
        }

        return buildName;
    }

    static string GetFixedBuildPath(BuildTarget buildTarget, string buildPath, string buildName)
    {
        if (buildTarget == BuildTarget.Android)
        {
            buildName += EditorUserBuildSettings.buildAppBundle ? ".aab" : ".apk";
        }

        return Path.Combine(buildPath, buildName);
    }

    static BuildOptions GetBuildOptions()
    {
        if (!TryGetEnv(BuildOptionsEnv, out string envVar))
        {
            return BuildOptions.None;
        }

        BuildOptions allOptions = BuildOptions.None;
        string[] optionVars = envVar.Split(',');

        foreach (string optionVar in optionVars)
        {
            if (optionVar.TryConvertToEnum(out BuildOptions option))
            {
                allOptions |= option;
            }
            else
            {
                Debug.Log($":: Cannot convert {optionVar} to {nameof(BuildOptions)}, skipping");
            }
        }

        return allOptions;
    }

    static void SetScriptingBackendFromEnv(BuildTarget platform)
    {
        BuildTargetGroup targetGroup = BuildPipeline.GetBuildTargetGroup(platform);

        if (TryGetEnv(ScriptingBackendEnv, out string scriptingBackend) &&
            scriptingBackend.TryConvertToEnum(out ScriptingImplementation backend))
        {
            Debug.Log($":: Setting ScriptingBackend to {backend}");
            PlayerSettings.SetScriptingBackend(targetGroup, backend);
        }
    }

    static void HandleAndroidAppBundle()
    {
        if (!TryGetEnv(AndroidAppBundleEnv, out string value))
        {
            return;
        }

        if (bool.TryParse(value, out bool buildAppBundle))
        {
            EditorUserBuildSettings.buildAppBundle = buildAppBundle;
            Debug.Log($":: {AndroidAppBundleEnv}={value}");
        }
    }

    static void HandleAndroidBundleVersionCode()
    {
        if (TryGetEnv(AndroidBundleVersionCodeEnv, out string value) &&
            int.TryParse(value, out int version))
        {
            PlayerSettings.Android.bundleVersionCode = version;
            Debug.Log($":: {AndroidBundleVersionCodeEnv}={version}");
        }
    }

    static void HandleAndroidKeystore()
    {
        PlayerSettings.Android.useCustomKeystore = false;

        if (!File.Exists(KeystoreFileName))
        {
            Debug.Log($":: {KeystoreFileName} not found, using Unity debug keystore");
            return;
        }

        if (!TryGetEnv(KeystorePassEnv, out string keystorePass) ||
            !TryGetEnv(KeyAliasPassEnv, out string keyAliasPass))
        {
            Debug.Log(":: Keystore env vars missing, using Unity debug keystore");
            return;
        }

        PlayerSettings.Android.useCustomKeystore = true;
        PlayerSettings.Android.keystoreName = KeystoreFileName;

        if (TryGetEnv(KeyAliasNameEnv, out string keyAliasName))
        {
            PlayerSettings.Android.keyaliasName = keyAliasName;
        }

        PlayerSettings.Android.keystorePass = keystorePass;
        PlayerSettings.Android.keyaliasPass = keyAliasPass;
        Debug.Log(":: Using custom Android keystore from CI");
    }

    static string GetArgument(string name)
    {
        string[] args = Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length - 1; i++)
        {
            if (args[i] == "-" + name)
            {
                return args[i + 1];
            }
        }

        return null;
    }

    static bool TryGetEnv(string key, out string value)
    {
        value = Environment.GetEnvironmentVariable(key);
        return !string.IsNullOrEmpty(value);
    }

    static bool TryConvertToEnum<TEnum>(this string value, out TEnum result) where TEnum : struct
    {
        if (!Enum.IsDefined(typeof(TEnum), value))
        {
            result = default;
            return false;
        }

        result = (TEnum)Enum.Parse(typeof(TEnum), value);
        return true;
    }
}

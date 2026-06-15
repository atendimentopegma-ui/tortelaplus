using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

if (args.Length < 1 || !File.Exists(args[0])) throw new ArgumentException("Informe o caminho da ACBrLib.");
using var bridge = new AcbrBridge(Path.GetFullPath(args[0]));
string? line;
while ((line = await Console.In.ReadLineAsync()) is not null)
{
    BridgeCommand? command = null;
    try
    {
        command = JsonSerializer.Deserialize<BridgeCommand>(line.TrimStart('\uFEFF'), Json.Options);
        if (command is null) continue;
        if (command.Method.Equals("shutdown", StringComparison.OrdinalIgnoreCase)) break;
        var result = bridge.Execute(command.Method, command.Args ?? []);
        Console.WriteLine(JsonSerializer.Serialize(new BridgeResponse(command.Id, true, result.Code, result.Response, null), Json.Options));
    }
    catch (Exception ex)
    {
        Console.WriteLine(JsonSerializer.Serialize(new BridgeResponse(command?.Id, false, -999, null, ex.Message), Json.Options));
    }
    await Console.Out.FlushAsync();
}

internal sealed record BridgeCommand([property: JsonPropertyName("id")] string? Id, [property: JsonPropertyName("method")] string Method, [property: JsonPropertyName("args")] string[]? Args);
internal sealed record BridgeResponse([property: JsonPropertyName("id")] string? Id, [property: JsonPropertyName("ok")] bool Ok, [property: JsonPropertyName("code")] int Code, [property: JsonPropertyName("response")] string? Response, [property: JsonPropertyName("error")] string? Error);
internal sealed record AcbrResult(int Code, string? Response = null);
internal static class Json { public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web); }

internal sealed class AcbrBridge : IDisposable
{
    private readonly nint library;
    private readonly string prefix;
    private readonly Dictionary<string, Delegate> exports = new(StringComparer.OrdinalIgnoreCase);

    public AcbrBridge(string dllPath)
    {
        library = NativeLibrary.Load(dllPath);
        prefix = Path.GetFileName(dllPath).Contains("NFSe", StringComparison.OrdinalIgnoreCase) ? "NFSE" : "NFE";
    }

    public AcbrResult Execute(string method, string[] args) => prefix == "NFSE" ? ExecuteNFSe(method, args) : ExecuteNFe(method, args);

    private AcbrResult ExecuteNFe(string method, string[] args) => method.ToLowerInvariant() switch
    {
        "inicializar" => new(Get<Initial>("NFE_Inicializar")(Arg(args, 0), Arg(args, 1, "")), "ACBrLibNFe inicializada."),
        "finalizar" => new(Get<NoArgs>("NFE_Finalizar")()),
        "ultimoretorno" => Buffer("NFE_UltimoRetorno"),
        "carregarxml" => new(Get<OneString>("NFE_CarregarXML")(Arg(args, 0))),
        "carregareventoxml" => new(Get<OneString>("NFE_CarregarEventoXML")(Arg(args, 0))),
        "carregareventoini" => new(Get<OneString>("NFE_CarregarEventoINI")(Arg(args, 0))),
        "assinar" => new(Get<NoArgs>("NFE_Assinar")()),
        "validar" => new(Get<NoArgs>("NFE_Validar")()),
        "enviar" => BufferCall("NFE_Enviar", (StringBuilder? b, ref int s) => Get<Send>("NFE_Enviar")(Int(args, 0, 1), Bool(args, 1), Bool(args, 2, true), Bool(args, 3), b, ref s)),
        "consultar" => StringBufferCall("NFE_Consultar", Arg(args, 0)),
        "enviarevento" => BufferCall("NFE_EnviarEvento", (StringBuilder? b, ref int s) => Get<IntBuffer>("NFE_EnviarEvento")(Int(args, 0, 1), b, ref s)),
        "distribuirultnsu" => BufferCall("NFE_DistribuicaoDFePorUltNSU", (StringBuilder? b, ref int s) => Get<Distribution>("NFE_DistribuicaoDFePorUltNSU")(Int(args, 0), Arg(args, 1), Arg(args, 2, "0"), b, ref s)),
        "distribuirchave" => BufferCall("NFE_DistribuicaoDFePorChave", (StringBuilder? b, ref int s) => Get<Distribution>("NFE_DistribuicaoDFePorChave")(Int(args, 0), Arg(args, 1), Arg(args, 2), b, ref s)),
        "cancelar" => BufferCall("NFE_Cancelar", (StringBuilder? b, ref int s) => Get<Cancel>("NFE_Cancelar")(Arg(args, 0), Arg(args, 1), Arg(args, 2), Int(args, 3, 1), b, ref s)),
        "inutilizar" => BufferCall("NFE_Inutilizar", (StringBuilder? b, ref int s) => Get<Inutilize>("NFE_Inutilizar")(Arg(args, 0), Arg(args, 1), Int(args, 2), Int(args, 3), Int(args, 4), Int(args, 5), Int(args, 6), b, ref s)),
        "imprimir" => new(Get<Print>("NFE_Imprimir")(Arg(args, 0, ""), Int(args, 1, 1), Arg(args, 2, ""), "False", "", "False", "False")),
        "imprimirpdf" => new(Get<NoArgs>("NFE_ImprimirPDF")()),
        "salvarpdf" => Buffer("NFE_SalvarPDF"),
        _ => throw new InvalidOperationException($"Metodo NFe nao suportado: {method}")
    };

    private AcbrResult ExecuteNFSe(string method, string[] args) => method.ToLowerInvariant() switch
    {
        "inicializar" => new(Get<Initial>("NFSE_Inicializar")(Arg(args, 0), Arg(args, 1, "")), "ACBrLibNFSe inicializada."),
        "finalizar" => new(Get<NoArgs>("NFSE_Finalizar")()),
        "ultimoretorno" => Buffer("NFSE_UltimoRetorno"),
        "carregarxml" => new(Get<OneString>("NFSE_CarregarXML")(Arg(args, 0))),
        "carregarini" => new(Get<OneString>("NFSE_CarregarINI")(Arg(args, 0))),
        "emitir" => BufferCall("NFSE_Emitir", (StringBuilder? b, ref int s) => Get<NFSeEmit>("NFSE_Emitir")(Arg(args, 0, "1"), Int(args, 1), Bool(args, 2), b, ref s)),
        "cancelar" => StringBufferCall("NFSE_Cancelar", Arg(args, 0)),
        "consultargenerico" => StringBufferCall("NFSE_ConsultarNFSeGenerico", Arg(args, 0)),
        "consultardfe" => StringBufferCall("NFSE_ConsultarDFe", Arg(args, 0)),
        "imprimir" => new(Get<NFSePrint>("NFSE_Imprimir")(Arg(args, 0, ""), Int(args, 1, 1), Arg(args, 2, ""), Bool(args, 3))),
        "imprimirpdf" => new(Get<NoArgs>("NFSE_ImprimirPDF")()),
        "obterdanfse" => StringBufferCall("NFSE_ObterDANFSE", Arg(args, 0)),
        _ => throw new InvalidOperationException($"Metodo NFSe nao suportado: {method}")
    };

    private AcbrResult Buffer(string name) => BufferCall(name, (StringBuilder? b, ref int s) => Get<OnlyBuffer>(name)(b, ref s));
    private AcbrResult StringBufferCall(string name, string arg) => BufferCall(name, (StringBuilder? b, ref int s) => Get<OneStringBuffer>(name)(arg, b, ref s));
    private AcbrResult BufferCall(string _, Reader call)
    {
        var size = 0;
        var code = call(null, ref size);
        if (size <= 0) return new(code);
        var buffer = new StringBuilder(size);
        code = call(buffer, ref size);
        return new(code, buffer.ToString());
    }
    private T Get<T>(string name) where T : Delegate
    {
        if (exports.TryGetValue(name, out var value)) return (T)value;
        var result = Marshal.GetDelegateForFunctionPointer<T>(NativeLibrary.GetExport(library, name));
        exports[name] = result;
        return result;
    }
    private static string Arg(string[] args, int index, string? fallback = null) => index < args.Length ? args[index] : fallback ?? throw new ArgumentException($"Argumento obrigatorio ausente na posicao {index}.");
    private static int Int(string[] args, int index, int fallback = 0) => index < args.Length && int.TryParse(args[index], out var value) ? value : fallback;
    private static bool Bool(string[] args, int index, bool fallback = false) => index < args.Length && bool.TryParse(args[index], out var value) ? value : fallback;
    public void Dispose() { if (library != 0) NativeLibrary.Free(library); }

    private delegate int Reader(StringBuilder? buffer, ref int size);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int Initial(string config, string key);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int NoArgs();
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int OneString(string value);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int OnlyBuffer(StringBuilder? response, ref int size);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int OneStringBuffer(string value, StringBuilder? response, ref int size);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int IntBuffer(int value, StringBuilder? response, ref int size);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int Send(int batch, bool print, bool synchronous, bool zipped, StringBuilder? response, ref int size);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int Cancel(string key, string reason, string document, int batch, StringBuilder? response, ref int size);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int Inutilize(string document, string reason, int year, int model, int series, int start, int end, StringBuilder? response, ref int size);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int Distribution(int uf, string document, string value, StringBuilder? response, ref int size);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int Print(string printer, int copies, string protocol, string preview, string watermark, string consumer, string simplified);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int NFSeEmit(string batch, int mode, bool print, StringBuilder? response, ref int size);
    [UnmanagedFunctionPointer(CallingConvention.StdCall, CharSet = CharSet.Ansi)] private delegate int NFSePrint(string printer, int copies, string protocol, bool preview);
}

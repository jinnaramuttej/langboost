import { execFile } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const voiceKeywords = {
  Spanish: "Spanish",
  French: "French",
  German: "German",
  Japanese: "Japanese",
  Italian: "Italian",
  Portuguese: "Portuguese",
  Korean: "Korean",
  Chinese: "Chinese",
  English: "English",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encodePowerShell = (script) => Buffer.from(script, "utf16le").toString("base64");

const escapePowerShellString = (value) => String(value).replace(/'/g, "''");

export async function POST(request) {
  const tempPath = join(tmpdir(), `languageboost-${randomUUID()}.wav`);

  try {
    const { text, language } = await request.json();
    const trimmed = String(text || "").trim().slice(0, 400);

    if (!trimmed) {
      return Response.json({ ok: false, error: "Missing text" }, { status: 400 });
    }

    const voiceKeyword = voiceKeywords[language] || voiceKeywords.English;
    const script = `
$text = '${escapePowerShellString(trimmed)}'
$voiceKeyword = '${escapePowerShellString(voiceKeyword)}'
$output = '${escapePowerShellString(tempPath)}'
$stream = New-Object -ComObject SAPI.SpFileStream
$stream.Open($output, 3, $false)
$voice = New-Object -ComObject SAPI.SpVoice
$voices = @($voice.GetVoices())
$selected = $voices | Where-Object { $_.GetDescription() -like "*$voiceKeyword*" } | Select-Object -First 1
if ($selected) { $voice.Voice = $selected }
$voice.AudioOutputStream = $stream
$voice.Rate = 0
$null = $voice.Speak($text)
$stream.Close()
Write-Output 'ok'
`;

    const encoded = encodePowerShell(script);
    await execFileAsync("powershell.exe", ["-NoProfile", "-EncodedCommand", encoded], {
      windowsHide: true,
      timeout: 10000,
    });

    const buffer = await readFile(tempPath);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Local speech route failed", error);
    return Response.json({ ok: false, error: "Speech route failed" }, { status: 500 });
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}

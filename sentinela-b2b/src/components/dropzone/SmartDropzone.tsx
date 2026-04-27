"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileCode2, FileText, Loader2, CheckCircle, AlertCircle, Cpu, Brain } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type DropzoneMode = "fiscal" | "licitacao" | "bancaria";

interface SmartDropzoneProps {
  mode: DropzoneMode;
  onFiles: (files: File[]) => void;
  processing?: boolean;
  progress?: number;
  className?: string;
}

const modeConfig = {
  fiscal: {
    accept: { "text/xml": [".xml"], "application/xml": [".xml"] },
    multiple: true,
    label: "Arraste XMLs de NFe aqui",
    sublabel: "Processamento 100% local — seus dados nunca saem do computador",
    icon: FileCode2,
    engineLabel: "Engine C++ / WASM",
    engineColor: "text-profit",
    engineBg: "bg-profit/10",
    hint: "Suporte a múltiplos arquivos XML e pacotes ZIP com NFes",
  },
  licitacao: {
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    label: "Arraste o PDF do Edital aqui",
    sublabel: "Análise por Inteligência Artificial — Gemini 1.5 Pro",
    icon: FileText,
    engineLabel: "Gemini AI (Lei 14.133/2021)",
    engineColor: "text-risk",
    engineBg: "bg-risk/10",
    hint: "Arquivos PDF de editais do ComprasNet, BEC ou qualquer portal",
  },
  bancaria: {
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "text/plain": [".ofx", ".txt"],
    },
    multiple: true,
    label: "Arraste extratos bancários aqui",
    sublabel: "Análise de tarifas e cobranças indevidas",
    icon: FileText,
    engineLabel: "Gemini AI (Res. CMN 3.919)",
    engineColor: "text-risk",
    engineBg: "bg-risk/10",
    hint: "PDFs de extrato, CSV OFX ou arquivos .OFX exportados do banco",
  },
};

export function SmartDropzone({
  mode,
  onFiles,
  processing = false,
  progress = 0,
  className,
}: SmartDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const cfg = modeConfig[mode];

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length === 0) return;
      setFileNames(accepted.map((f) => f.name));
      onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: cfg.accept,
    multiple: cfg.multiple,
    maxSize: 50 * 1024 * 1024,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
    onDropAccepted: () => setDragOver(false),
    disabled: processing,
  });

  const Icon = cfg.icon;
  const EngineIcon = mode === "fiscal" ? Cpu : Brain;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden",
        "flex flex-col items-center justify-center min-h-72 p-10",
        "select-none",
        isDragActive || dragOver
          ? "border-profit bg-profit/5 scale-[1.01] profit-glow-border"
          : "border-border hover:border-profit/40 bg-surface hover:bg-surface/80",
        processing ? "pointer-events-none opacity-90" : "",
        className
      )}
    >
      <input {...getInputProps()} />

      {/* Laser scanning effect — active during processing */}
      {processing && (
        <>
          <div className="laser-line" />
          <div className="laser-glow" />
        </>
      )}

      {/* Idle / drag state */}
      {!processing && (
        <div className="flex flex-col items-center text-center gap-4 animate-float-up">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              "border border-border transition-all duration-300",
              isDragActive ? "bg-profit/20 border-profit/50" : "bg-background"
            )}
          >
            {isDragActive ? (
              <Icon className="w-7 h-7 text-profit" />
            ) : (
              <Upload className="w-7 h-7 text-muted" />
            )}
          </div>

          <div>
            <p
              className={cn(
                "text-lg font-semibold transition-colors",
                isDragActive ? "text-profit" : "text-foreground"
              )}
            >
              {isDragActive ? "Solte aqui!" : cfg.label}
            </p>
            <p className="text-sm text-muted mt-1">{cfg.sublabel}</p>
          </div>

          {/* Engine badge */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-xs font-medium",
              cfg.engineBg,
              cfg.engineColor
            )}
          >
            <EngineIcon className="w-3 h-3" />
            {cfg.engineLabel}
          </div>

          <p className="text-xs text-muted/70 max-w-sm">{cfg.hint}</p>
        </div>
      )}

      {/* Processing state */}
      {processing && (
        <ProcessingDisplay
          mode={mode}
          progress={progress}
          fileNames={fileNames}
          EngineIcon={EngineIcon}
          engineLabel={cfg.engineLabel}
          engineColor={cfg.engineColor}
        />
      )}
    </div>
  );
}

function ProcessingDisplay({
  mode,
  progress,
  fileNames,
  EngineIcon,
  engineLabel,
  engineColor,
}: {
  mode: DropzoneMode;
  progress: number;
  fileNames: string[];
  EngineIcon: React.ComponentType<{ className?: string }>;
  engineLabel: string;
  engineColor: string;
}) {
  const isFiscal = mode === "fiscal";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      {/* Spinner */}
      <div className="relative">
        <div
          className={cn(
            "w-16 h-16 rounded-full border-2 border-dashed animate-spin-slow",
            isFiscal ? "border-profit/40" : "border-risk/40"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {progress === 100 ? (
            <CheckCircle className="w-6 h-6 text-profit" />
          ) : (
            <EngineIcon className={cn("w-6 h-6", engineColor)} />
          )}
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-base font-semibold text-foreground">
          {progress === 100
            ? "Análise concluída!"
            : isFiscal
            ? "Processando com C++ Engine..."
            : "Consultando Gemini AI..."}
        </p>
        {fileNames.length > 0 && (
          <p className="text-xs text-muted mt-1 truncate max-w-xs">
            {fileNames.length === 1
              ? fileNames[0]
              : `${fileNames.length} arquivos`}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-1">
        <div className="flex justify-between text-xs text-muted">
          <span className={cn("font-medium", engineColor)}>{engineLabel}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-background rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isFiscal ? "bg-profit" : "bg-risk"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isFiscal && (
        <p className="text-xs text-muted/60 text-center">
          Verificando NCMs contra tabela monofásica — zero dados transmitidos
        </p>
      )}
    </div>
  );
}

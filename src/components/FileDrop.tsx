import React, { useCallback, useState } from "react";

type Props = {
  onFile: (f: File) => void;
};

export default function FileDrop({ onFile }: Props) {
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      style={{
        border: "2px dashed #cbd5e1",
        borderRadius: 12,
        padding: 20,
        background: drag ? "#eef2ff" : "#fafafa",
        textAlign: "center",
        cursor: "pointer"
      }}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xlsx,.xlsm";
        input.onchange = () => {
          const f = input.files?.[0];
          if (f) onFile(f);
        };
        input.click();
      }}
    >
      <b>Drop an Excel workbook here</b>
      <div className="text-dim">.xlsx / .xlsm (TB, IA, Provisions, Deferred Tax, Proof, Tax Comp)</div>
    </div>
  );
}

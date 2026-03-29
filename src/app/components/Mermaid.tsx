"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

let mermaidInitialized = false;
let renderCount = 0;

function ensureInit() {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "sans-serif",
    });
    mermaidInitialized = true;
  }
}


function sanitizeMermaid(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      if (line.trim().startsWith("%%") || line.trim().startsWith("---")) return line;

      line = line.replace(
        /(\w+)\[([^\]"]*\([^\]]*)\]/g,
        (_match, id, content) => `${id}["${content}"]`
      );

      // Also handle {}, (()), etc. node shapes with parens inside
      line = line.replace(
        /(\w+)\(([^)"]*\([^)]*)\)/g,
        (_match, id, content) => `${id}("${content}")`
      );

      // 2. Fix edge labels:  |Text (with parens)|
      //    Match pipe-delimited labels that contain parentheses but no quotes
      line = line.replace(
        /\|([^|"]*\([^|]*)\|/g,
        (_match, content) => `|"${content}"|`
      );

      return line;
    })
    .join("\n");
}

async function renderMermaidToSvg(code: string): Promise<string> {
  ensureInit();

  const sanitized = sanitizeMermaid(code);

  // Generate a guaranteed unique ID for every single render call
  const uniqueId = `mmd_${Date.now()}_${++renderCount}_${Math.random().toString(36).slice(2, 7)}`;

  // Create a temporary container off-screen for Mermaid to work in
  const tempContainer = document.createElement("div");
  tempContainer.id = `d${uniqueId}`;
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "-9999px";
  document.body.appendChild(tempContainer);

  try {
    const { svg } = await mermaid.render(uniqueId, sanitized);
    return svg;
  } finally {
    // Aggressively clean up ALL artifacts Mermaid leaves behind
    tempContainer.remove();
    const svgEl = document.getElementById(uniqueId);
    if (svgEl) svgEl.remove();
    const dEl = document.getElementById(`d${uniqueId}`);
    if (dEl) dEl.remove();
  }
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    if (!chart) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    renderMermaidToSvg(chart)
      .then((svg) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setStatus("done");
        }
      })
      .catch((err) => {
        console.error("Mermaid render failed:", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (status === "error") {
    return (
      <div className="w-full p-3 bg-red-100 text-red-600 rounded-md text-sm text-center">
        Could not render diagram.
      </div>
    );
  }

  return (
    <div className="w-full">
      {status === "loading" && (
        <div className="w-full flex justify-center py-4 text-gray-400 text-sm animate-pulse">
          Rendering diagram...
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full flex justify-center overflow-auto"
        style={{ display: status === "done" ? "flex" : "none" }}
      />
    </div>
  );
};

export default Mermaid;

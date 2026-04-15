"use client";

interface PrototypeFrameProps {
  html: string;
}

export function PrototypeFrame({ html }: PrototypeFrameProps) {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
        <iframe
          srcDoc={html}
          sandbox="allow-same-origin"
          className="w-full h-full border-0 bg-white"
          title="原型预览"
        />
      </div>
    </div>
  );
}

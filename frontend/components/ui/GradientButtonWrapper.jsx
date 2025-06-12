// components/GradientButtonWrapper.jsx

"use client"

import { Button } from "@/components/ui/button"

export default function GradientButtonWrapper({ children, ...props }) {
  return (
    <div className="relative group" {...props}>
      <div
        className="absolute -inset-1.5 rounded-xl opacity-0 blur-sm group-hover:opacity-90 z-0 transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg, #2563eb, #9333ea)",
        }}
      />
      <div className="relative z-10">
        {children || <Button />}
      </div>
    </div>
  )
}

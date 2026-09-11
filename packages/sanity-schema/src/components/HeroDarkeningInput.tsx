import React from "react";
import { set, type NumberInputProps } from "sanity";

export default function HeroDarkeningInput({
  value = 0,
  onChange,
  readOnly,
  elementProps,
}: NumberInputProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <input
        {...elementProps}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={readOnly}
        aria-valuetext={`${value}% darkening`}
        onChange={(event) => onChange(set(Number(event.currentTarget.value)))}
        style={{ flex: 1, minWidth: 0 }}
      />
      <output htmlFor={elementProps.id} style={{ minWidth: "4ch", textAlign: "right" }}>
        {value}%
      </output>
    </div>
  );
}

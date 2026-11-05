export function ConstructedArt({ type }: { type: "garden" | "workshop" }) {
  return (
    <svg viewBox="0 0 200 190" aria-hidden="true" fill="none">
      <path d="m10 130 90-45 90 45-90 45Z" fill="#8b8497" />
      <path d="m10 130 90 45 90-45v9l-90 45-90-45Z" fill="#4b4c61" />
      {type === "garden" ? (
        <>
          <path d="m25 129 75-38 75 38-75 38Z" fill="#497064" />
          <path
            d="m42 129 58-29 58 29-58 29Z"
            stroke="#c4b79e"
            strokeWidth="9"
          />
          {[
            [65, 112],
            [128, 127],
            [95, 145],
          ].map(([x, y]) => (
            <g key={x}>
              <path d={`M${x} ${y}v-25`} stroke="#9d8980" strokeWidth="4" />
              <path d={`m${x} ${y - 63}-20 34 20 12 20-12Z`} fill="#92b38b" />
              <path d={`m${x} ${y - 63}20 34-20 12Z`} fill="#597c65" />
            </g>
          ))}
        </>
      ) : (
        <>
          <path d="m37 80 65 33v51l-65-33Z" fill="#8d6f6d" />
          <path d="m102 113 62-31v50l-62 32Z" fill="#5b4c60" />
          <path d="m29 80 68-60 75 57-70 35Z" fill="#666278" />
          <path d="m97 20 75 57-70 35Z" fill="#44445d" />
          <path d="m60 112 16 8v28l-16-8Z" fill="#e9bc84" />
          <path d="m119 128 15-7v16l-15 7Z" fill="#e9bc84" />
          <path d="M140 56V23l13 6v36Z" fill="#8c7c89" />
        </>
      )}
    </svg>
  );
}

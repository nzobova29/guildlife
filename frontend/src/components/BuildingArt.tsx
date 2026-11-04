import type { BuildingKind } from "../data/demo";

// Orthographic 2:1 projection; all four buildings share their footprint and anchor.
export function BuildingArt({ kind }: { kind: BuildingKind }) {
  const lab = kind === "lab";
  const guild = kind === "guild";
  const hall = kind === "hall";
  const left = guild ? "#725b60" : lab ? "#50516e" : "#777587";
  const right = guild ? "#493c4e" : "#414157";
  const light = lab ? "#b8a1f8" : "#f4c88f";
  return (
    <svg viewBox="0 0 240 250" fill="none" aria-hidden="true">
      <ellipse cx="121" cy="221" rx="97" ry="22" fill="#101421" opacity=".45" />
      <path d="M15 198 120 145 225 198 120 251Z" fill="#7d7c87" />
      <path d="M15 198 120 251 120 242 15 190Z" fill="#555568" />
      <path d="M120 251 225 198 225 190 120 242Z" fill="#373c50" />
      <path d="M28 182 120 136 212 182 120 228Z" fill="#9993a0" />
      <path d="M40 80 120 120 120 218 40 178Z" fill={left} />
      <path d="M120 120 200 80 200 178 120 218Z" fill={right} />
      <path d="M34 76 120 33 206 76 120 119Z" fill="#a5a1b1" />
      <path d="M34 76 120 119 120 128 34 85Z" fill="#858196" />
      <path d="M120 119 206 76 206 85 120 128Z" fill="#5a596f" />
      <path d="M47 76 120 40 193 76 120 112Z" fill="#56566f" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          {[0, 1, 2, 3].map((col) => (
            <g key={col}>
              <path
                d={`M${49 + col * 18} ${100 + row * 25 + col * 9}v15l9 4.5v-15Z`}
                fill={(col + row) % 3 === 0 ? "#393b50" : light}
              />
              <path
                d={`M${132 + col * 17} ${142 + row * 23 - col * 8.5}v13l8 -4v-13Z`}
                fill={(col + row) % 3 === 1 ? "#292e42" : light}
                opacity=".8"
              />
            </g>
          ))}
        </g>
      ))}
      <path d="M80 120 101 130.5 101 198 80 187.5Z" fill="#7750a8" />
      <path d="m86 142 9 4.5v10l-9-4.5Z" stroke="#d0b5f8" strokeWidth="1.4" />
      <path d="M48 169 120 205 199 166" stroke="#aea0a2" strokeWidth="3" />
      <path d="M101 178 119 187 119 218 101 209Z" fill="#292a3e" />
      <path d="M104 183 116 189 116 214 104 208Z" fill="#e7b583" opacity=".7" />
      <path d="m92 212 28 14 24-12v5l-24 12-28-14Z" fill="#beb0aa" />
      <path d="m88 219 32 16 28-14v5l-28 14-32-16Z" fill="#8b8596" />
      {hall ? (
        <g>
          <path d="M91 40 119 54 119 108 91 94Z" fill="#aca0a3" />
          <path d="M119 54 147 40 147 94 119 108Z" fill="#6c647a" />
          <path d="m84 42 35-42 35 42-35 18Z" fill="#43465f" />
          <path d="m119 0 35 42-35 18Z" fill="#34364e" />
          <ellipse
            cx="105"
            cy="70"
            rx="8"
            ry="11"
            transform="rotate(-22 105 70)"
            fill="#f4d59a"
          />
          <path d="M105 63v8l5 5" stroke="#535063" strokeWidth="2" />
          <path
            d="M119 2v-18m0 0 22 8-22 5"
            stroke="#bea1eb"
            strokeWidth="2"
            fill="#946cb8"
          />
        </g>
      ) : lab ? (
        <g>
          <path d="M80 74 108 88 152 66 124 52Z" fill="#79748e" />
          <path d="m112 66 12-29 3 27" stroke="#b7b4c8" strokeWidth="3" />
          <path d="M100 23q5 40 43 22Z" fill="#bbb6c8" />
          <path d="m99 23 44 22" stroke="#e1d8e8" strokeWidth="2" />
          <path d="M155 80V38" stroke="#81819a" strokeWidth="3" />
          <circle cx="155" cy="38" r="4" fill="#bda3ff" />
        </g>
      ) : (
        <g>
          <path
            d="M61 66 119 37 175 65 119 93Z"
            fill={guild ? "#4b4156" : "#75758e"}
          />
          <path d="M61 66 119 93v10L61 74Z" fill="#44455e" />
          <path d="M119 93 175 65v9l-56 29Z" fill="#35374b" />
          <path d="M87 58 113 45 131 54 105 67Z" fill="#aaa3b5" />
          <path d="M87 58v12l18 9V67Z" fill="#6c6781" />
          <path d="M105 67v12l26-13V54Z" fill="#4e4b66" />
        </g>
      )}
      <path d="M33 190v-36m0 2 9-5" stroke="#3b3b50" strokeWidth="3" />
      <path d="M36 150h9v8h-9Z" fill="#ffe1aa" />
      <circle cx="41" cy="154" r="12" fill="#ffce8c" opacity=".1" />
      <path d="M190 186v-18" stroke="#666259" strokeWidth="4" />
      <path d="m190 140-14 26 14 9 14-9Z" fill="#4f7668" />
      <path d="m190 140 14 26-14 9Z" fill="#36594f" />
    </svg>
  );
}

import { ArrowUpRight, Compass, Plus, Moon } from "lucide-react";
import { buildings, type Page } from "../data/demo";
import { ConstructedArt } from "./ConstructedArt";
import type { CityBuilding } from "../api/game";
import { BuildingArt } from "./BuildingArt";

function Tree({
  x,
  y,
  pink = false,
}: {
  x: number;
  y: number;
  pink?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="7" rx="13" ry="6" fill="#1b2332" opacity=".6" />
      <path d="M0 5v-25" stroke="#7e746f" strokeWidth="4" />
      <path d="m0-47-16 28 16 9 16-9Z" fill={pink ? "#a77794" : "#4e786c"} />
      <path d="m0-47 16 28-16 9Z" fill={pink ? "#805d7b" : "#345b55"} />
    </g>
  );
}

export function CityMap({
  onNavigate,
  constructed = [],
}: {
  onNavigate: (page: Page) => void;
  constructed?: CityBuilding[];
}) {
  return (
    <section className="city-map" aria-label="Интерактивная карта города">
      <div className="map-caption">
        <span className="live-dot" />
        <div>
          <strong>Северный квартал</strong>
          <small>Твоя точка отсчёта</small>
        </div>
      </div>
      <span className="map-weather">
        <Moon size={15} /> Тихий вечер
      </span>
      <div className="map-stage">
        <svg
          className="ground"
          viewBox="0 0 960 700"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="city-halo">
              <stop stopColor="#5f527e" stopOpacity=".4" />
              <stop offset="1" stopColor="#171c2b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="water" x2="1" y2="1">
              <stop stopColor="#293c50" />
              <stop offset="1" stopColor="#1a263b" />
            </linearGradient>
            <pattern
              id="pavers"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 0h28v28"
                stroke="#6c6b7b"
                strokeWidth=".6"
                fill="none"
              />
            </pattern>
          </defs>
          <ellipse cx="480" cy="385" rx="480" ry="330" fill="url(#city-halo)" />
          <path d="M38 366 483 144 926 366 483 589Z" fill="#3c4154" />
          <path d="M38 366v24l445 223v-24Z" fill="#303246" />
          <path d="M483 589v24l443-223v-24Z" fill="#232a3b" />
          <g transform="matrix(1 .5 -1 .5 483 151)">
            <path d="M0 0H435V435H0Z" fill="#4e5360" />
            <path d="M0 0H435V435H0Z" fill="url(#pavers)" />
            <path d="M0 190H435V245H0Z" fill="#303748" />
            <path d="M190 0H240V435H190Z" fill="#303748" />
            <path
              d="M0 216H435M215 0V435"
              stroke="#c3b6a5"
              strokeWidth="2"
              strokeDasharray="12 14"
              opacity=".5"
            />
            <path
              d="M0 185H185V0M245 0V185H435M0 250H185V435M245 435V250H435"
              stroke="#94909b"
              strokeWidth="6"
            />
            <path
              d="M22 22H167V166H22ZM265 22H411V166H265ZM22 267H165V410H22Z"
              fill="#63616d"
            />
            <path d="M270 270H405V405H270Z" fill="#414f50" />
            <path
              d="M280 280H395V395H280Z"
              stroke="#b39add"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} fill="#aaa7af" opacity=".7">
                <path d={`M${190 + i * 10} 167h5v15h-5Z`} />
                <path d={`M${190 + i * 10} 253h5v15h-5Z`} />
              </g>
            ))}
            <path d="M0 440H450V488H0Z" fill="url(#water)" />
            <path
              d="M14 454h75m60 19h95m-210-5h40m218-9h50m35 19h45"
              stroke="#8194a5"
              strokeWidth="2"
              opacity=".3"
            />
            <path d="M0 440H450" stroke="#a39796" strokeWidth="7" />
          </g>
          {[
            [475, 193],
            [438, 211],
            [388, 236],
            [695, 290],
            [742, 314],
            [796, 341],
            [162, 369],
            [202, 394],
            [371, 493],
            [415, 517],
            [582, 528],
            [625, 507],
            [666, 485],
            [481, 343],
          ].map(([x, y], i) => (
            <Tree key={i} x={x} y={y} pink={i === 11 || i === 13} />
          ))}
          {[
            [349, 349],
            [560, 251],
            [527, 493],
            [746, 403],
            [268, 452],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <ellipse cy="2" rx="13" ry="6" fill="#e7b587" opacity=".14" />
              <path d="M0 0v-38h9" stroke="#222a3c" strokeWidth="3" />
              <path d="M5-40h8v7H5Z" fill="#fbd7a2" />
            </g>
          ))}
        </svg>
        {buildings.map((building) => (
          <button
            key={building.kind}
            className={`building building-${building.kind}`}
            style={{ left: `${building.x}%`, top: `${building.y}%` }}
            aria-label={`Открыть: ${building.name}`}
            onClick={() => onNavigate(building.page)}
          >
            <BuildingArt kind={building.kind} />
            <span className="building-label">
              <strong>{building.name}</strong>
              <ArrowUpRight size={13} />
              <small>{building.purpose}</small>
            </span>
          </button>
        ))}
        {constructed.length ? (
          <button
            className="constructed-hotspot"
            aria-label={`Открыть: ${constructed[0].building_type === "garden" ? "Городской сад" : "Мастерская"}`}
            onClick={() => onNavigate("build")}
          >
            <ConstructedArt type={constructed[0].building_type} />
            <span>
              {constructed[0].building_type === "garden"
                ? "Городской сад"
                : "Мастерская"}
            </span>
          </button>
        ) : (
          <button
            className="plot-hotspot"
            aria-label="Открыть: Свободный участок"
            onClick={() => onNavigate("build")}
          >
            <Plus size={21} />
            <span>Свободный участок</span>
          </button>
        )}
      </div>
      <div className="map-bottom">
        <span>
          <Compass size={16} /> Выбери здание и сделай первый шаг
        </span>
        <span className="map-scale">
          {constructed.length ? "Город стал больше" : "4 здания · 1 участок"}
        </span>
      </div>
    </section>
  );
}

import { LuvDivider, LuvIcon } from "luv-ui";
import type { Weather, WeatherType } from "../../../lib/api";

/** `hour` é 0–24, fracionário (ver docs/technical/relogio-do-mundo.md) — converte pra "HH:MM" do relógio de 24h do jogo. */
export function formatGameTime(hour: number): string {
    const totalMinutes = Math.round(hour * 60);
    const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
    const hh = Math.floor(wrapped / 60);
    const mm = wrapped % 60;

    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// Semana de jogo (ver docs/technical/relogio-do-mundo.md) — não tem relação
// com o calendário real, então o nome de cada `weekday` é só uma convenção
// nossa (dia 1 do jogo = `weekday` 0 = "Segunda").
const WEEKDAY_NAMES = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

/** `weekday` é 0–6, `(day - 1) % 7` (ver docs/technical/relogio-do-mundo.md). */
export function formatWeekday(weekday: number): string {
    return WEEKDAY_NAMES[weekday];
}

// Clima é só cosmético nesta fase — não afeta jogabilidade (ver
// docs/technical/clima-e-temperatura.md). Luvia é uma cidade chuvosa (ver
// docs/game-design/city-and-world.md), mas ainda não existe chuva visual.
const WEATHER_LABELS: Record<WeatherType, string> = {
    sunny: "Ensolarado",
    rainy: "Chuvoso",
    foggy: "Neblina",
};

const WEATHER_ICONS: Record<WeatherType, string> = {
    sunny: "wb_sunny",
    rainy: "rainy",
    foggy: "cloud",
};

const WEATHER_COLORS: Record<string, string> = {
    sunny: "yellow",
    rainy: "blue",
    foggy: "grey"
}

export function formatWeather(weather: Weather): string {
    return WEATHER_LABELS[weather.type];
}

type WorldClockPanelProps = {
    /** `null` até a primeira sincronização com o backend resolver (ver useWorldClock.ts). */
    hour: number | null;
    weekday: number | null;
    weather: Weather | null;
};

export function WorldClockPanel({ hour, weekday, weather }: WorldClockPanelProps) {
    return (
        <div className="card pixel border-16 p-8 px-16 d-flex gap-8 items-center pointer-events-auto">
            <div className="pr-8">
                <LuvIcon name={weather === null ? "cloud" : WEATHER_ICONS[weather.type]} size={32} className={weather ? 'text-game-' + WEATHER_COLORS[weather.type] : "placeholder"} />
            </div>
            <div className="d-flex items-center gap-8">
                <div className="d-flex flex-col items-start">
                    <div className="d-flex gap-8 items-center">
                        <span className="text-text">{weather === null ? "--°C" : `${weather.temperature}°C`}</span>
                        ·
                        <span className="text-text">{weather === null ? "" : formatWeather(weather)}</span>
                    </div>
                    <span className="text-placeholder text-size-12">{weekday === null ? "" : formatWeekday(weekday)}</span>
                </div>
            </div>

            <LuvDivider orientation="vertical" className="bg-placeholder" />

            <div className="d-flex items-center gap-8">
                <LuvIcon name="schedule" size={20} className="text-text" />
                <div className="d-flex flex-col items-start">
                    <strong className="text-text text-size-16">{hour === null ? "--:--" : formatGameTime(hour)}</strong>
                </div>
            </div>
        </div>
    );
}

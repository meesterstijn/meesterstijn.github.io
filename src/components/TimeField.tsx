const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// Eigen 24-uurs tijdkiezer i.p.v. <input type="time">: die laat de browser/OS-locale
// soms alsnog een AM/PM-weergave tonen, ongeacht het lang-attribuut.
export const TimeField = ({
  value, onChange, onBlur, className,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
}) => {
  const [h, m] = value.split(":");
  return (
    <span className={`inline-flex items-center gap-0.5 tabular-nums ${className ?? ""}`}>
      <select
        value={h}
        onChange={e => onChange(`${e.target.value}:${m ?? "00"}`)}
        onBlur={onBlur}
        className="rounded-md border border-transparent bg-transparent outline-none hover:border-border focus:border-accent focus:bg-card"
      >
        {HOURS.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span>:</span>
      <select
        value={m}
        onChange={e => onChange(`${h}:${e.target.value}`)}
        onBlur={onBlur}
        className="rounded-md border border-transparent bg-transparent outline-none hover:border-border focus:border-accent focus:bg-card"
      >
        {MINUTES.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </span>
  );
};

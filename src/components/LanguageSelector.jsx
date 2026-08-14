import { LANGUAGES } from '../constants/languages';

export function LanguageSelector({ value, onChange, disabled }) {
  return (
    <label className="language-select">
      <span className="language-select-label">Language</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}

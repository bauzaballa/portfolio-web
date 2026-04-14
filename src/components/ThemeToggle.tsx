import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <>
      <style>{`
        .theme-switch {
          font-size: 14px;
          position: relative;
          display: inline-block;
          width: 2em;
          height: 1em;
        }
        .theme-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .theme-slider {
          box-sizing: border-box;
          border: 2px solid var(--border);
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--bg-surface);
          transition: .15s;
          border-radius: 1em;
        }
        .theme-slider:before {
          box-sizing: border-box;
          position: absolute;
          content: "";
          height: 1em;
          width: 1em;
          border: 2px solid var(--border);
          border-radius: 100%;
          left: -2px;
          bottom: -2px;
          background-color: var(--text-primary);
          transform: translateY(-0.2em);
          box-shadow: 0 0.2em 0 var(--border);
          transition: .15s;
        }
        input:checked + .theme-slider {
          background-color: var(--accent-teal);
          border-color: var(--accent-teal);
        }
        input:checked + .theme-slider:before {
          border-color: var(--accent-teal);
          box-shadow: 0 0.2em 0 var(--accent-teal);
          transform: translateX(calc(2em - 1em)) translateY(-0.2em);
        }
        input:hover + .theme-slider:before {
          transform: translateY(-0.3em);
          box-shadow: 0 0.3em 0 var(--border);
        }
        input:hover:checked + .theme-slider:before {
          transform: translateX(calc(2em - 1em)) translateY(-0.3em);
          box-shadow: 0 0.3em 0 var(--accent-teal);
        }
      `}</style>

      <label className="theme-switch">
        <input
          type="checkbox"
          checked={theme === 'light'}
          onChange={toggle}
        />
        <span className="theme-slider" />
      </label>
    </>
  )
}

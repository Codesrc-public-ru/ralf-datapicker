import { useState } from 'react';

import { DatePicker } from './components/date-picker';
import { formatInputDate } from './components/date-picker/lib/input/formatInputDate';

import styles from './App.module.css';

const SAMPLE_DATE = new Date(2026, 4, 12);

export default function App() {
  const [value, setValue] = useState<Date | null>(null);

  const selectedText = value ? formatInputDate(value) : 'No date selected';

  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="demo-title">
        <header className={styles.hero}>
          <p className={styles.kicker}>Accessible DatePicker</p>
          <h1 id="demo-title" className={styles.title}>
            Vite shell for controlled date picking.
          </h1>
          <p className={styles.copy}>
            Open dialog, move by keyboard, or clear value. Same controlled API as product
            component.
          </p>
        </header>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>Demo field</h2>
              <p className={styles.panelCopy}>Current value stays source of truth.</p>
            </div>
            <div className={styles.actions}>
              <button className={styles.secondaryButton} type="button" onClick={() => setValue(SAMPLE_DATE)}>
                Load sample
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => setValue(null)}>
                Clear
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <DatePicker locale="en-US" onChange={setValue} value={value} />
          </div>

          <p className={styles.summary} aria-live="polite">
            Selected: <strong>{selectedText}</strong>
          </p>
        </div>
      </section>
    </main>
  );
}

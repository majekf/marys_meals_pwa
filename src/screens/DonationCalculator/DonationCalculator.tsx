import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header, Button } from '../../components/shared';
import { useIdleTimer } from '../../hooks';
import styles from './DonationCalculator.module.css';

const COST_PER_MEAL = 0.11; // €0.11 per meal
const MEALS_PER_YEAR = 200; // School days per year approximately

const PRESET_AMOUNTS = [5, 10, 20, 50];

export function DonationCalculator() {
  const [amount, setAmount] = useState<number>(10);
  const [showQR, setShowQR] = useState(false);

  // Activate idle timer
  useIdleTimer();

  const calculations = useMemo(() => {
    const meals = Math.floor(amount / COST_PER_MEAL);
    const childrenForYear = Math.floor(meals / MEALS_PER_YEAR);
    const daysOfMeals = meals;
    
    return {
      meals,
      childrenForYear,
      daysOfMeals,
    };
  }, [amount]);

  const handleAmountChange = useCallback((value: number) => {
    setAmount(Math.max(0, value));
  }, []);

  const handlePresetClick = useCallback((value: number) => {
    setAmount(value);
  }, []);

  const handleDonate = useCallback(() => {
    setShowQR(true);
  }, []);

  return (
    <div className={styles.container}>
      <Header title="Kalkulačka pomoci" variant="adults" />

      <main className={styles.main}>
        {/* Amount input */}
        <motion.div
          className={styles.inputSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className={styles.label}>Suma príspevku</label>
          <div className={styles.amountInput}>
            <span className={styles.currency}>€</span>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              className={styles.input}
            />
          </div>
          
          {/* Preset buttons */}
          <div className={styles.presets}>
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                className={`${styles.presetButton} ${amount === preset ? styles.active : ''}`}
                onClick={() => handlePresetClick(preset)}
              >
                €{preset}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          className={styles.results}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={styles.resultsTitle}>Váš príspevok zabezpečí:</h2>
          
          <div className={styles.resultCards}>
            <motion.div
              className={styles.resultCard}
              key={calculations.meals}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <span className={styles.resultIcon}>🍽️</span>
              <span className={styles.resultValue}>{calculations.meals.toLocaleString()}</span>
              <span className={styles.resultLabel}>
                {calculations.meals === 1 ? 'obed' : 'obedov'}
              </span>
            </motion.div>

            {calculations.childrenForYear > 0 && (
              <motion.div
                className={styles.resultCard}
                key={`children-${calculations.childrenForYear}`}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
              >
                <span className={styles.resultIcon}>👦</span>
                <span className={styles.resultValue}>{calculations.childrenForYear}</span>
                <span className={styles.resultLabel}>
                  {calculations.childrenForYear === 1 ? 'dieťa na celý rok' : 'detí na celý rok'}
                </span>
              </motion.div>
            )}
          </div>

          <p className={styles.explanation}>
            Pri cene €{COST_PER_MEAL.toFixed(2)} za jeden obed
          </p>
        </motion.div>

        {/* Donate button */}
        <motion.div
          className={styles.donateSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="accent"
            size="xl"
            onClick={handleDonate}
            fullWidth
          >
            Prispieť €{amount} 💝
          </Button>
        </motion.div>

        {/* QR Code modal (placeholder) */}
        {showQR && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowQR(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Naskenujte QR kód</h3>
              
              {/* Placeholder QR code */}
              <div className={styles.qrPlaceholder}>
                <img 
                  src="/images/qr/donation.png" 
                  alt="QR kód pre darovanie"
                  onError={(e) => {
                    // Show placeholder if image doesn't exist
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove(styles.hidden);
                  }}
                />
                <div className={`${styles.qrFallback} ${styles.hidden}`}>
                  <span>📱</span>
                  <p>QR kód bude čoskoro k dispozícii</p>
                </div>
              </div>
              
              <p className={styles.modalText}>
                alebo navštívte <a href="https://marysmeals.sk/darovat" target="_blank" rel="noopener noreferrer">marysmeals.sk/darovat</a>
              </p>
              
              <Button variant="secondary" onClick={() => setShowQR(false)}>
                Zavrieť
              </Button>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

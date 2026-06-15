import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, Button, FeedbackOverlay } from '../../components/shared';
import { useIdleTimer } from '../../hooks';
import { useConfig } from '../../config';
import styles from './GetInvolved.module.css';

const INVOLVEMENT_OPTIONS = [
  {
    id: 'volunteer',
    icon: '🤝',
    title: 'Staň sa dobrovoľníkom',
    description: 'Pomôž pri organizovaní zbierok a podujatí',
  },
  {
    id: 'donate',
    icon: '💝',
    title: 'Pravidelný darca',
    description: 'Prispievaj mesačne a pomôž stabilne',
  },
  {
    id: 'school',
    icon: '🏫',
    title: 'Školy a organizácie',
    description: 'Zapoj svoju školu alebo firmu',
  },
  {
    id: 'spread',
    icon: '📢',
    title: 'Šír povedomie',
    description: 'Povedz o nás svojim známym',
  },
];

type OptionItem = (typeof INVOLVEMENT_OPTIONS)[0];
type View = 'options' | 'form' | 'paper' | 'qr';

interface FormData {
  email: string;
  name: string;
  interest: string;
  message: string;
}

const initialFormData: FormData = {
  email: '',
  name: '',
  interest: '',
  message: '',
};

export function GetInvolved() {
  const { config } = useConfig();
  const dataCollection = config.features.dataCollection;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedOption, setSelectedOption] = useState<OptionItem | null>(null);
  const [view, setView] = useState<View>('options');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useIdleTimer();

  const handleSelectOption = useCallback(
    (option: OptionItem) => {
      setSelectedOption(option);
      setFormData((prev) => ({ ...prev, interest: option.id }));

      if (!dataCollection) {
        if (option.id === 'donate') {
          setView('qr');
        } else {
          setView('paper');
        }
      } else {
        setView('form');
      }
    },
    [dataCollection],
  );

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email je povinný';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Neplatný formát emailu';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Meno je povinné';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submission = {
        ...formData,
        submittedAt: new Date().toISOString(),
        synced: false,
      };

      const stored = localStorage.getItem('mm_submissions') || '[]';
      const submissions = JSON.parse(stored);
      submissions.push(submission);
      localStorage.setItem('mm_submissions', JSON.stringify(submissions));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowSuccess(true);
      setFormData(initialFormData);
      setSelectedOption(null);
      setView('options');
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  const handleBack = useCallback(() => {
    setView('options');
    setSelectedOption(null);
  }, []);

  return (
    <div className={styles.container}>
      <Header title="Zapojte sa" variant="adults" />

      <main className={styles.main}>
        <AnimatePresence mode="wait">
          {view === 'options' && (
            <motion.div
              key="options"
              className={styles.content}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className={styles.intro}>
                <h1>Ako sa môžete zapojiť?</h1>
                <p>Vyberte spôsob, ktorý vám vyhovuje</p>
              </div>

              <div className={styles.optionsGrid}>
                {INVOLVEMENT_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.id}
                    className={styles.optionCard}
                    onClick={() => handleSelectOption(option)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={styles.optionIcon}>{option.icon}</span>
                    <h3 className={styles.optionTitle}>{option.title}</h3>
                    <p className={styles.optionDescription}>{option.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div
              key="form"
              className={styles.content}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button className={styles.backButton} onClick={handleBack}>
                ← Späť
              </button>

              <div className={styles.formHeader}>
                <span className={styles.formIcon}>{selectedOption?.icon}</span>
                <h2>{selectedOption?.title}</h2>
                <p>Zanechajte nám kontakt a ozveme sa vám</p>
              </div>

              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Meno *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    placeholder="Vaše meno"
                  />
                  {errors.name && <span className={styles.error}>{errors.name}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder="vas@email.sk"
                  />
                  {errors.email && <span className={styles.error}>{errors.email}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Správa (voliteľná)
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={styles.textarea}
                    placeholder="Čokoľvek nám chcete povedať..."
                    rows={3}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Odosielam...' : 'Odoslať'}
                </Button>
              </form>
            </motion.div>
          )}

          {view === 'paper' && (
            <motion.div
              key="paper"
              className={styles.content}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button className={styles.backButton} onClick={handleBack}>
                ← Späť
              </button>

              <div className={styles.paperView}>
                <span className={styles.paperOptionIcon}>{selectedOption?.icon}</span>
                <h2 className={styles.paperTitle}>{selectedOption?.title}</h2>
                <p className={styles.paperSubtitle}>Zanechajte nám kontakt a ozveme sa vám</p>

                <div className={styles.paperInstructionBox}>
                  <span className={styles.paperPencilIcon}>✏️</span>
                  <p className={styles.paperInstruction}>
                    Napíšte prosím svoj <strong>e-mail</strong> do formulára na papieri.
                  </p>
                </div>

                <p className={styles.modalText}>
                  alebo navštívte <a href="https://marysmeals.sk" target="_blank" rel="noopener noreferrer">marysmeals.sk</a>
                </p>
              </div>
            </motion.div>
          )}

          {view === 'qr' && (
            <motion.div
              key="qr"
              className={styles.content}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button className={styles.backButton} onClick={handleBack}>
                ← Späť
              </button>

              <div className={styles.qrView}>
                <span className={styles.paperOptionIcon}>{selectedOption?.icon}</span>
                <h2 className={styles.paperTitle}>{selectedOption?.title}</h2>
                <p className={styles.modalText}>Naskenujte QR kód</p>
                <div className={styles.qrCodeWrapper}>
                
                  <img
                    src="/images/qr/donation.png"
                    alt="QR kód pre darovanie"
                    className={styles.qrImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = (e.target as HTMLImageElement)
                        .nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className={styles.qrFallback}>
                    <span>📱</span>
                    <p>QR kód bude čoskoro k dispozícii</p>
                  </div>
                </div>

                <div className={styles.accountSection}>
                  <p className={styles.accountLabel}>Číslo účtu:</p>
                  <p className={styles.accountNumber}>SK24 8330 0000 0008 1560 1560</p>
                </div>

                <p className={styles.modalText}>
                  alebo navštívte <a href="https://marysmeals.sk" target="_blank" rel="noopener noreferrer">marysmeals.sk</a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FeedbackOverlay
        isVisible={showSuccess}
        type="success"
        message="Ďakujeme! Čoskoro sa vám ozveme."
        onAnimationComplete={() => setShowSuccess(false)}
      />
    </div>
  );
}

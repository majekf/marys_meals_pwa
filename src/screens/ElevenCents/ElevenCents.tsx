import { motion } from 'framer-motion';
import { Header } from '../../components/shared';
import { useIdleTimer } from '../../hooks';
import styles from './ElevenCents.module.css';

const FACTS = [
  {
    icon: '🍽️',
    title: 'Jeden obed',
    description: 'Stačí 11 centov na to, aby dieťa dostalo výživný obed v škole',
  },
  {
    icon: '📚',
    title: 'Vzdelanie',
    description: 'Školské stravovanie motivuje rodičov posielať deti do školy',
  },
  {
    icon: '🌍',
    title: 'Viac ako 3 milióny detí',
    description: 'Mary\'s Meals denne nakŕmi viac ako 3 milióny detí v 16 krajinách',
  },
  {
    icon: '💪',
    title: 'Dobrovoľníci',
    description: 'Vďaka dobrovoľníkom ide 93% darov priamo deťom',
  },
];

export function ElevenCents() {
  // Activate idle timer
  useIdleTimer();

  return (
    <div className={styles.container}>
      <Header title="11 centov" variant="adults" />

      <main className={styles.main}>
        {/* Hero section */}
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.heroPrice}>
            <span className={styles.currency}>€</span>
            <span className={styles.amount}>0.11</span>
          </div>
          <h1 className={styles.heroTitle}>Jeden obed, jedna nádej</h1>
          <p className={styles.heroSubtitle}>
            Za cenu jedného cappuccina môžete nakŕmiť dieťa celý mesiac
          </p>
        </motion.div>

        {/* Facts grid */}
        <div className={styles.factsGrid}>
          {FACTS.map((fact, index) => (
            <motion.div
              key={index}
              className={styles.factCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className={styles.factIcon}>{fact.icon}</span>
              <h3 className={styles.factTitle}>{fact.title}</h3>
              <p className={styles.factDescription}>{fact.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          className={styles.cta}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className={styles.ctaText}>
            Chcete vedieť, koľko detí môžete nakŕmiť?
          </p>
          <a href="/adults/calculator" className={styles.ctaButton}>
            Vypočítať môj príspevok →
          </a>
        </motion.div>
      </main>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConfig } from '../../config';
import { Header } from '../../components/shared';
import { useIdleTimer } from '../../hooks';
import styles from './AdultsMenu.module.css';

interface SectionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  configKey: keyof ReturnType<typeof useConfig>['config']['features']['adultsMode']['sections'];
}

const sections: SectionItem[] = [
  {
    id: 'eleven-cents',
    title: '11 centov',
    description: 'Jeden obed za 11 centov',
    icon: '💰',
    path: '/adults/eleven-cents',
    configKey: 'elevenCents',
  },
  {
    id: 'calculator',
    title: 'Kalkulačka',
    description: 'Vypočítajte vašu pomoc',
    icon: '🧮',
    path: '/adults/calculator',
    configKey: 'donationCalculator',
  },
  {
    id: 'get-involved',
    title: 'Zapojte sa',
    description: 'Ako môžete pomôcť',
    icon: '🤝',
    path: '/adults/get-involved',
    configKey: 'getInvolved',
  },
  {
    id: 'school-feeding',
    title: 'Školské stravovanie',
    description: 'Ako program funguje',
    icon: '🏫',
    path: '/adults/school-feeding',
    configKey: 'schoolFeeding',
  },
  {
    id: 'stories',
    title: 'Príbehy',
    description: 'Príbehy detí',
    icon: '📖',
    path: '/adults/stories',
    configKey: 'stories',
  },
];

export function AdultsMenu() {
  const navigate = useNavigate();
  const { config } = useConfig();
  
  // Activate idle timer
  useIdleTimer();

  // Filter sections based on config
  const enabledSections = sections.filter(
    (section) => config.features.adultsMode.sections[section.configKey]
  );

  const handleSectionClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={styles.container}>
      <Header title="Pre zvedavých" variant="adults" />
      
      <main className={styles.main}>
        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Mary's Meals Slovakia
        </motion.h2>

        <motion.p
          className={styles.intro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Pomáhame deťom získať vzdelanie prostredníctvom školského stravovania
        </motion.p>

        <div className={styles.grid}>
          {enabledSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                className={styles.sectionCard}
                onClick={() => handleSectionClick(section.path)}
              >
                <span className={styles.sectionIcon}>{section.icon}</span>
                <div className={styles.sectionText}>
                  <span className={styles.sectionTitle}>{section.title}</span>
                  <span className={styles.sectionDescription}>
                    {section.description}
                  </span>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {enabledSections.length === 0 && (
          <p className={styles.empty}>Žiadne sekcie nie sú k dispozícii.</p>
        )}
      </main>
    </div>
  );
}

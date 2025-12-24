import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const MoleculeIcon = ({ className, mode = 'navbar' }) => {
  const isHero = mode === 'hero';

  const springTransition = {
    type: 'spring',
    stiffness: 260,
    damping: 20,
  };

  const circleVariant = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        ...springTransition,
        delay: i * 0.1,
      },
    }),
  };

  const pathVariant = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        delay: i * 0.1,
      },
    }),
  };

  // Continuous animations only for Hero
  const heroContainerVariant = {
    animate: {
      y: [0, -8, 0],
      rotate: [0, 360],
      transition: {
        y: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        rotate: {
          duration: 60, // Slow organic rotation
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
  };

  return (
    <motion.svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      initial="hidden"
      animate={isHero ? ['visible', 'animate'] : 'visible'}
      whileHover={!isHero ? { rotate: 90, scale: 1.1 } : undefined} // Interactive hover for navbar
      variants={isHero ? heroContainerVariant : undefined}
    >
      {/* Central Atom */}
      <motion.circle
        cx="50"
        cy="50"
        r="12"
        variants={circleVariant}
        animate={isHero ? ['visible', 'pulse'] : 'visible'}
      >
        {isHero && (
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1; 1.1; 1"
            dur="3s"
            repeatCount="indefinite"
            additive="sum"
          />
        )}
      </motion.circle>

      {/* Bonds */}
      <motion.path
        d="M50 38 L50 20"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        variants={pathVariant}
        custom={2}
      />
      <motion.path
        d="M62 50 L80 50"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        variants={pathVariant}
        custom={2.5}
      />
      <motion.path
        d="M50 62 L50 80"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        variants={pathVariant}
        custom={3}
      />
      <motion.path
        d="M38 50 L20 50"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        variants={pathVariant}
        custom={3.5}
      />

      {/* Main Outer Atoms */}
      <motion.circle
        cx="50"
        cy="20"
        r="10"
        variants={circleVariant}
        custom={4}
      />
      <motion.circle
        cx="80"
        cy="50"
        r="10"
        variants={circleVariant}
        custom={4.5}
      />
      <motion.circle
        cx="50"
        cy="80"
        r="10"
        variants={circleVariant}
        custom={5}
      />
      <motion.circle
        cx="20"
        cy="50"
        r="10"
        variants={circleVariant}
        custom={5.5}
      />

      {/* Small Orbital Atoms */}
      <motion.circle
        cx="29"
        cy="29"
        r="8"
        variants={circleVariant}
        custom={6}
      />
      <motion.circle
        cx="71"
        cy="29"
        r="8"
        variants={circleVariant}
        custom={6.5}
      />
      <motion.circle
        cx="71"
        cy="71"
        r="8"
        variants={circleVariant}
        custom={7}
      />
      <motion.circle
        cx="29"
        cy="71"
        r="8"
        variants={circleVariant}
        custom={7.5}
      />
    </motion.svg>
  );
};

MoleculeIcon.propTypes = {
  className: PropTypes.string,
  mode: PropTypes.oneOf(['navbar', 'hero', 'static']),
};

export default MoleculeIcon;

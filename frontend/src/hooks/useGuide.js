import { useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { tourSteps } from '../guides/tourSteps';

const GUIDE_KEY = (role) => `bloodbridge_guide_shown_${role}`;

/**
 * useGuide — hook that provides:
 *   startGuide()   → manually start the tour
 *   autoStart()    → start only if not shown before for this role (call on mount)
 */
const useGuide = (role) => {
  const startGuide = useCallback(() => {
    const steps = tourSteps[role];
    if (!steps || steps.length === 0) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayOpacity: 0.6,
      smoothScroll: true,
      allowClose: true,
      progressText: 'Step {{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: '✓ Got it!',
      onDestroyStarted: () => {
        // Mark as shown when user finishes or closes
        localStorage.setItem(GUIDE_KEY(role), 'true');
        driverObj.destroy();
      },
      steps
    });

    driverObj.drive();
  }, [role]);

  const autoStart = useCallback(() => {
    const alreadyShown = localStorage.getItem(GUIDE_KEY(role));
    if (!alreadyShown) {
      // Small delay so the page elements render first
      setTimeout(() => startGuide(), 800);
    }
  }, [role, startGuide]);

  const resetGuide = useCallback(() => {
    localStorage.removeItem(GUIDE_KEY(role));
  }, [role]);

  return { startGuide, autoStart, resetGuide };
};

export default useGuide;

'use client'
import { useEffect } from 'react';

export function FontSizeSetter() {
  useEffect(() => {
    const UI_WIDTH = 750;
    const baseFontSize = 200;

    function setRootFontSize() {
      const width = document.documentElement?.clientWidth || 0;
      const fontSize = ((parseFloat(`${width}`) / UI_WIDTH) * baseFontSize).toFixed(4);
      document.documentElement.style.fontSize = fontSize + 'px';
      document.documentElement.style.setProperty('--tpx', '0.01rem');
    }
    setRootFontSize();
    window.addEventListener('resize', setRootFontSize);
    return () => window.removeEventListener('resize', setRootFontSize);
  }, []);

  return null;
}
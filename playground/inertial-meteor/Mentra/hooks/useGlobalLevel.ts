import { useState, useEffect } from 'react';
import { Progression } from '@/services/progression';

export function useGlobalLevel() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const totalXp = await Progression.getTotalXP();
    const info = Progression.getLevelInfo(totalXp);
    setXp(totalXp);
    setLevel(info.level);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { level, xp, loading, refresh };
}
